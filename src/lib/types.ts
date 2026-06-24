// Domain types for Timbre.
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

// Later-phase shapes. Declared now, open on purpose, so `Case` is stable.
// The optional `never` member keeps these as named, extensible interfaces
// without tripping empty-interface lint while they hold no fields yet.
export interface TriageRead {
  // Populated in Phase 2 (triage).
  _phase2?: never;
}

export interface Draft {
  // Populated in Phase 3 (assembly).
  _phase3?: never;
}

export interface EvidenceItem {
  // Populated in Phase 3/4 (evidence package).
  _phase3or4?: never;
}

export interface Case {
  id: string;
  createdAt: string; // ISO timestamp
  status: CaseStatus;
  intake: Intake;
  triage: TriageRead | null;
  draft: Draft | null;
  evidence: EvidenceItem[];
}
