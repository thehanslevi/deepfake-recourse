import Link from "next/link";

export default function Home() {
  return (
    <section className="flex-1">
      <div className="mx-auto w-full max-w-4xl px-6 py-28 md:py-40">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-accent">
          Likeness recourse
        </p>
        <div aria-hidden className="mt-5 h-px w-10 bg-accent" />

        <h1 className="mt-8 max-w-3xl font-serif text-4xl font-medium leading-[1.08] tracking-[-0.01em] md:text-6xl">
          Recourse for a voice or likeness cloned without consent.
        </h1>

        <p className="mt-8 max-w-xl font-serif text-lg leading-relaxed text-ink/80 md:text-xl">
          Timbre takes the evidence and assembles a filing-ready takedown and
          claim package, grounded in the law that actually applies. Timbre
          assembles and drafts. A human files.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-sm">
          <Link
            href="/intake"
            className="border border-accent bg-accent px-5 py-2 text-[var(--ground)] no-underline transition-colors hover:bg-accent-ink"
          >
            Start an intake →
          </Link>
          <Link
            href="/cases/sample-voice-actor-ad/file"
            className="no-underline hover:underline"
          >
            See a worked example →
          </Link>
          <Link href="/cases" className="no-underline hover:underline">
            View cases
          </Link>
        </div>

        <div className="mt-20 border-t border-line pt-6">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
            Intake. Triage. Drafting. Record. The full recourse loop.
          </p>
        </div>
      </div>
    </section>
  );
}
