export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      <header className="border-b-2 border-rule">
        <div className="mx-auto w-full max-w-5xl px-6 py-4 flex items-center justify-between">
          <span className="font-sans text-sm font-medium uppercase tracking-[0.2em]">
            Likeness Recourse
          </span>
          <span className="font-sans text-xs uppercase tracking-[0.2em] text-muted">
            v1 — scaffold
          </span>
        </div>
      </header>

      <section className="flex-1">
        <div className="mx-auto w-full max-w-5xl px-6 py-24 md:py-32">
          <p className="font-sans text-xs uppercase tracking-[0.25em] text-accent">
            Placeholder
          </p>
          <h1 className="mt-6 max-w-3xl font-sans text-4xl font-medium leading-[1.05] tracking-tight md:text-6xl">
            Recourse for a voice or likeness cloned without consent.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-foreground/80 md:text-xl">
            This is the deploy scaffold. The tool will take the evidence and
            assemble a filing-ready takedown and claim package grounded in the
            law that applies. The tool assembles and drafts. A human files.
          </p>

          <div className="mt-12 border-t-2 border-rule pt-6">
            <p className="font-sans text-sm uppercase tracking-[0.2em] text-muted">
              Nothing here yet. Phase 0 proves the pipeline only.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t-2 border-rule">
        <div className="mx-auto w-full max-w-5xl px-6 py-4">
          <p className="font-sans text-xs leading-relaxed text-muted">
            Not legal advice. Verify current law. The tool does not file or
            transmit anything on your behalf.
          </p>
        </div>
      </footer>
    </main>
  );
}
