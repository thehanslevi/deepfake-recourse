"use client";

// Global error boundary. If a page fails (for example the database is
// unreachable), the visitor gets a composed error state, never a white screen.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="flex-1">
      <div className="mx-auto w-full max-w-4xl px-6 py-24">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-accent">
          Something failed
        </p>
        <div aria-hidden className="mt-5 h-px w-10 bg-accent" />
        <h1 className="mt-8 max-w-2xl font-serif text-3xl font-medium leading-[1.1] md:text-4xl">
          This page could not load.
        </h1>
        <p className="mt-6 max-w-xl font-serif text-lg leading-relaxed text-ink/80">
          Nothing you entered was lost to this error. You can try again. If it
          keeps failing, the service behind it is likely down.
        </p>
        <div className="mt-8">
          <button
            type="button"
            onClick={reset}
            className="border border-accent bg-accent px-5 py-2 font-mono text-sm btn-accent no-underline transition-colors hover:bg-accent-ink"
          >
            Try again
          </button>
        </div>
      </div>
    </section>
  );
}
