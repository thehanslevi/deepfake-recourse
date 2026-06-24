import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCase } from "@/lib/data";
import { TriageView } from "@/components/triage-panel";
import { EvidencePackageView } from "@/components/assembly-panel";
import { PrintButton } from "@/components/print-button";
import {
  clonedWhatLabel,
  formatDate,
  identifiableLabel,
  incidentTypeLabel,
  priorConsentLabel,
  stateLabel,
  statusLabel,
} from "@/lib/labels";

export const metadata: Metadata = {
  title: "Case file — Timbre",
};

export const dynamic = "force-dynamic";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[12rem_1fr] sm:gap-6">
      <dt className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
        {label}
      </dt>
      <dd className="font-serif text-base leading-relaxed text-ink whitespace-pre-wrap">
        {value || "Not provided"}
      </dd>
    </div>
  );
}

function SectionTitle({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3 border-b border-line pb-2">
      <span className="font-mono text-[0.7rem] tracking-[0.18em] text-accent">
        {index}
      </span>
      <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ink">
        {title}
      </h2>
    </div>
  );
}

export default async function CaseFilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = await getCase(id);
  if (!c) notFound();

  const { intake } = c;

  return (
    <section className="flex-1">
      <div className="mx-auto w-full max-w-3xl px-6 py-12 md:py-16">
        <div className="no-print mb-10 flex flex-wrap items-center justify-between gap-4">
          <Link
            href={`/cases/${c.id}`}
            className="font-mono text-sm no-underline hover:underline"
          >
            ← Back to case
          </Link>
          <PrintButton />
        </div>

        {/* Document header */}
        <header className="border-b-2 border-ink pb-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm tracking-tight">
              timbre<span className="text-accent">*</span>
            </span>
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
              Case file
            </span>
          </div>
          {c.sample ? (
            <p className="mt-4 inline-block border border-accent px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-accent">
              Sample · fictional
            </p>
          ) : null}
          <h1 className="mt-4 font-serif text-2xl font-medium leading-tight md:text-3xl">
            {incidentTypeLabel(intake.incidentType)} · {clonedWhatLabel(intake.clonedWhat)}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
            <span>
              Status <span className="text-accent">{statusLabel(c.status)}</span>
            </span>
            <span>Opened {formatDate(c.createdAt)}</span>
            <span className="lowercase tracking-normal">id: {c.id}</span>
          </div>
        </header>

        {/* Intake */}
        <div className="mt-10">
          <SectionTitle index="01" title="Intake" />
          <dl className="mt-2 divide-y divide-line">
            <Row label="What happened" value={intake.description} />
            <Row label="Incident type" value={incidentTypeLabel(intake.incidentType)} />
            <Row label="What was cloned" value={clonedWhatLabel(intake.clonedWhat)} />
            <Row label="Hosted at" value={intake.hostUrl} />
            <Row label="Platform" value={intake.platform} />
            <Row label="Found on" value={formatDate(intake.foundDate)} />
            <Row label="Identifiable" value={identifiableLabel(intake.identifiable)} />
            <Row label="Prior consent" value={priorConsentLabel(intake.priorConsent)} />
            {intake.priorConsent === "yes" ? (
              <Row label="Consent scope" value={intake.consentScope} />
            ) : null}
            <Row label="Jurisdiction" value={stateLabel(intake.state)} />
          </dl>
        </div>

        {/* Triage */}
        <div className="mt-10">
          <SectionTitle index="02" title="Triage read" />
          <div className="mt-5">
            {c.triage ? (
              <TriageView triage={c.triage} />
            ) : (
              <p className="font-serif text-base leading-relaxed text-ink/70">
                Triage has not been run for this case.
              </p>
            )}
          </div>
        </div>

        {/* Evidence */}
        {c.evidence.length > 0 ? (
          <div className="mt-10">
            <SectionTitle index="03" title="Evidence log" />
            <div className="mt-5">
              <EvidencePackageView evidence={c.evidence} />
            </div>
          </div>
        ) : null}

        {/* Draft */}
        <div className="mt-10">
          <SectionTitle index="04" title="Drafted notice" />
          <div className="mt-5">
            {c.draft ? (
              <div className="border border-line bg-surface/40">
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
                  <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ink">
                    {c.draft.instrumentTitle}
                  </span>
                  <span className="border border-accent px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-accent">
                    Draft only
                  </span>
                </header>
                <div className="space-y-4 px-5 py-5">
                  <p className="font-serif text-xl leading-snug text-ink">
                    {c.draft.title}
                  </p>
                  <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
                    Directed to: {c.draft.recipient}
                  </p>
                  <pre className="whitespace-pre-wrap break-words border-t border-line pt-4 font-mono text-sm leading-relaxed text-ink">
                    {c.draft.body}
                  </pre>
                </div>
              </div>
            ) : c.triage?.routedOut ? (
              <p className="font-serif text-base leading-relaxed text-ink/70">
                No notice was drafted. This case was routed out, and Timbre does
                not draft for routed-out cases. See the triage read above for
                where to go instead.
              </p>
            ) : (
              <p className="font-serif text-base leading-relaxed text-ink/70">
                No notice has been drafted yet.
              </p>
            )}
          </div>
        </div>

        <footer className="mt-12 border-t-2 border-ink pt-6">
          <p className="font-mono text-[0.7rem] leading-relaxed text-muted">
            Timbre assembled this file. Timbre drafts; a human files. Nothing in
            this file has been sent. This is not legal advice. Verify current
            law before acting.
          </p>
        </footer>
      </div>
    </section>
  );
}
