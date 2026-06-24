"use server";

import { redirect } from "next/navigation";
import { addCase } from "@/lib/data";
import type {
  ClonedWhat,
  Identifiable,
  IncidentType,
  Intake,
  PriorConsent,
} from "@/lib/types";

function str(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

// Server action. The form posts here; this is the only path from the UI into
// storage, and it reaches storage only through the data layer (addCase).
export async function createCase(form: FormData): Promise<void> {
  const priorConsent = (str(form, "priorConsent") || "none") as PriorConsent;

  const intake: Intake = {
    description: str(form, "description"),
    incidentType: (str(form, "incidentType") || "other") as IncidentType,
    clonedWhat: (str(form, "clonedWhat") || "voice") as ClonedWhat,
    hostUrl: str(form, "hostUrl"),
    platform: str(form, "platform"),
    foundDate: str(form, "foundDate"),
    identifiable: (str(form, "identifiable") || "unsure") as Identifiable,
    priorConsent,
    consentScope: priorConsent === "yes" ? str(form, "consentScope") : "",
    state: str(form, "state"),
  };

  const created = await addCase(intake);
  redirect(`/cases/${created.id}`);
}
