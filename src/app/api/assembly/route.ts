import { NextResponse } from "next/server";
import { attachDraft, getCase, saveDraftEdits } from "@/lib/data";
import {
  AssemblyError,
  buildEvidencePackage,
  isInstrumentKind,
  runAssembly,
} from "@/lib/assembly";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Each drafting call spends Anthropic credits; cap per IP.
const LIMIT = 6;
const WINDOW_MS = 10 * 60 * 1000;

// POST /api/assembly  { caseId, instrumentKind }
// Drafts the notice for a non-routed-out case and assembles the evidence
// package. Every failure returns clear JSON; never a white screen.
export async function POST(request: Request) {
  const rl = rateLimit(`assembly:${clientIp(request)}`, LIMIT, WINDOW_MS);
  if (!rl.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: `Too many drafting requests. Try again in about ${Math.max(1, Math.ceil(rl.retryAfterSeconds / 60))} minute(s).`,
      },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
    );
  }

  let caseId = "";
  let instrumentKind: unknown;
  try {
    const body = await request.json();
    caseId = typeof body?.caseId === "string" ? body.caseId : "";
    instrumentKind = body?.instrumentKind;
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  if (!caseId) {
    return NextResponse.json({ ok: false, error: "Missing caseId." }, { status: 400 });
  }
  if (!isInstrumentKind(instrumentKind)) {
    return NextResponse.json(
      { ok: false, error: "Unknown or missing instrument." },
      { status: 400 },
    );
  }

  const existing = await getCase(caseId);
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Case not found." }, { status: 404 });
  }
  if (!existing.triage) {
    return NextResponse.json(
      { ok: false, error: "Run triage before drafting." },
      { status: 409 },
    );
  }
  if (existing.triage.routedOut) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "This case was routed out. Deepfake Recourse does not draft for routed-out cases.",
      },
      { status: 409 },
    );
  }

  try {
    const evidence = buildEvidencePackage(existing.intake);
    const draft = await runAssembly(existing.intake, instrumentKind);
    await attachDraft(caseId, draft, evidence);
    return NextResponse.json({ ok: true, draft, evidence });
  } catch (err) {
    const message =
      err instanceof AssemblyError
        ? err.message
        : "Assembly failed unexpectedly. Try again.";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}

// PATCH /api/assembly  { caseId, body }
// Saves user edits to the draft body. No AI call, but still capped so a
// script cannot flood instance memory with oversized bodies.
const EDIT_LIMIT = 30;
const MAX_DRAFT_LENGTH = 20000;

export async function PATCH(request: Request) {
  const rl = rateLimit(`edit:${clientIp(request)}`, EDIT_LIMIT, WINDOW_MS);
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many edits. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
    );
  }

  let caseId = "";
  let body = "";
  try {
    const json = await request.json();
    caseId = typeof json?.caseId === "string" ? json.caseId : "";
    body = typeof json?.body === "string" ? json.body : "";
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  if (!caseId || !body.trim()) {
    return NextResponse.json(
      { ok: false, error: "A case id and a non-empty draft are required." },
      { status: 400 },
    );
  }
  if (body.length > MAX_DRAFT_LENGTH) {
    return NextResponse.json(
      { ok: false, error: "The draft is too long to save." },
      { status: 400 },
    );
  }

  const updated = await saveDraftEdits(caseId, body);
  if (!updated || !updated.draft) {
    return NextResponse.json(
      { ok: false, error: "No draft to update for this case." },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: true, draft: updated.draft });
}
