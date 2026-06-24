import "server-only";
import { randomUUID } from "node:crypto";
import { seedCases } from "./seed";
import type { Case, Intake } from "./types";

// Data-access layer. This is the ONLY way the rest of the app reads or writes
// cases. No component, page, or route touches storage directly. Today it is
// backed by the seed file plus in-memory state; swapping in a real database
// later is a change contained entirely to this file.

type Store = { cases: Case[] };

// Hang the store off globalThis so it survives module reloads (dev HMR, and
// warm serverless instances). A database removes this concern entirely.
const globalForStore = globalThis as unknown as { __timbreStore?: Store };

function getStore(): Store {
  if (!globalForStore.__timbreStore) {
    globalForStore.__timbreStore = { cases: seedCases.map((c) => ({ ...c })) };
  }
  return globalForStore.__timbreStore;
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
