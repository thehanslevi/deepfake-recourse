"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { addCase } from "@/lib/data";
import { rateLimit } from "@/lib/rate-limit";
import type {
  ClonedWhat,
  Identifiable,
  IncidentType,
  Intake,
  PriorConsent,
} from "@/lib/types";

// Server-side length caps. The client mirrors these with maxLength, but the
// cap is enforced here so a scripted POST cannot bloat storage or the prompts
// the AI routes later build from these fields.
const MAX = {
  description: 5000,
  hostUrl: 2000,
  platform: 200,
  foundDate: 40,
  consentScope: 3000,
  state: 10,
} as const;

function str(form: FormData, key: string, max: number): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

// Server action. The form posts here; this is the only path from the UI into
// storage, and it reaches storage only through the data layer (addCase).
export async function createCase(form: FormData): Promise<void> {
  // Public write path: cap case creation per IP so a script cannot flood
  // instance memory.
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const rl = rateLimit(`intake:${ip}`, 20, 10 * 60 * 1000);
  if (!rl.ok) {
    throw new Error("Too many cases created. Try again shortly.");
  }

  const priorConsent = (str(form, "priorConsent", 10) || "none") as PriorConsent;

  const intake: Intake = {
    description: str(form, "description", MAX.description),
    incidentType: (str(form, "incidentType", 40) || "other") as IncidentType,
    clonedWhat: (str(form, "clonedWhat", 10) || "voice") as ClonedWhat,
    hostUrl: str(form, "hostUrl", MAX.hostUrl),
    platform: str(form, "platform", MAX.platform),
    foundDate: str(form, "foundDate", MAX.foundDate),
    identifiable: (str(form, "identifiable", 10) || "unsure") as Identifiable,
    priorConsent,
    consentScope:
      priorConsent === "yes" ? str(form, "consentScope", MAX.consentScope) : "",
    state: str(form, "state", MAX.state),
  };

  const created = await addCase(intake);
  redirect(`/cases/${created.id}`);
}
