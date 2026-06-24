import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import {
  ROUTE_OUT_RESOURCES,
  getStatute,
  matchPlatformChannel,
  type RouteOutResource,
} from "./instruments";
import type {
  Confidence,
  Instrument,
  Intake,
  RoutedOut,
  TriageRead,
} from "./types";

export const TRIAGE_MODEL = "claude-sonnet-4-6";

// Thrown for any failure (missing key, API error, empty/malformed response).
// The route turns this into a visible error state, never a white screen.
export class TriageError extends Error {}

const CONFIDENCES: Confidence[] = ["high", "medium", "low"];

function asConfidence(value: unknown): Confidence {
  return CONFIDENCES.includes(value as Confidence)
    ? (value as Confidence)
    : "low";
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

// The shape we ask the model for. The model only maps facts to applicability,
// confidence, and routing. All statute text and citations come from the
// instrument library server-side, so legal facts are never model-authored.
interface ModelOutput {
  routedOut: { category: string; reason: string } | null;
  stateStatute: { applies: boolean; confidence: string; rationale: string };
  platformTos: { applies: boolean; confidence: string; rationale: string };
  dmca: { applies: boolean; confidence: string; rationale: string };
  summary: string;
}

function buildSystemPrompt(): string {
  return [
    "You are the triage step of Timbre, a tool for people whose voice or likeness was cloned without consent.",
    "You map the facts of a case to the legal instruments that may apply. You do not give legal advice and you never predict whether a case will win.",
    "",
    "Boundaries you must hold:",
    "- Timbre assembles and drafts; a human files. You never tell the user to send anything.",
    "- Mark confidence honestly. If the facts are thin or the law is unsettled, say low.",
    "- Routing out is load-bearing. If the facts indicate any of these, set routedOut and do not treat it as an ordinary right-of-publicity matter:",
    "    - ncii: nonconsensual intimate or sexual imagery.",
    "    - election_deepfake: synthetic media in an election or political campaign context.",
    "    - fraud: impersonation whose primary purpose is to defraud victims of money, such as a scam or fake investment pitch.",
    "  An ordinary unauthorized advertisement or fake endorsement is NOT fraud routing. That is the core right-of-publicity lane; keep it in scope.",
    "",
    "Return JSON only. No prose, no markdown, no code fences. The JSON must match exactly this shape:",
    "{",
    '  "routedOut": null | { "category": "ncii" | "election_deepfake" | "fraud", "reason": string },',
    '  "stateStatute": { "applies": boolean, "confidence": "high" | "medium" | "low", "rationale": string },',
    '  "platformTos": { "applies": boolean, "confidence": "high" | "medium" | "low", "rationale": string },',
    '  "dmca": { "applies": boolean, "confidence": "high" | "medium" | "low", "rationale": string },',
    '  "summary": string',
    "}",
    "",
    "Rules for each field:",
    "- If routedOut is set, still fill the other fields but keep rationales short; the UI will not draft.",
    "- stateStatute: assess whether the provided state statute applies to these facts. Do not restate the statute text; the system supplies it. Your rationale explains the fit to the facts.",
    "- platformTos: the host platform's reporting channel almost always applies. Judge confidence from how clearly the platform is identified.",
    "- dmca: applies only if a copyrightable underlying work is plausibly infringed (for example the replica copies a specific song recording or video the user holds rights in). If it is only a voice or likeness with no copied work, dmca.applies is false.",
    "- summary: two or three plain sentences. Flat declarative language. No em dashes.",
  ].join("\n");
}

function buildUserPrompt(intake: Intake): string {
  const statute = getStatute(intake.state);
  const channel = matchPlatformChannel(intake.platform);

  const statuteContext = statute
    ? `Applicable state statute for ${intake.state}: ${statute.name}, ${statute.citation}, ${statute.provision}. Covers voice: ${statute.coversVoice}. Covers image: ${statute.coversImage}. Covers digital replicas: ${statute.coversDigitalReplica}.`
    : `No tailored statute is on file for ${intake.state || "the given jurisdiction"}. Treat it as a general right of publicity that must be verified locally; cap stateStatute.confidence at low.`;

  return [
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
    statuteContext,
    `Matched platform reporting channel: ${channel.label}.`,
    "",
    "Return the triage JSON now.",
  ].join("\n");
}

function parseModelOutput(raw: string): ModelOutput {
  let text = raw.trim();
  // Defensive: strip accidental code fences even though we asked for none.
  if (text.startsWith("```")) {
    text = text.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim();
  }
  // Defensive: clip to the outermost JSON object if the model added stray text.
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    text = text.slice(first, last + 1);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new TriageError("The triage response was not valid JSON.");
  }
  if (!parsed || typeof parsed !== "object") {
    throw new TriageError("The triage response had an unexpected shape.");
  }
  return parsed as ModelOutput;
}

// Assemble the final TriageRead. Legal facts (citation, provision, elements,
// resource details) come from the library here, not from the model.
function assemble(intake: Intake, out: ModelOutput): TriageRead {
  const generatedAt = new Date().toISOString();

  if (out.routedOut) {
    const category = out.routedOut.category as RouteOutResource["category"];
    const resource = ROUTE_OUT_RESOURCES[category];
    if (resource) {
      const routedOut: RoutedOut = {
        category: resource.category,
        label: resource.label,
        reason: asString(out.routedOut.reason),
        resourceName: resource.resourceName,
        resourceDetail: resource.resourceDetail,
        resourceUrl: resource.resourceUrl,
      };
      return {
        routedOut,
        instruments: [],
        summary: asString(out.summary),
        model: TRIAGE_MODEL,
        generatedAt,
      };
    }
    // Unknown category: fall through to normal instruments rather than drop it.
  }

  const instruments: Instrument[] = [];
  const statute = getStatute(intake.state);

  if (statute) {
    instruments.push({
      kind: "state_right_of_publicity",
      title: statute.name,
      confidence: asConfidence(out.stateStatute?.confidence),
      rationale: asString(out.stateStatute?.rationale),
      elements: statute.elements,
      reportingChannel: "",
      source: {
        statute: statute.citation,
        provision: statute.provision,
        url: statute.sourceUrl,
      },
      verifyNote: statute.verifyNote,
    });
  } else {
    instruments.push({
      kind: "state_right_of_publicity",
      title: "General state right of publicity",
      confidence: "low",
      rationale:
        asString(out.stateStatute?.rationale) ||
        "This jurisdiction is not in the v1 covered set. A general right of publicity may apply.",
      elements: [],
      reportingChannel: "",
      source: null,
      verifyNote:
        "This state is outside the v1 covered set (TN, WA, CA, NY). Verify the applicable statute and its elements locally.",
    });
  }

  const channel = matchPlatformChannel(intake.platform);
  instruments.push({
    kind: "platform_tos",
    title: `${channel.label} reporting channel`,
    confidence: asConfidence(out.platformTos?.confidence),
    rationale: asString(out.platformTos?.rationale),
    elements: [],
    reportingChannel: channel.channel,
    source: channel.url
      ? { statute: channel.label, provision: "Platform Terms of Service", url: channel.url }
      : null,
    verifyNote: channel.verifyNote,
  });

  if (out.dmca?.applies) {
    instruments.push({
      kind: "dmca",
      title: "DMCA notice (copyrighted underlying work)",
      confidence: asConfidence(out.dmca.confidence),
      rationale: asString(out.dmca.rationale),
      elements: [
        "You hold or control the copyright in an underlying work (for example a specific recording, song, or video).",
        "The replica copies or incorporates that copyrighted work without authorization.",
        "The notice identifies the work, the infringing material, and a good-faith statement, and is sent to the host's designated DMCA agent.",
      ],
      reportingChannel:
        "Send a DMCA takedown notice to the host platform's designated copyright agent.",
      source: {
        statute: "17 U.S.C. § 512",
        provision: "DMCA notice-and-takedown",
        url: "https://www.copyright.gov/512/",
      },
      verifyNote:
        "DMCA covers a copied copyrighted work, not voice or likeness on its own. Verify a protected work is actually implicated.",
    });
  }

  return {
    routedOut: null,
    instruments,
    summary: asString(out.summary),
    model: TRIAGE_MODEL,
    generatedAt,
  };
}

export async function runTriage(intake: Intake): Promise<TriageRead> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new TriageError(
      "The Anthropic API key is not configured on the server.",
    );
  }

  const client = new Anthropic({ apiKey });

  let response;
  try {
    response = await client.messages.create({
      model: TRIAGE_MODEL,
      max_tokens: 1500,
      system: buildSystemPrompt(),
      messages: [{ role: "user", content: buildUserPrompt(intake) }],
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown error";
    throw new TriageError(`The triage request to Anthropic failed: ${detail}`);
  }

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();

  if (!text) {
    throw new TriageError("The triage response was empty.");
  }

  const output = parseModelOutput(text);
  return assemble(intake, output);
}
