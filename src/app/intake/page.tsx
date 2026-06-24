import type { Metadata } from "next";
import Link from "next/link";
import { IntakeForm } from "@/components/intake-form";

export const metadata: Metadata = {
  title: "Intake — Timbre",
};

export default function IntakePage() {
  return (
    <section className="flex-1">
      <div className="mx-auto w-full max-w-4xl px-6 py-16 md:py-24">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-accent">
          Index 01 · Intake
        </p>
        <div aria-hidden className="mt-5 h-px w-10 bg-accent" />

        <h1 className="mt-8 max-w-2xl font-serif text-3xl font-medium leading-[1.1] tracking-[-0.01em] md:text-5xl">
          Tell Timbre what happened.
        </h1>

        <p className="mt-6 max-w-xl font-serif text-lg leading-relaxed text-ink/80">
          This is structured capture. Timbre records the facts of your case and
          stores it. Nothing is analyzed or sent yet. You can review what was
          saved on the next screen.
        </p>

        <div className="mt-8 max-w-xl border border-line bg-surface/40 px-5 py-4">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
            Demonstration build
          </p>
          <p className="mt-2 font-serif text-base leading-relaxed text-ink/80">
            This is a demonstration build. The three{" "}
            <Link href="/cases">sample cases</Link> are the best way to see the
            full pipeline from intake to drafted notice. A case you create here
            is not saved permanently yet, so it may not be here if you come back
            later.
          </p>
        </div>

        <div className="mt-12">
          <IntakeForm />
        </div>
      </div>
    </section>
  );
}
