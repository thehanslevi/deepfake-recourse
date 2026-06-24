import { NextResponse } from "next/server";
import { attachTriage, getCase } from "@/lib/data";
import { TriageError, runTriage } from "@/lib/triage";

export const runtime = "nodejs";

// POST /api/triage  { caseId }
// Loads the stored intake through the data layer, runs the Anthropic triage
// call, attaches the result to the case, and returns it. Every failure path
// returns a clear JSON error the UI can render; it never throws to a white
// screen.
export async function POST(request: Request) {
  let caseId: string;
  try {
    const body = await request.json();
    caseId = typeof body?.caseId === "string" ? body.caseId : "";
  } catch {
    return NextResponse.json(
      { ok: false, error: "Malformed request." },
      { status: 400 },
    );
  }

  if (!caseId) {
    return NextResponse.json(
      { ok: false, error: "Missing caseId." },
      { status: 400 },
    );
  }

  const existing = await getCase(caseId);
  if (!existing) {
    return NextResponse.json(
      { ok: false, error: "Case not found." },
      { status: 404 },
    );
  }

  try {
    const triage = await runTriage(existing.intake);
    await attachTriage(caseId, triage);
    return NextResponse.json({ ok: true, triage });
  } catch (err) {
    const message =
      err instanceof TriageError
        ? err.message
        : "Triage failed unexpectedly. Try again.";
    // 502: an upstream/model problem, not the client's fault.
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
