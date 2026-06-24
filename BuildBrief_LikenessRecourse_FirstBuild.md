# Build Brief — Likeness Recourse Tool, First Build

This brief is for Claude Code. It scopes the first build of the likeness-recourse tool. The full spec lives alongside it (Spec_LikenessRecourse_v1.md) and explains the why; read it for context, but build only what this brief scopes. When brief and spec disagree on scope, the brief wins.

## What this build is for

Demo-first, with one real AI step. The goal: a deployed, good-looking, clickable web app that proves the recourse loop and looks like a real product when shown to someone, where the triage and drafting steps genuinely call the Claude API so it is credibly an AI-governance tool and not a form wizard. Priorities, in order: it deploys live to a real URL; it looks designed, not boilerplate; a visitor can click through a seeded sample case in ten seconds without entering their own story; the triage and drafting steps make real Claude API calls; the code is structured so a real database and more instruments can be added later without a rewrite.

## Stack

- Next.js (App Router), TypeScript.
- Tailwind for styling.
- Deployed to Vercel from a GitHub repo (account: thehanslevi).
- No database yet. All data lives in a clean data-access layer backed by seed files and in-memory/local state, reached only through functions (getCases, getCase, addCase, runTriage, runAssembly), never directly, so a real database (Supabase/Postgres) is a contained change later.
- Two server routes that call the Anthropic API: one for triage (facts to applicable instruments), one for assembly (drafting the notice). The API key is read from the environment via .env, never committed, never exposed client-side. Use model claude-sonnet-4-6.
- The instrument library (statutes, their elements, platform reporting channels) lives as structured data (JSON/TS), not hardcoded conditionals, so it is maintainable and extensible.

## Design direction

Carries the Swiss-brutalist system from the reading-log so the pinned repos read as one body of work: hard black rules, a single restrained accent, Space Grotesk for structure, serif for body/reading text. Editorial and calm, generous whitespace, strong typography. This tool handles a serious subject, so the tone is composed and trustworthy, not playful. Avoid default-framework look.

## Scope: build these phases in order. Stop after each and confirm it works before the next.

### Phase 0: scaffold and deploy empty
Create the Next.js app, init the git repo, push to a new GitHub repo, deploy to Vercel so a near-empty placeholder is live at a real URL. No features yet. Prove the GitHub-to-Vercel pipeline before any feature code, so later failures are never ambiguous between code and plumbing. Confirm the live URL loads before moving on.

### Phase 1: intake
A structured intake form: incident type, what was cloned (voice / image / both), where it is hosted (URL + platform), when found, whether the user is identifiable, prior consent and its scope, and the user's state. Saves a case through the data layer. No AI yet; just capture and store.

### Phase 2: triage (first real Claude API call)
A server route sends the intake facts to the Claude API and returns a structured, confidence-marked read: applicable state right-of-publicity statute (from the instrument library, by jurisdiction) with its required elements; the host platform's ToS reporting channel; DMCA if a copyrightable underlying work is implicated. The route MUST instruct the model to return JSON only, parsed safely server-side. Each instrument carries a confidence marker and a source trace. **Routing-out:** if the facts indicate NCII, election deepfake, or fraud, the response says so, does not proceed to drafting, and names the correct external resource. Render the triage read clearly, confidence and sources visible.

### Phase 3: assembly (second real Claude API call)
For a non-routed-out case, a server route drafts the takedown/demand notice tuned to the chosen instrument and platform, and assembles a preserved evidence package (submitted items + capture timestamps + an add-log). The draft is labeled a draft. Nothing is addressed-and-sent from the app. Render the draft for review and editing.

### Phase 4: record and seeded cases
A case file view assembling intake + triage + draft + evidence log, with an export action (single-file export; PDF or print-to-PDF is fine for v1). Seed three clearly-fictional sample cases (a cloned voice-actor ad, a musician fake endorsement, and one that correctly routes OUT to show the competence boundary) so the app looks alive and a visitor can click a worked example without entering anything real.

## Explicitly out of scope for this build
- Real user accounts, login, auth. Single-user plus seeded sample cases.
- A real database. Seed and in-memory only, behind the data layer.
- Any automatic filing or transmission of notices.
- NCII / intimate-image case handling (route out only).
- Legal-outcome / merits prediction.
- A deepfake-detection classifier.
- Multi-jurisdiction completeness. Ship a small set of well-covered states (suggest TN, WA, CA, NY); label others "general — verify locally."

## The governance boundary (do not violate)
The tool assembles and drafts; the human files. No auto-send. No "you will win" merits advice. The routing-out behavior and the assemble-not-file gate are core features and must be visible in the UI, not buried. Every legal output carries a "verify current law; this is not legal advice" note.

## Working agreement
- One phase at a time. After each, commit, push, confirm the live deploy reflects the change, and report the live URL when it changes.
- Keep the data-access layer and the instrument library clean and documented; they are the seams that a database and new statutes plug into.
- The two Anthropic API routes must keep the key server-side and return parsed JSON; handle API errors gracefully (the demo must not white-screen if a call fails — fall back to a clear error state).
- When a decision is ambiguous and expensive to reverse, ask rather than guess.
- Match the spec's voice in user-facing copy: flat declarative sentences, no em dashes doing structural work, plain language.

---

# Claude Code setup (run these before the first prompt)

Environment is already proven from the reading-log build (Node, git, GitHub CLI as thehanslevi, Vercel linked, Claude Code installed). For this project:

1. `mkdir ~/Projects/likeness-recourse && cd ~/Projects/likeness-recourse`
2. Move `Spec_LikenessRecourse_v1.md` and `BuildBrief_LikenessRecourse_FirstBuild.md` into that folder.
3. Create a `.env` in the folder with `ANTHROPIC_API_KEY=...` and a tracked `.env.example` with the key name only. Confirm `.gitignore` covers `.env` and `.env.*` before the first commit.
4. Run `claude` in the folder. Confirm browser login and plan access.

## First prompt to Claude Code (Phase 0 only)

> Read Spec_LikenessRecourse_v1.md and BuildBrief_LikenessRecourse_FirstBuild.md in this folder. Build Phase 0 ONLY: scaffold a Next.js (App Router, TypeScript, Tailwind) app, initialize a git repo, push to a new GitHub repo under the thehanslevi account, and deploy to Vercel so a near-empty placeholder page is live at a real URL. Do not build any features. Confirm the .gitignore covers .env and .env.* before the first commit, and that no secrets are tracked. When done, report the live Vercel URL and stop so I can confirm it loads before we proceed.

## Phase 1 prompt (after Phase 0 confirmed)

> Phase 0 is confirmed live at [URL]. Now build Phase 1 ONLY from the brief: the structured intake form and case storage through the data-access layer. No AI calls yet. Keep all storage behind data-layer functions (getCases, getCase, addCase). Commit, push, confirm the live deploy, and report the URL. Stop after Phase 1.

## Phase 2 prompt (after Phase 1 confirmed)

> Phase 1 is confirmed. Build Phase 2 ONLY: the triage server route that calls the Anthropic API (model claude-sonnet-4-6, key from .env, server-side only). It sends intake facts and returns JSON only — applicable state right-of-publicity statute by jurisdiction with required elements, host-platform ToS channel, and DMCA if a copyrightable work is implicated — each with a confidence marker and source trace. If facts indicate NCII, election deepfake, or fraud, return a routed-out result that names the correct external resource and does not proceed to drafting. Parse the JSON safely server-side; handle API errors with a clear error state, never a white screen. Build the instrument library as structured data, not hardcoded conditionals. Render the triage read with confidence and sources visible. Commit, push, confirm live, report URL. Stop after Phase 2.

Phases 3 and 4 prompts follow the same pattern: name the prior phase as confirmed, scope only the next phase from the brief, require commit/push/confirm/report, and stop. Keep the assemble-not-file boundary and the routing-out behavior visible in the UI throughout.
