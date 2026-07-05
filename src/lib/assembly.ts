import "server-only";
import { createHash, randomUUID } from "node:crypto";
import Anthropic from "@anthropic-ai/sdk";
import { getStatute, matchPlatformChannel } from "./instruments";
import type {
  Draft,
  EvidenceItem,
  InstrumentKind,
  Intake,
} from "./types";

export const ASSEMBLY_MODEL = "claude-sonnet-4-6";

export class AssemblyError extends Error {}

const VALID_KINDS: InstrumentKind[] = [
  "state_right_of_publicity",
  "platform_tos",
  "dmca",
];

export function isInstrumentKind(value: unknown): value is InstrumentKind {
  return VALID_KINDS.includes(value as InstrumentKind);
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

// Build the preserved evidence package from the intake. Deterministic, no model
// call. Each present field becomes an item with an add-time and a fingerprint.
export function buildEvidencePackage(intake: Intake): EvidenceItem[] {
  const now = new Date().toISOString();
  const candidates: Array<Pick<EvidenceItem, "label" | "kind" | "value">> = [
    { label: "URL where the replica is hosted", kind: "hosted_url", value: intake.hostUrl },
    { label: "Host platform", kind: "platform", value: intake.platform },
    { label: "Account of what happened", kind: "incident_description", value: intake.description },
    { label: "Date the replica was found", kind: "found_date", value: intake.foundDate },
  ];
  if (intake.priorConsent === "yes" && intake.consentScope) {
    candidates.push({
      label: "Scope of prior consent",
      kind: "consent_scope",
      value: intake.consentScope,
    });
  }

  return candidates
    .filter((c) => c.value)
    .map((c) => ({
      id: randomUUID(),
      label: c.label,
      kind: c.kind,
      value: c.value,
      addedAt: now,
      fingerprint: sha256(c.value),
    }));
}

const INSTRUMENT_LABEL: Record<InstrumentKind, string> = {
  state_right_of_publicity: "State right-of-publicity demand",
  platform_tos: "Platform Terms-of-Service report",
  dmca: "DMCA takedown notice",
};

function instrumentContext(intake: Intake, kind: InstrumentKind): string {
  if (kind === "state_right_of_publicity") {
    const statute = getStatute(intake.state);
    if (statute) {
      return [
        `Instrument: a cease-and-desist / demand letter under ${statute.name}, ${statute.citation} (${statute.provision}).`,
        `Elements to reference: ${statute.elements.join(" | ")}`,
        "Register: a firm but factual demand letter addressed to the infringer or their registered agent, citing the statute and demanding the unauthorized use stop and the material be removed.",
        `Note to carry: ${statute.verifyNote}`,
      ].join("\n");
    }
    return [
      "Instrument: a cease-and-desist / demand letter under the general right of publicity for the user's state (no tailored statute on file).",
      "Register: a firm but factual demand letter. Do not invent a citation; refer to the applicable state right of publicity generally and flag that the specific statute must be verified locally.",
    ].join("\n");
  }

  if (kind === "platform_tos") {
    const channel = matchPlatformChannel(intake.platform);
    return [
      `Instrument: a report to ${channel.label} under its Terms of Service.`,
      `Channel: ${channel.channel}`,
      "Register: a clear report message to the platform's trust and safety / impersonation team, describing the unauthorized use of the user's voice or likeness and requesting removal.",
      `Note to carry: ${channel.verifyNote}`,
    ].join("\n");
  }

  // dmca
  return [
    "Instrument: a DMCA takedown notice under 17 U.S.C. § 512, addressed to the host's designated copyright agent.",
    "Required components: identification of the copyrighted work, identification of the infringing material and its location, the complainant's contact information, a good-faith-belief statement, a statement under penalty of perjury that the information is accurate and the complainant is authorized, and a signature.",
    "Register: a formal DMCA notice. Use bracketed placeholders for the complainant's details.",
    "Note to carry: DMCA covers a copied copyrighted work, not voice or likeness on its own. Verify a protected work is actually implicated.",
  ].join("\n");
}

function buildSystemPrompt(): string {
  return [
    "You are the assembly step of Deepfake Recourse. You draft a takedown or demand notice for a person whose voice or likeness was cloned without consent.",
    "",
    "Hard boundaries:",
    "- What you produce is a DRAFT for the user to review and edit. Nothing is sent from the tool. Do not address-and-send. Do not invent a real recipient email or postal address; use a clear bracketed placeholder.",
    "- Do not predict the outcome. Do not say the user will win or that the claim is guaranteed. State the facts and the demand.",
    "- Use bracketed placeholders for anything the user must supply, for example [Your full legal name], [Your contact information], [Date], [Recipient name or registered agent].",
    "- Keep the user's voice: flat declarative sentences, plain language, no em dashes doing structural work.",
    "",
    "Return JSON only. No prose, no markdown, no code fences. Exactly this shape:",
    "{",
    '  "title": string,        // short title for the notice',
    '  "recipient": string,    // the role/placeholder it is directed to',
    '  "body": string          // the full draft text, with placeholders and line breaks as \\n',
    "}",
  ].join("\n");
}

function buildUserPrompt(intake: Intake, kind: InstrumentKind): string {
  return [
    "Draft the notice for this case.",
    "",
    "Case facts:",
    JSON.stringify(
      {
        description: intake.description,
        incidentType: intake.incidentType,
        clonedWhat: intake.clonedWhat,
        hostUrl: intake.hostUrl,
        platform: intake.platform,
        foundDate: intake.foundDate,
        identifiable: intake.identifiable,
        priorConsent: intake.priorConsent,
        consentScope: intake.consentScope,
        state: intake.state,
      },
      null,
      2,
    ),
    "",
    instrumentContext(intake, kind),
    "",
    "Return the draft JSON now.",
  ].join("\n");
}

export async function runAssembly(
  intake: Intake,
  kind: InstrumentKind,
): Promise<Draft> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new AssemblyError(
      "The Anthropic API key is not configured on the server.",
    );
  }

  const client = new Anthropic({ apiKey });

  let response;
  try {
    response = await client.messages.create({
      model: ASSEMBLY_MODEL,
      max_tokens: 2000,
      system: buildSystemPrompt(),
      messages: [{ role: "user", content: buildUserPrompt(intake, kind) }],
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown error";
    throw new AssemblyError(
      `The assembly request to Anthropic failed: ${detail}`,
    );
  }

  let text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();

  if (!text) throw new AssemblyError("The assembly response was empty.");

  if (text.startsWith("```")) {
    text = text.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim();
  }
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    text = text.slice(first, last + 1);
  }

  let parsed: { title?: unknown; recipient?: unknown; body?: unknown };
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new AssemblyError("The assembly response was not valid JSON.");
  }

  const body = asString(parsed.body);
  if (!body) {
    throw new AssemblyError("The assembly response had no draft body.");
  }

  return {
    instrumentKind: kind,
    instrumentTitle: INSTRUMENT_LABEL[kind],
    title: asString(parsed.title) || INSTRUMENT_LABEL[kind],
    recipient: asString(parsed.recipient) || "[Recipient]",
    body,
    model: ASSEMBLY_MODEL,
    generatedAt: new Date().toISOString(),
    edited: false,
  };
}
