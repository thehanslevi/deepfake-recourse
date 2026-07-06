import "server-only";
import { randomUUID } from "node:crypto";
import { sql } from "./db";
import { getOwnerId } from "./owner";
import type { Case, Draft, EvidenceItem, Intake, TriageRead } from "./types";

// Data-access layer. This is the ONLY way the rest of the app reads or writes
// cases. Backed by Postgres (Supabase) in the deepfake_recourse schema.
//
// Visibility rules live here, not in callers:
// - Sample cases (the three fictional worked examples) are visible to everyone
//   and read-only.
// - A visitor-created case belongs to the anonymous per-browser owner cookie.
//   Only that browser can read or advance it. Anyone else gets null, exactly
//   like a case that does not exist.

interface CaseRow {
  id: string;
  created_at: string | Date;
  status: Case["status"];
  owner_id: string | null;
  sample: boolean;
  intake: Intake;
  triage: TriageRead | null;
  draft: Draft | null;
  evidence: EvidenceItem[];
}

// Our domain types are plain JSON-shaped objects; brand them for db.json().
function asJson(value: unknown): import("postgres").JSONValue {
  return value as import("postgres").JSONValue;
}

function toCase(row: CaseRow): Case {
  return {
    id: row.id,
    createdAt: new Date(row.created_at).toISOString(),
    status: row.status,
    intake: row.intake,
    triage: row.triage,
    draft: row.draft,
    evidence: row.evidence ?? [],
    sample: row.sample,
  };
}

// Samples plus the current browser's own cases, newest first.
export async function getCases(): Promise<Case[]> {
  const ownerId = await getOwnerId();
  const db = sql();
  const rows = ownerId
    ? await db<CaseRow[]>`
        select * from deepfake_recourse.cases
        where sample = true or owner_id = ${ownerId}
        order by created_at desc`
    : await db<CaseRow[]>`
        select * from deepfake_recourse.cases
        where sample = true
        order by created_at desc`;
  return rows.map(toCase);
}

// A sample, or the current browser's own case. Anything else reads as absent.
export async function getCase(id: string): Promise<Case | null> {
  const ownerId = await getOwnerId();
  const db = sql();
  const rows = await db<CaseRow[]>`
    select * from deepfake_recourse.cases
    where id = ${id}
      and (sample = true or owner_id = ${ownerId ?? ""})
    limit 1`;
  return rows.length ? toCase(rows[0]) : null;
}

export async function addCase(intake: Intake, ownerId: string): Promise<Case> {
  const db = sql();
  const rows = await db<CaseRow[]>`
    insert into deepfake_recourse.cases (id, status, owner_id, sample, intake, evidence)
    values (${randomUUID()}, 'intake', ${ownerId}, false, ${db.json(asJson(intake))}, '[]'::jsonb)
    returning *`;
  return toCase(rows[0]);
}

// Attach a triage read and advance status. Owner-scoped; samples are
// read-only, enforced by the `sample = false` predicate.
export async function attachTriage(
  id: string,
  triage: TriageRead,
): Promise<Case | null> {
  const ownerId = await getOwnerId();
  if (!ownerId) return null;
  const db = sql();
  const rows = await db<CaseRow[]>`
    update deepfake_recourse.cases
    set triage = ${db.json(asJson(triage))},
        status = 'triaged'
    where id = ${id} and owner_id = ${ownerId} and sample = false
    returning *`;
  return rows.length ? toCase(rows[0]) : null;
}

// Attach the draft and evidence package. Same scoping as attachTriage.
export async function attachDraft(
  id: string,
  draft: Draft,
  evidence: EvidenceItem[],
): Promise<Case | null> {
  const ownerId = await getOwnerId();
  if (!ownerId) return null;
  const db = sql();
  const rows = await db<CaseRow[]>`
    update deepfake_recourse.cases
    set draft = ${db.json(asJson(draft))},
        evidence = ${db.json(asJson(evidence))},
        status = 'drafted'
    where id = ${id} and owner_id = ${ownerId} and sample = false
    returning *`;
  return rows.length ? toCase(rows[0]) : null;
}

// Save user edits to the draft body. Same scoping as attachTriage.
export async function saveDraftEdits(
  id: string,
  body: string,
): Promise<Case | null> {
  const ownerId = await getOwnerId();
  if (!ownerId) return null;
  const db = sql();
  const rows = await db<CaseRow[]>`
    update deepfake_recourse.cases
    set draft = draft || jsonb_build_object('body', ${body}::text, 'edited', true),
        status = 'reviewed'
    where id = ${id} and owner_id = ${ownerId} and sample = false
      and draft is not null
    returning *`;
  return rows.length ? toCase(rows[0]) : null;
}
