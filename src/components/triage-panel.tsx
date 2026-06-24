"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  Confidence,
  Instrument,
  RoutedOut,
  TriageRead,
} from "@/lib/types";

function ConfidencePill({ confidence }: { confidence: Confidence }) {
  const label = { high: "High", medium: "Medium", low: "Low" }[confidence];
  // Low confidence is visually distinct so it reads as a caveat, not a fact.
  const tone =
    confidence === "low"
      ? "border-muted text-muted"
      : "border-accent text-accent";
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.16em] ${tone}`}
    >
      <span
        aria-hidden
        className={`h-1.5 w-1.5 ${confidence === "low" ? "bg-muted" : "bg-accent"}`}
      />
      {label} confidence
    </span>
  );
}

const KIND_LABEL: Record<Instrument["kind"], string> = {
  state_right_of_publicity: "State right of publicity",
  platform_tos: "Platform Terms of Service",
  dmca: "DMCA",
};

function InstrumentCard({ instrument }: { instrument: Instrument }) {
  return (
    <article className="border border-line bg-surface/40">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
            {KIND_LABEL[instrument.kind]}
          </span>
        </div>
        <ConfidencePill confidence={instrument.confidence} />
      </header>

      <div className="space-y-5 px-5 py-5">
        <h3 className="font-serif text-xl leading-snug text-ink">
          {instrument.title}
        </h3>

        {instrument.rationale ? (
          <p className="font-serif text-base leading-relaxed text-ink/80">
            {instrument.rationale}
          </p>
        ) : null}

        {instrument.reportingChannel ? (
          <div>
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
              Reporting channel
            </p>
            <p className="mt-2 font-serif text-base leading-relaxed text-ink/80">
              {instrument.reportingChannel}
            </p>
          </div>
        ) : null}

        {instrument.elements.length > 0 ? (
          <div>
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
              Elements that must be met
            </p>
            <ol className="mt-3 space-y-2">
              {instrument.elements.map((el, i) => (
                <li
                  key={i}
                  className="flex gap-3 font-serif text-base leading-relaxed text-ink/80"
                >
                  <span className="font-mono text-[0.7rem] text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{el}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        {instrument.source ? (
          <div className="border-t border-line pt-4">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
              Source trace
            </p>
            <p className="mt-2 font-mono text-xs leading-relaxed text-ink/80">
              {instrument.source.statute}
              {instrument.source.provision
                ? ` · ${instrument.source.provision}`
                : ""}
            </p>
            {instrument.source.url ? (
              <p className="mt-1 font-mono text-xs">
                <a
                  href={instrument.source.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {instrument.source.url}
                </a>
              </p>
            ) : null}
          </div>
        ) : null}

        <p className="font-mono text-[0.7rem] leading-relaxed text-muted">
          {instrument.verifyNote}
        </p>
      </div>
    </article>
  );
}

function RoutedOutBanner({ routedOut }: { routedOut: RoutedOut }) {
  return (
    <div className="border-2 border-accent bg-surface/60">
      <div className="border-b border-line px-5 py-3">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-accent">
          Routed out · {routedOut.label}
        </p>
      </div>
      <div className="space-y-4 px-5 py-5">
        <p className="font-serif text-lg leading-relaxed text-ink">
          Timbre does not draft for this case. This is outside the lane Timbre
          can responsibly handle.
        </p>
        {routedOut.reason ? (
          <div>
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
              Why
            </p>
            <p className="mt-2 font-serif text-base leading-relaxed text-ink/80">
              {routedOut.reason}
            </p>
          </div>
        ) : null}
        <div className="border-t border-line pt-4">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
            Where to go instead
          </p>
          <p className="mt-2 font-serif text-base leading-relaxed text-ink">
            {routedOut.resourceName}
          </p>
          <p className="mt-1 font-serif text-base leading-relaxed text-ink/80">
            {routedOut.resourceDetail}
          </p>
          {routedOut.resourceUrl ? (
            <p className="mt-2 font-mono text-xs">
              <a href={routedOut.resourceUrl} target="_blank" rel="noreferrer">
                {routedOut.resourceUrl}
              </a>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function TriageView({ triage }: { triage: TriageRead }) {
  return (
    <div className="space-y-6">
      {triage.summary ? (
        <p className="font-serif text-lg leading-relaxed text-ink/90">
          {triage.summary}
        </p>
      ) : null}

      {triage.routedOut ? (
        <RoutedOutBanner routedOut={triage.routedOut} />
      ) : (
        <>
          <div className="space-y-5">
            {triage.instruments.map((instrument, i) => (
              <InstrumentCard key={i} instrument={instrument} />
            ))}
          </div>
          <div className="border border-line px-5 py-4">
            <p className="font-serif text-base leading-relaxed text-ink/80">
              These are the instruments that may apply. The next step drafts the
              notice tuned to one of them. Timbre drafts; a human files. Nothing
              is sent from here.
            </p>
          </div>
        </>
      )}

      <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-muted">
        Generated by {triage.model}. Not legal advice. Verify current law.
      </p>
    </div>
  );
}

type Status = "idle" | "loading" | "error";

export function TriagePanel({
  caseId,
  initialTriage,
}: {
  caseId: string;
  initialTriage: TriageRead | null;
}) {
  const router = useRouter();
  const [triage, setTriage] = useState<TriageRead | null>(initialTriage);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");

  async function run() {
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setError(data?.error || "Triage failed. Try again.");
        setStatus("error");
        return;
      }
      setTriage(data.triage as TriageRead);
      setStatus("idle");
      // Refresh so the server-rendered assembly section appears for a
      // non-routed-out read.
      router.refresh();
    } catch {
      setError("Could not reach the triage service. Try again.");
      setStatus("error");
    }
  }

  if (triage) {
    return <TriageView triage={triage} />;
  }

  return (
    <div className="space-y-4">
      <p className="font-serif text-base leading-relaxed text-ink/80">
        Triage maps these facts to the law that applies. It makes one real call
        to {`Claude (claude-sonnet-4-6)`} and returns a confidence-marked read
        with sources. It does not draft or send anything.
      </p>

      {status === "error" ? (
        <div
          role="alert"
          className="border-2 border-accent bg-surface/60 px-5 py-4"
        >
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-accent">
            Triage error
          </p>
          <p className="mt-2 font-serif text-base leading-relaxed text-ink">
            {error}
          </p>
          <p className="mt-2 font-mono text-[0.7rem] leading-relaxed text-muted">
            Nothing was saved. You can run triage again.
          </p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={run}
        disabled={status === "loading"}
        className="border border-accent bg-accent px-5 py-2 font-mono text-sm text-[var(--ground)] no-underline transition-colors hover:bg-accent-ink disabled:opacity-60"
      >
        {status === "loading" ? "Running triage…" : "Run triage →"}
      </button>
    </div>
  );
}
