import { NextResponse } from "next/server";
import { attachTriage, getCase } from "@/lib/data";
import { TriageError, runTriage } from "@/lib/triage";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Each triage call spends Anthropic credits; cap per IP.
const LIMIT = 6;
const WINDOW_MS = 10 * 60 * 1000;

// POST /api/triage  { caseId }
// Loads the stored intake through the data layer, runs the Anthropic triage
// call, attaches the result to the case, and returns it. Every failure path
// returns a clear JSON error the UI can render; it never throws to a white
// screen.
export async function POST(request: Request) {
  const rl = rateLimit(`triage:${clientIp(request)}`, LIMIT, WINDOW_MS);
  if (!rl.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: `Too many triage requests. Try again in about ${Math.max(1, Math.ceil(rl.retryAfterSeconds / 60))} minute(s).`,
      },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
    );
  }

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
