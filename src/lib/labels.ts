// Display helpers. Pure mapping from stored codes to readable text. Safe to
// import from server or client components.

import { INCIDENT_TYPES, type CaseStatus } from "./types";
import { US_STATES, isCoveredState } from "./states";

export function incidentTypeLabel(value: string): string {
  return INCIDENT_TYPES.find((t) => t.value === value)?.label ?? value;
}

export function clonedWhatLabel(value: string): string {
  return { voice: "Voice", image: "Image", both: "Voice and image" }[value] ?? value;
}

export function identifiableLabel(value: string): string {
  return { yes: "Yes", no: "No", unsure: "Not sure" }[value] ?? value;
}

export function priorConsentLabel(value: string): string {
  return { none: "No consent", yes: "Some consent existed" }[value] ?? value;
}

export function stateLabel(code: string): string {
  const name = US_STATES.find((s) => s.code === code)?.name ?? code;
  if (!code) return "Not provided";
  return isCoveredState(code) ? `${name} (covered)` : `${name} (general)`;
}

export function statusLabel(status: CaseStatus): string {
  return (
    {
      intake: "Intake",
      triaged: "Triaged",
      drafted: "Drafted",
      reviewed: "Reviewed",
      exported: "Exported",
    }[status] ?? status
  );
}

export function formatDate(iso: string): string {
  if (!iso) return "Not provided";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
