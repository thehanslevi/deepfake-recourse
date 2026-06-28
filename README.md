# Timbre

**A recourse tool for people whose voice or likeness was cloned by AI without their consent.**

Live demo: https://timbre-likeness-recourse.vercel.app

---

## The problem

AI voice and likeness cloning has become cheap, fast, and widely available. A working voice actor can find their voice in an ad they never recorded. A musician can be made to appear to endorse a product they have never heard of. The technology to do this is everywhere. The path to do something about it is not.

Today, an individual in this situation faces a wall. Enterprise tools exist to *detect* deepfakes, but they are sold to banks and call centers, not to people. Law firms and nonprofits publish *explainers* about your rights, but they stop at explaining, often by handing you a list of other organizations to call. The law itself is moving fast: a growing set of state statutes now protect your voice and likeness against AI replicas. But knowing a law exists is not the same as being able to use it.

The gap is the work in between. Knowing which law applies to your situation, drafting the notice, assembling the evidence. That work is what stands between a person and a remedy, and right now there is nothing that does it for them.

## What Timbre does

Timbre takes a person from "my voice was cloned" to a ready-to-file takedown-and-claim package. It does four things:

1. **Intake.** It captures what happened in structured form: what was cloned, where it is hosted, when it was found, and the person's state.
2. **Triage.** It identifies which legal instrument actually applies to the facts, grounded in the right-of-publicity law of the person's state and the host platform's reporting rules. Every read is marked with a confidence level and a source.
3. **Assembly.** It drafts the takedown notice or demand letter tuned to that instrument, and assembles a timestamped, fingerprinted evidence package.
4. **Record.** It produces a single exportable case file the person can take to a platform, an attorney, or keep as a record.

The triage and drafting steps are real AI, not a form wizard. They make live calls to a large language model that maps the facts to the applicable law and produces the draft.

## The line Timbre does not cross

This is the most important part, and it is built into the architecture, not added as a disclaimer.

**Timbre assembles and drafts. A human files.** It never sends a notice automatically. It never tells a person they have a winning case. It identifies the instrument, drafts the notice, packages the evidence, and stops at a review gate. This is the line that separates a helpful tool from the unauthorized practice of law, and it is enforced in the code, not just stated in the interface.

**Timbre knows the edge of its own competence.** Some situations are more serious and more dangerous than a cloned ad, above all nonconsensual intimate imagery. Timbre is built to *recognize* those cases and route them to the right specialized resource (for example, the Cyber Civil Rights Initiative for intimate-image abuse), rather than attempt to handle them. Knowing what not to touch is a feature.

**Timbre is grounded in law that actually exists.** The legal content is drawn from enacted state statutes, verified against current law, and every output carries a note to verify the law as it stands. It does not depend on any pending legislation passing.

## Who it is for

The first version serves working artists and professionals in the right-of-publicity lane: the voice actor cloned for an ad, the musician put behind a fake endorsement, the performer replicated without consent. These are people with a real, enforceable claim under today's law and no accessible way to act on it.

## Where it is now, and where it goes

This is a working version-one. It is deployed, it runs the full pipeline end to end, and the AI steps make real calls. To keep the first build focused, it ships with three clearly-fictional worked examples so anyone can see the whole flow in seconds, and it covers a deliberately small set of well-documented states (Tennessee, Washington, California, New York) rather than claiming national coverage it cannot yet back up.

The architecture was built so the obvious next steps are additions, not rewrites:

- **A real database** so people can return to their own cases over time.
- **More states**, added as structured data as their statutes mature.
- **The federal lane.** If a national right-of-publicity law passes, it slots in as a new instrument rather than a redesign.
- **A handoff directory** connecting people to legal aid and attorneys when a case needs one.

The point of version one is to prove the recourse loop works and is responsible. The roadmap is about reach.

## How it is built

Next.js (App Router) and TypeScript, deployed on Vercel. The legal content lives as structured, verifiable data rather than logic buried in code, so it can be maintained and audited as the law changes. The two AI steps run server-side. The data layer is isolated behind a clean interface so the move to a real database is a contained change.

## Why I built it

Built by Hannah Levinson • more at hrlevinson.com

Timbre is one of three projects in a portfolio built around a single conviction: AI systems increasingly make or shape consequential decisions about people, and the people on the receiving end need tools that give them leverage back. Each project does real work, draws on born-digital records, and is built around the same governance line, the software assembles, structures, or scores, and a human makes the authoritative call. None of them pretends to be the decision-maker. That boundary is the point.

The three take that idea into different arenas:

- **Timbre** (this project) — individual recourse. Gives a person whose voice or likeness was cloned a way to act, where before only institutions had the means.
- **[Tessera](https://github.com/thehanslevi/tessera-screening-engine)** — collective accountability. An evidence-aggregation engine that turns algorithmic tenant-screening denials into structured, consented evidence for attorneys, organizers, and regulators. A synthetic-data research prototype, with the same assemble-not-advise boundary enforced through layered human gates.
- **[AI Vendor Risk](https://github.com/thehanslevi/ai-vendor-risk)** — institutional governance. A tool that scores AI vendors against a seven-dimension governance rubric to give review teams consistent, defensible first-pass assessments a human ratifies or overrides.

Together they span the range: helping an individual, equipping a movement, and giving an institution a more rigorous way to govern its own AI use.

---

*This project is a demonstration build. It is not legal advice, and the drafts it produces are starting points for a person to review, not filings. Always verify the current law as it applies to your situation.*
