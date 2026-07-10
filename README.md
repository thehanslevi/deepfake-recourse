# Deepfake Recourse

**A recourse tool for people whose voice or likeness was cloned by AI without their consent.**

Live demo: https://deepfake-recourse.vercel.app

---

## The problem

AI voice and likeness cloning has become cheap, fast, and widely available. Working voice actors are hearing their voices in ads they never recorded; musicians are being made to appear to endorse products they've never heard of. The technology to do this is everywhere, but clear paths to do something about it are not.

Today, individuals in these situation face a wall. While enterprise tools exist to *detect* deepfakes, they are sold to banks and call centers, and are not built to provide support to individuals. Law firms and nonprofits publish *explainers* about your rights, but most stop at explaining and then hand you a list of other organizations to call. And, while the law itself is moving fast –– a growing set of state statutes now protect our voices and likenesses against AI replicas –– _knowing_ a law exists is not the same as being able to take action.

What stands between a person and a remedy is 1) knowing which law(s) apply to your situation, 2) drafting a notice, and 3) assembling evidence. That's what Deepfake Recourse is for.

## What Deepfake Recourse does

Deepfake Recourse takes a person from "my voice was cloned" to a ready-to-file takedown-and-claim package. It does four things:

1. **Intake.** DR captures what happened in structured form: what was cloned, where it is hosted, when it was found, and the person's home state.
2. **Triage.** DR identifies which legal instrument actually applies to the facts, grounded in the right-of-publicity law of the person's home state and the host platform's reporting rules. Every read is marked with a confidence level and a source.
3. **Assembly.** DR drafts the takedown notice or demand letter tuned to that instrument, and assembles a timestamped, fingerprinted evidence package.
4. **Record.** DR produces a single exportable case file that a person can take to a platform, an attorney, or keep as a record.

The triage and drafting steps make live calls to a large language model that maps the facts of an individual's situation to the applicable law(s) and produces a draft.

## What Deepfake Recourse does not cnot

This is built into the architecture, not added as a disclaimer.

**While Deepfake Recourse assembles and drafts, a human still files.** DR sends a notice automatically or tells a person they have a winning case. It identifies the instrument, drafts the notice, packages the evidence, and stops at a review gate. This separates a helpful tool from unauthorized practice of law, and it is enforced in DR's code.

**Deepfake Recourse knows the edge of its own competence.** Some situations are more serious and more dangerous than a cloned ad, above all nonconsensual intimate imagery. DR is built to *recognize* those cases and route them to the right specialized resource (for example, the Cyber Civil Rights Initiative for intimate-image abuse), rather than attempt to handle them.

**Deepfake Recourse is grounded in law that actually exists.** Legal content is drawn from enacted state statutes and verified against current law(s). Every output carries a note to verify the law(s) as it / they stand(s). DR does not depend on any pending legislation passing.

## Who Deepfake Recourse is for

The first version serves working artists and professionals in the right-of-publicity lane, i.e. a voice actor cloned for an ad, a musician put behind a fake endorsement, or a performer replicated without consent. These are people with real, enforceable claims under today's laws, with very few accessible ways to act on them.

## Where Deepfake Recourse is now (and where it plans to go from here)

This is a working version-one. It is deployed, runs the full pipeline end to end, and the AI steps make real calls. To keep the first build focused, DR is loaded with three fictional worked examples so anyone can see the whole flow in seconds. DR covers a deliberately small set of well-documented states (Tennessee, Washington, California, New York) rather than claiming national coverage.

The architecture was built so the obvious next steps are additions, not rewrites:

- **A real database** so people can return to their own cases over time. (Shipped: cases now persist, private to the browser that created them, with no account required.)
- **More states**, added as structured data as their statutes mature.
- **The federal lane.** If a national right-of-publicity law passes, it slots in as a new instrument rather than a redesign.
- **A handoff directory** connecting people to legal aid and attorneys when a case needs one.

The point of version one is to prove the recourse loop works and is responsible. DR's roadmap is focused on reach.

## How Deepfake Recourse is built

Next.js (App Router) and TypeScript, deployed on Vercel. The legal content lives as structured, verifiable data rather than logic buried in code, so it can be maintained and audited as the law changes. The two AI steps run server-side. The data layer is isolated behind a clean interface; it now runs on Postgres (Supabase), a swap that changed one file and no callers.

## Why I built it

Built by Hannah Levinson • more at [hrlevinson.com](https://hrlevinson.com)

Deepfake Recourse is one of three projects in a portfolio I'm building around the recognition that AI systems are increasingly making and shaping consequential decisions that affect people's lives, and that those affected need tools that give back agency and leverage wherever possible. Each of these projects draws on born-digital records and is built around similar governance principles: while the software I've built assembles, structures, and scores, humans makes the authoritative and ultimate call about their application. 

Each project applies this principle in a different arena: 

- **[AI Vendor Risk](https://github.com/thehanslevi/ai-vendor-risk)** — institutional governance. A tool that scores AI vendors against a seven-dimension governance rubric to give review teams consistent, defensible first-pass assessments a human ratifies or overrides.
- **Deepfake Recourse** — individual recourse. Gives a person whose voice or likeness was cloned a way to act, where before only institutions had the means.
- **[Tessera](https://github.com/thehanslevi/tessera-screening-engine)** — collective accountability. An evidence-aggregation engine that turns algorithmic tenant-screening denials into structured, consented evidence for attorneys, organizers, and regulators. It includes a synthetic-data research prototype, with a similar assemble-not-advise boundary enforced through layered human gates.

Together, these are meant to span a holistic range: equipping movements for collective action, giving institutions more rigorous ways to govern their own AI use, and helping individuals navigate circumstances where they might otherwise be underresourced.

---

*This project is a demonstration build. It is not legal advice, and the drafts it produces are starting points for a person to review, not filings. Always verify the current law as it applies to your situation.*
