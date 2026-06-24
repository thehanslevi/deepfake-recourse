import type { Metadata } from "next";
import Link from "next/link";
import { getCases } from "@/lib/data";
import {
  clonedWhatLabel,
  formatDate,
  incidentTypeLabel,
  stateLabel,
  statusLabel,
} from "@/lib/labels";

export const metadata: Metadata = {
  title: "Cases — Timbre",
};

// Always read fresh from the data layer.
export const dynamic = "force-dynamic";

export default async function CasesPage() {
  const cases = await getCases();

  return (
    <section className="flex-1">
      <div className="mx-auto w-full max-w-4xl px-6 py-16 md:py-24">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-accent">
          Index · Cases
        </p>
        <div aria-hidden className="mt-5 h-px w-10 bg-accent" />

        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-serif text-3xl font-medium leading-[1.1] tracking-[-0.01em] md:text-5xl">
            Cases
          </h1>
          <Link
            href="/intake"
            className="font-mono text-sm no-underline hover:underline"
          >
            New intake →
          </Link>
        </div>

        {cases.length === 0 ? (
          <div className="mt-12 border border-line bg-surface/40 px-6 py-12 text-center">
            <p className="font-serif text-lg text-ink/80">No cases yet.</p>
            <p className="mt-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
              Start an intake to record one.
            </p>
            <div className="mt-6">
              <Link
                href="/intake"
                className="border border-accent bg-accent px-5 py-2 font-mono text-sm text-[var(--ground)] no-underline transition-colors hover:bg-accent-ink"
              >
                Start an intake →
              </Link>
            </div>
          </div>
        ) : (
          <ul className="mt-12 border-t border-line">
            {cases.map((c) => (
              <li key={c.id} className="border-b border-line">
                <Link
                  href={`/cases/${c.id}`}
                  className="group flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 px-1 py-5 no-underline"
                >
                  <span className="font-serif text-lg text-ink group-hover:text-accent">
                    {incidentTypeLabel(c.intake.incidentType)}
                    <span className="text-muted"> · {clonedWhatLabel(c.intake.clonedWhat)}</span>
                    {c.sample ? (
                      <span className="ml-3 border border-accent px-1.5 py-0.5 align-middle font-mono text-[0.6rem] uppercase tracking-[0.16em] text-accent">
                        Sample
                      </span>
                    ) : null}
                  </span>
                  <span className="flex items-baseline gap-4 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
                    <span>{stateLabel(c.intake.state)}</span>
                    <span>{formatDate(c.createdAt)}</span>
                    <span className="text-accent">{statusLabel(c.status)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
