import { createHash } from "node:crypto";
import {
  ROUTE_OUT_RESOURCES,
  getStatute,
  matchPlatformChannel,
} from "./instruments";
import type {
  Case,
  Confidence,
  EvidenceItem,
  Instrument,
  Intake,
  TriageRead,
} from "./types";

// Seed source for the data-access layer.
//
// These three cases are CLEARLY FICTIONAL worked examples. They let a visitor
// click through a finished case in seconds without entering anything real. Two
// are in scope (a cloned voice-actor ad and a musician fake endorsement). One
// correctly routes OUT, to show the competence boundary. All names and brands
// are invented and all URLs use the reserved .test domain so they resolve to
// nothing.
//
// A real database replaces this source without any caller changing.

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

// Build a statute instrument from the verified library so seed reads stay
// consistent with live triage output.
function statuteInstrument(
  state: string,
  confidence: Confidence,
  rationale: string,
): Instrument {
  const s = getStatute(state)!;
  return {
    kind: "state_right_of_publicity",
    title: s.name,
    confidence,
    rationale,
    elements: s.elements,
    reportingChannel: "",
    source: { statute: s.citation, provision: s.provision, url: s.sourceUrl },
    verifyNote: s.verifyNote,
  };
}

function platformInstrument(
  platform: string,
  confidence: Confidence,
  rationale: string,
): Instrument {
  const ch = matchPlatformChannel(platform);
  return {
    kind: "platform_tos",
    title: `${ch.label} reporting channel`,
    confidence,
    rationale,
    elements: [],
    reportingChannel: ch.channel,
    source: ch.url
      ? { statute: ch.label, provision: "Platform Terms of Service", url: ch.url }
      : null,
    verifyNote: ch.verifyNote,
  };
}

// Build an evidence package from a seed intake with a fixed add-time, so the
// sample is deterministic.
function evidence(caseId: string, intake: Intake, addedAt: string): EvidenceItem[] {
  const items: Array<Pick<EvidenceItem, "label" | "kind" | "value">> = [
    { label: "URL where the replica is hosted", kind: "hosted_url", value: intake.hostUrl },
    { label: "Host platform", kind: "platform", value: intake.platform },
    { label: "Account of what happened", kind: "incident_description", value: intake.description },
    { label: "Date the replica was found", kind: "found_date", value: intake.foundDate },
  ];
  return items
    .filter((i) => i.value)
    .map((i) => ({
      id: `${caseId}-${i.kind}`,
      label: i.label,
      kind: i.kind,
      value: i.value,
      addedAt,
      fingerprint: sha256(i.value),
    }));
}

// ---- Sample A: cloned voice-actor ad (in scope, California) ----------------

const A_ID = "sample-voice-actor-ad";
const A_DATE = "2026-05-31T15:00:00.000Z";
const A_INTAKE: Intake = {
  description:
    "I am a working voice actor. A regional supplement brand called VitalRoot ran an online ad that uses an AI clone of my voice to narrate it. I never licensed my voice to them and never recorded for them.",
  incidentType: "ad_or_endorsement",
  clonedWhat: "voice",
  hostUrl: "https://vitalroot-ads.test/spring-promo",
  platform: "YouTube",
  foundDate: "2026-05-29",
  identifiable: "yes",
  priorConsent: "none",
  consentScope: "",
  state: "CA",
};

const A_TRIAGE: TriageRead = {
  routedOut: null,
  instruments: [
    statuteInstrument(
      "CA",
      "high",
      "A brand made a knowing commercial use of an AI clone of the claimant's voice to advertise a product, without consent. Section 3344 covers voice, and SB 683 extends it to digital replicas, so the elements appear to line up.",
    ),
    platformInstrument(
      "YouTube",
      "high",
      "The ad is hosted on YouTube, which is clearly identified and has a reporting lane for unauthorized use of a person's likeness or voice.",
    ),
  ],
  summary:
    "This is a core right-of-publicity matter. A commercial advertiser used a cloned voice without consent, which California Civil Code Section 3344 addresses. The host platform also has a reporting channel. No copyrighted work appears to be copied, so DMCA does not apply.",
  model: "claude-sonnet-4-6",
  generatedAt: A_DATE,
};

const A_DRAFT = {
  instrumentKind: "state_right_of_publicity" as const,
  instrumentTitle: "State right-of-publicity demand",
  title:
    "Cease and Desist: Unauthorized Use of AI-Cloned Voice in Advertising (Cal. Civ. Code § 3344)",
  recipient: "[Registered agent or legal department, VitalRoot]",
  body: [
    "[Your full legal name]",
    "[Your address]",
    "[Your email] | [Your phone]",
    "",
    "[Date]",
    "",
    "VIA [CERTIFIED MAIL / EMAIL]",
    "",
    "[Recipient name or registered agent]",
    "VitalRoot",
    "[Recipient address]",
    "",
    "Re: Unauthorized commercial use of my voice in violation of California Civil Code Section 3344",
    "",
    "To whom it may concern:",
    "",
    "I am a professional voice actor. It has come to my attention that VitalRoot is running an advertisement that uses an artificial-intelligence-generated clone of my voice. The advertisement is hosted at https://vitalroot-ads.test/spring-promo. I never licensed my voice to VitalRoot and never consented to this use.",
    "",
    "California Civil Code Section 3344 prohibits the knowing use of another person's voice for advertising or selling without that person's prior consent. As amended, the statute reaches digital replicas of a voice. Your use meets these conditions.",
    "",
    "I demand that VitalRoot immediately stop using my voice and the cloned recording in any advertisement, remove the material identified above, and confirm in writing within ten business days that it has done so.",
    "",
    "This letter is not a complete statement of my rights or claims, and nothing in it waives any of them.",
    "",
    "[Your signature]",
    "[Your full legal name]",
  ].join("\n"),
  model: "claude-sonnet-4-6",
  generatedAt: A_DATE,
  edited: false,
};

// ---- Sample B: musician fake endorsement (in scope, Tennessee) -------------

const B_ID = "sample-musician-endorsement";
const B_DATE = "2026-06-03T18:30:00.000Z";
const B_INTAKE: Intake = {
  description:
    "I am a musician based in Nashville. A headphone company called NorthPeak Audio posted a promo video that uses an AI clone of my singing voice to make it sound like I endorse their product. I have no relationship with them and never agreed to this.",
  incidentType: "ad_or_endorsement",
  clonedWhat: "voice",
  hostUrl: "https://northpeak-audio.test/artist-series",
  platform: "Instagram",
  foundDate: "2026-06-01",
  identifiable: "yes",
  priorConsent: "none",
  consentScope: "",
  state: "TN",
};

const B_TRIAGE: TriageRead = {
  routedOut: null,
  instruments: [
    statuteInstrument(
      "TN",
      "high",
      "A company used an AI clone of the claimant's singing voice to imply an endorsement, without consent. The 2024 ELVIS Act amendments add voice, including simulations, to Tennessee's right of publicity, so this fits squarely.",
    ),
    platformInstrument(
      "Instagram",
      "high",
      "The promo is on Instagram, which is clearly identified and offers a likeness and impersonation reporting lane.",
    ),
  ],
  summary:
    "A company used a cloned singing voice to fake an endorsement, without consent. Tennessee's ELVIS Act now covers voice and voice simulations, which is a strong fit. Instagram also provides a reporting channel. No copyrighted recording appears to be copied, so DMCA does not apply.",
  model: "claude-sonnet-4-6",
  generatedAt: B_DATE,
};

const B_DRAFT = {
  instrumentKind: "state_right_of_publicity" as const,
  instrumentTitle: "State right-of-publicity demand",
  title:
    "Cease and Desist: Unauthorized Use of AI-Cloned Voice for a Fake Endorsement (Tenn. ELVIS Act)",
  recipient: "[Registered agent or legal department, NorthPeak Audio]",
  body: [
    "[Your full legal name]",
    "[Your address]",
    "[Your email] | [Your phone]",
    "",
    "[Date]",
    "",
    "VIA [CERTIFIED MAIL / EMAIL]",
    "",
    "[Recipient name or registered agent]",
    "NorthPeak Audio",
    "[Recipient address]",
    "",
    "Re: Unauthorized use of my voice in violation of the Tennessee Personal Rights Protection Act, as amended by the ELVIS Act",
    "",
    "To whom it may concern:",
    "",
    "I am a recording artist. NorthPeak Audio has published a promotional video that uses an artificial-intelligence-generated clone of my singing voice in a way that implies I endorse your product. The video is hosted at https://northpeak-audio.test/artist-series. I have no relationship with NorthPeak Audio and never consented to this use.",
    "",
    "Tennessee law protects an individual's voice, including a simulation of that voice, from unauthorized use. I did not authorize this use, and no exception applies.",
    "",
    "I demand that NorthPeak Audio immediately stop using my voice and the cloned recording, remove the video identified above, and confirm in writing within ten business days that it has done so.",
    "",
    "This letter is not a complete statement of my rights or claims, and nothing in it waives any of them.",
    "",
    "[Your signature]",
    "[Your full legal name]",
  ].join("\n"),
  model: "claude-sonnet-4-6",
  generatedAt: B_DATE,
  edited: false,
};

// ---- Sample C: correctly routes OUT (the boundary) -------------------------

const C_ID = "sample-routed-out";
const C_DATE = "2026-06-06T12:00:00.000Z";
const C_INTAKE: Intake = {
  description:
    "Someone cloned my voice and is using it in a scam that asks my fans to send money for fake meet-and-greet tickets. People have already lost money. The messages sound like me.",
  incidentType: "fraud_or_scam",
  clonedWhat: "voice",
  hostUrl: "https://fan-tickets-deals.test/vip",
  platform: "Telegram",
  foundDate: "2026-06-04",
  identifiable: "yes",
  priorConsent: "none",
  consentScope: "",
  state: "TN",
};

const C_TRIAGE: TriageRead = {
  routedOut: {
    category: "fraud",
    label: ROUTE_OUT_RESOURCES.fraud.label,
    reason:
      "The cloned voice is being used to take money from fans through a fake-ticket scheme. The primary purpose is financial fraud against third parties, which is a law-enforcement matter rather than an ordinary right-of-publicity drafting matter.",
    resourceName: ROUTE_OUT_RESOURCES.fraud.resourceName,
    resourceDetail: ROUTE_OUT_RESOURCES.fraud.resourceDetail,
    resourceUrl: ROUTE_OUT_RESOURCES.fraud.resourceUrl,
  },
  instruments: [],
  summary:
    "This case is routed out. The cloned voice is being used to defraud people of money, so the priority is reporting the ongoing fraud to the authorities. A right-of-publicity claim may exist in parallel, but Timbre does not draft for this lane.",
  model: "claude-sonnet-4-6",
  generatedAt: C_DATE,
};

export const seedCases: Case[] = [
  {
    id: A_ID,
    createdAt: A_DATE,
    status: "drafted",
    intake: A_INTAKE,
    triage: A_TRIAGE,
    draft: A_DRAFT,
    evidence: evidence(A_ID, A_INTAKE, A_DATE),
    sample: true,
  },
  {
    id: B_ID,
    createdAt: B_DATE,
    status: "drafted",
    intake: B_INTAKE,
    triage: B_TRIAGE,
    draft: B_DRAFT,
    evidence: evidence(B_ID, B_INTAKE, B_DATE),
    sample: true,
  },
  {
    id: C_ID,
    createdAt: C_DATE,
    status: "triaged",
    intake: C_INTAKE,
    triage: C_TRIAGE,
    draft: null,
    evidence: [],
    sample: true,
  },
];
