import { NextResponse } from "next/server";
import { attachDraft, getCase, saveDraftEdits } from "@/lib/data";
import {
  AssemblyError,
  buildEvidencePackage,
  isInstrumentKind,
  runAssembly,
} from "@/lib/assembly";

export const runtime = "nodejs";

// POST /api/assembly  { caseId, instrumentKind }
// Drafts the notice for a non-routed-out case and assembles the evidence
// package. Every failure returns clear JSON; never a white screen.
export async function POST(request: Request) {
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
          "This case was routed out. Timbre does not draft for routed-out cases.",
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
// Saves user edits to the draft body.
export async function PATCH(request: Request) {
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

  const updated = await saveDraftEdits(caseId, body);
  if (!updated || !updated.draft) {
    return NextResponse.json(
      { ok: false, error: "No draft to update for this case." },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: true, draft: updated.draft });
}
