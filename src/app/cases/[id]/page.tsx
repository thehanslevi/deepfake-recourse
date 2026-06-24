import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCase } from "@/lib/data";
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
  title: "Case — Timbre",
};

export const dynamic = "force-dynamic";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 gap-1 py-4 sm:grid-cols-[12rem_1fr] sm:gap-6">
      <dt className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
        {label}
      </dt>
      <dd className="font-serif text-base leading-relaxed text-ink whitespace-pre-wrap">
        {value || "Not provided"}
      </dd>
    </div>
  );
}

export default async function CasePage({
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
      <div className="mx-auto w-full max-w-4xl px-6 py-16 md:py-24">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-accent">
            Case file
          </p>
          <Link
            href="/cases"
            className="font-mono text-sm no-underline hover:underline"
          >
            ← All cases
          </Link>
        </div>
        <div aria-hidden className="mt-5 h-px w-10 bg-accent" />

        <h1 className="mt-8 max-w-2xl font-serif text-3xl font-medium leading-[1.1] tracking-[-0.01em] md:text-4xl">
          {incidentTypeLabel(intake.incidentType)}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
          <span>
            Status <span className="text-accent">{statusLabel(c.status)}</span>
          </span>
          <span>Opened {formatDate(c.createdAt)}</span>
          <span className="lowercase tracking-normal">id: {c.id}</span>
        </div>

        <div className="mt-12 border border-line bg-surface/40">
          <header className="border-b border-line px-5 py-3">
            <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ink">
              Intake
            </h2>
          </header>
          <dl className="divide-y divide-line px-5 py-2">
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

        <div className="mt-8 border border-line px-5 py-5">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
            Next in the pipeline
          </p>
          <p className="mt-3 font-serif text-base leading-relaxed text-ink/80">
            Triage maps these facts to the law that applies. Assembly drafts the
            notice and packages the evidence. Both land in later phases. Timbre
            assembles and drafts. A human files.
          </p>
        </div>
      </div>
    </section>
  );
}
