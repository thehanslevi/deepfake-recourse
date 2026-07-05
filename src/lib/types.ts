// Domain types for Deepfake Recourse.
//
// A `Case` is the atomic object. In Phase 1 it carries the intake fields and a
// status. The triage read (Phase 2), the draft (Phase 3), and the evidence log
// (Phase 3/4) are declared here as nullable/empty so the type accommodates them
// later without a rewrite.

export type ClonedWhat = "voice" | "image" | "both";

export type Identifiable = "yes" | "no" | "unsure";

export type PriorConsent = "none" | "yes";

// The case status pipeline. Phase 1 only ever sets "intake".
export type CaseStatus =
  | "intake"
  | "triaged"
  | "drafted"
  | "reviewed"
  | "exported";

export const INCIDENT_TYPES = [
  { value: "ad_or_endorsement", label: "Advertising or endorsement" },
  { value: "impersonation", label: "Impersonation or fake content" },
  { value: "fraud_or_scam", label: "Fraud or scam" },
  { value: "other", label: "Other or not sure" },
] as const;

export type IncidentType = (typeof INCIDENT_TYPES)[number]["value"];

// The structured intake. Field list follows the spec.
export interface Intake {
  // Free-text account of what happened.
  description: string;
  // Nature of the misuse.
  incidentType: IncidentType;
  // What was cloned.
  clonedWhat: ClonedWhat;
  // Where the replica is hosted.
  hostUrl: string;
  platform: string;
  // When the user found it (yyyy-mm-dd).
  foundDate: string;
  // Whether the user is identifiable in the replica.
  identifiable: Identifiable;
  // Whether any prior consent existed, and its scope if so.
  priorConsent: PriorConsent;
  consentScope: string;
  // Jurisdiction. Two-letter US state/territory code. First-class because the
  // applicable statute depends on it (Phase 2).
  state: string;
}

// Triage read (Phase 2). The structured, confidence-marked output of the
// triage route. Either the case is routed out, or it carries a list of
// applicable instruments. Never both.

export type Confidence = "high" | "medium" | "low";

export interface SourceTrace {
  statute: string; // e.g. "Tenn. Code Ann. § 47-25-1101 et seq."
  provision: string; // the specific provision relied on
  url: string; // official or authoritative source
}

export type InstrumentKind =
  | "state_right_of_publicity"
  | "platform_tos"
  | "dmca";

export interface Instrument {
  kind: InstrumentKind;
  title: string;
  confidence: Confidence;
  // Plain-language explanation of why this instrument applies to the facts.
  rationale: string;
  // For a statute: the elements that must be met. Empty for non-statute kinds.
  elements: string[];
  // For a platform ToS channel: where and what to file.
  reportingChannel: string;
  source: SourceTrace | null;
  // A standing reminder that the law is in flux.
  verifyNote: string;
}

export interface RoutedOut {
  category: "ncii" | "election_deepfake" | "fraud";
  label: string;
  // Why the facts triggered routing out.
  reason: string;
  resourceName: string;
  resourceDetail: string;
  resourceUrl: string;
}

export interface TriageRead {
  // When set, triage stops here and does not proceed toward drafting.
  routedOut: RoutedOut | null;
  // Applicable instruments. Empty when routed out.
  instruments: Instrument[];
  // Overall plain-language summary of the read.
  summary: string;
  model: string;
  generatedAt: string; // ISO timestamp
}

// Draft (Phase 3). The assembled takedown / demand notice, tuned to one
// chosen instrument. It is always a draft; nothing is addressed-and-sent from
// the app. `body` is editable by the user before export.
export interface Draft {
  instrumentKind: InstrumentKind;
  instrumentTitle: string;
  title: string;
  recipient: string; // role/placeholder, never a real fetched address
  body: string;
  model: string;
  generatedAt: string;
  edited: boolean;
}

// Evidence item (Phase 3). Built deterministically from the intake, not by the
// model. Each item records when it was added (the add-log) and a SHA-256
// fingerprint of its content. This detects naive edits to the recorded
// material. It is not a tamper-proof seal and the UI does not claim to be one.
export type EvidenceKind =
  | "hosted_url"
  | "platform"
  | "incident_description"
  | "found_date"
  | "consent_scope";

export interface EvidenceItem {
  id: string;
  label: string;
  kind: EvidenceKind;
  value: string;
  addedAt: string; // ISO timestamp the item entered the package
  fingerprint: string; // sha256 hex of `value`
}

export interface Case {
  id: string;
  createdAt: string; // ISO timestamp
  status: CaseStatus;
  intake: Intake;
  triage: TriageRead | null;
  draft: Draft | null;
  evidence: EvidenceItem[];
  // True for the clearly-fictional seeded worked examples. Surfaced in the UI
  // so a sample is never mistaken for a real person's case.
  sample?: boolean;
}
