import "server-only";
import { randomUUID } from "node:crypto";
import { seedCases } from "./seed";
import type { Case, Draft, EvidenceItem, Intake, TriageRead } from "./types";

// Data-access layer. This is the ONLY way the rest of the app reads or writes
// cases. No component, page, or route touches storage directly. Today it is
// backed by the seed file plus in-memory state; swapping in a real database
// later is a change contained entirely to this file.

type Store = { cases: Case[] };

// Hang the store off globalThis so it survives module reloads (dev HMR, and
// warm serverless instances). A database removes this concern entirely.
const globalForStore = globalThis as unknown as { __dfrStore?: Store };

function getStore(): Store {
  if (!globalForStore.__dfrStore) {
    globalForStore.__dfrStore = { cases: seedCases.map((c) => ({ ...c })) };
  }
  return globalForStore.__dfrStore;
}

// Newest first.
export async function getCases(): Promise<Case[]> {
  return [...getStore().cases].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export async function getCase(id: string): Promise<Case | null> {
  return getStore().cases.find((c) => c.id === id) ?? null;
}

export async function addCase(intake: Intake): Promise<Case> {
  const newCase: Case = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    status: "intake",
    intake,
    triage: null,
    draft: null,
    evidence: [],
  };
  getStore().cases.unshift(newCase);
  return newCase;
}

// Attach a triage read to a case and advance its status. Storage only; the
// Anthropic call lives in the triage route, not here.
export async function attachTriage(
  id: string,
  triage: TriageRead,
): Promise<Case | null> {
  const found = getStore().cases.find((c) => c.id === id);
  if (!found) return null;
  found.triage = triage;
  found.status = "triaged";
  return found;
}

// Attach the draft and evidence package to a case. Storage only; the Anthropic
// call lives in the assembly route.
export async function attachDraft(
  id: string,
  draft: Draft,
  evidence: EvidenceItem[],
): Promise<Case | null> {
  const found = getStore().cases.find((c) => c.id === id);
  if (!found) return null;
  found.draft = draft;
  found.evidence = evidence;
  found.status = "drafted";
  return found;
}

// Save user edits to the draft body. Marks the draft edited and the case
// reviewed.
export async function saveDraftEdits(
  id: string,
  body: string,
): Promise<Case | null> {
  const found = getStore().cases.find((c) => c.id === id);
  if (!found || !found.draft) return null;
  found.draft = { ...found.draft, body, edited: true };
  found.status = "reviewed";
  return found;
}
