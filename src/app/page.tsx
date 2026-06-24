export default function Home() {
  return (
    <main className="flex-1 flex flex-col">
      <header className="border-b border-line">
        <div className="mx-auto w-full max-w-4xl px-6 py-5 flex items-baseline justify-between">
          <span className="font-mono text-sm tracking-tight">
            timbre<span className="text-accent">*</span>
          </span>
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
            Likeness recourse — v1
          </span>
        </div>
      </header>

      <section className="flex-1">
        <div className="mx-auto w-full max-w-4xl px-6 py-28 md:py-40">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-accent">
            Index 00 · Placeholder
          </p>
          <div aria-hidden className="mt-5 h-px w-10 bg-accent" />

          <h1 className="mt-8 max-w-3xl font-serif text-4xl font-medium leading-[1.08] tracking-[-0.01em] md:text-6xl">
            Recourse for a voice or likeness cloned without consent.
          </h1>

          <p className="mt-8 max-w-xl font-serif text-lg leading-relaxed text-ink/80 md:text-xl">
            This is the deploy scaffold. Timbre takes the evidence and assembles a
            filing-ready takedown and claim package, grounded in the law that
            actually applies. Timbre assembles and drafts. A human files.
          </p>

          <p className="mt-10 font-mono text-sm">
            <a href="#boundary">Read the boundary ↓</a>
          </p>

          <div className="mt-20 border-t border-line pt-6">
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
              Nothing here yet. Phase 0 proves the pipeline. Identity locked first.
            </p>
          </div>
        </div>
      </section>

      <footer id="boundary" className="border-t border-line">
        <div className="mx-auto w-full max-w-4xl px-6 py-8">
          <p className="max-w-2xl font-mono text-xs leading-relaxed text-muted">
            Timbre <span className="text-accent">assembles and drafts</span>. A
            human files. It does not transmit or file anything on your behalf,
            and it does not tell you whether you have a winning case. Not legal
            advice. Verify current law.
          </p>
        </div>
      </footer>
    </main>
  );
}
