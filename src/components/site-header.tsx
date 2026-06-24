import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="no-print border-b border-line">
      <div className="mx-auto flex w-full max-w-4xl items-baseline justify-between gap-6 px-6 py-5">
        <Link
          href="/"
          className="font-mono text-sm tracking-tight text-ink no-underline hover:text-ink"
        >
          timbre<span className="text-accent">*</span>
        </Link>
        <nav className="flex items-baseline gap-5 font-mono text-[0.7rem] uppercase tracking-[0.18em]">
          <Link href="/intake" className="text-accent no-underline hover:underline">
            Intake
          </Link>
          <Link href="/cases" className="text-accent no-underline hover:underline">
            Cases
          </Link>
          <span className="text-muted">v1</span>
        </nav>
      </div>
    </header>
  );
}
