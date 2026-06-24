# Likeness Recourse Tool — Spec v1

A recourse pipeline for people whose voice or likeness was cloned without consent. Working name TBD (left open deliberately, as with reading-log). This is a product spec, not a build plan. The companion build brief (BuildBrief_LikenessRecourse_FirstBuild.md) scopes the first slice; when brief and spec disagree on scope, the brief wins.

## One-sentence pitch

For a working artist or professional whose voice or likeness has been cloned by AI without consent, the tool takes the evidence and produces a filed-ready takedown-and-claim package grounded in the law that actually applies, with a human in control of what gets sent.

## Why now

The artist-likeness-rights moment is at peak salience. The NO FAKES Act cleared Senate Judiciary unanimously on 2026-06-18 and moved to the full Senate. TAKE IT DOWN became federal law 2025-05-19, with a 48-hour platform-takedown mandate and FTC enforcement now active. State right-of-publicity statutes covering AI replicas are enacted and multiplying: Tennessee's ELVIS Act (2024), Washington (eff. 2026-06-11), Montana (eff. 2026-01-01), Arkansas (2025), plus California/New York activity. The recourse layer for the individual is the open white space: enterprise detection (Pindrop, Reality Defender) and lawyers writing about remedies both exist; a self-serve tool that takes a non-famous person from "my voice got cloned" to a filed takedown does not.

## The scope decision (v1)

**v1 serves the artist/professional right-of-publicity lane.** Voice actor cloned for an ad, musician fronting a fake endorsement, performer replicated without consent. Enforceable instruments today: state right-of-publicity statutes (ELVIS-style) and platform terms of service. The build is architected so the federal NO FAKES private right lights up the moment it passes.

**Deliberately out of v1's deep path: the NCII / TAKE IT DOWN lane.** Nonconsensual intimate imagery and sextortion carry a duty of care that a portfolio-stage tool cannot responsibly discharge, and they serve a different, more vulnerable user. The triage step (below) *recognizes* these cases and routes them to the right resource rather than attempting to handle them. This boundary is a feature, not a gap: the tool knowing the edge of its own competence is the governance story.

## The governance boundary (load-bearing)

The tool **assembles and drafts; a human files.** It does not file on the user's behalf, does not transmit notices automatically, and does not tell a user they have a winning case. It identifies which instrument applies, drafts the notice, packages the evidence, and stops at a review gate. This is the unauthorized-practice-of-law line, the same Gate-3 boundary tessera enforces. It must be architectural, not a footer disclaimer.

## The four-step pipeline

### 1. Intake
The user describes what happened and provides evidence: the URL where the replica is hosted, a screenshot, an audio or video file, the platform, and their own jurisdiction (state). Capture is structured: incident type, what was cloned (voice / image / both), where it lives, when it was found, whether the user is identifiable, whether any prior consent existed (and its scope).

### 2. Triage (real Claude API call)
Maps the intake facts to the applicable instrument(s) and returns a tiered, confidence-marked read:
- State right-of-publicity statute (by the user's jurisdiction), with the specific elements that must be met.
- Platform ToS reporting channel for the host platform.
- DMCA, when there is a copyrightable underlying work the replica infringes.
- **Routing-out cases:** if the facts indicate NCII, election deepfake, or fraud, the tool says so plainly, does not draft, and surfaces the correct resource (e.g. CCRI for NCII, the platform's TAKE IT DOWN channel, an attorney). It states why it is routing out.
Each read carries a confidence marker and a source trace (which statute, which provision). Low-confidence reads are labeled as such, not asserted.

### 3. Assembly (real Claude API call)
Drafts the artifact tuned to the chosen instrument and platform:
- A takedown notice / cease-and-desist demand in the register the instrument requires.
- A preserved evidence package: the submitted material with capture timestamps and a chain-of-custody-style log of when each item was added.
The draft is explicitly a draft. Nothing is addressed-and-sent from inside the tool.

### 4. Record
A documented, exportable case file: the intake, the triage read with its sources, the drafted notice, and the evidence log. Exportable as a single file the user can take to a platform, an attorney, or keep as a record.

## Data model notes

- A **case** is the atomic object: intake + triage read + draft + evidence log, carrying a status (drafted / reviewed / exported).
- Evidence items carry their own timestamps and a hash or fingerprint so the package can show integrity (echoing tessera's audit-chain instinct, sized down: detect naive edits, do not over-claim tamper-proofing).
- Jurisdiction is a first-class field because the applicable statute depends on it. v1 can ship with a small set of well-covered states (TN, WA, CA, NY) and label others as "general right-of-publicity, verify locally."
- The instrument library (statutes, their elements, platform channels) is data, not hardcoded logic, so it updates as laws change — and so NO FAKES slots in as a new entry rather than a rewrite.

## Deliberate non-features (v1)

- No automatic filing or transmission. Human gate only.
- No NCII / intimate-image handling. Route out.
- No legal-outcome prediction ("you will win"). The tool maps instruments to facts; it does not advise on merits.
- No real user accounts or stored personal case data in the demo build. Seeded sample cases plus in-memory state.
- No detection / "is this a deepfake" classifier. The tool is for the recourse step after the user already knows; detection is a crowded enterprise category and a different build.

## Competitive position

Detection is owned at the enterprise tier (Pindrop, Reality Defender; bank/call-center pricing, no self-serve). Remedy *explainers* are everywhere (law-firm blogs, the ScoreDetect guide that ends by handing victims a list of nonprofits). The open position is the **individual-facing recourse pipeline that does the assembly work**, not another explainer and not enterprise detection. The moat is governance done right: correct instrument selection, an honest competence boundary, and a defensible UPL line.

## Risks, named

- **Law-in-flux.** Statutes change; the instrument library must be maintainable and every output should carry a "verify current law" note. The build must not hardcode legal conclusions.
- **UPL exposure.** Mitigated by the assemble-not-file boundary and the no-merits-advice rule. This is the central design constraint, not an afterthought.
- **Pending-law dependency.** v1 does not depend on NO FAKES passing; it is grounded in enacted state law and platform ToS. If NO FAKES passes, the federal lane is additive.
- **Demo honesty.** Seeded sample cases must be clearly fictional so the tool never appears to mishandle a real person's case.

## Open questions

- Product name and brand voice.
- Which states ship in the v1 instrument library.
- Whether the evidence package targets a specific export format (PDF case file) at launch or later.
- Whether to include a "find a lawyer / legal aid" handoff directory in v1 or as a fast-follow.
