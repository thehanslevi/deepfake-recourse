"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Draft, EvidenceItem, InstrumentKind } from "@/lib/types";

const KIND_LABEL: Record<InstrumentKind, string> = {
  state_right_of_publicity: "Right-of-publicity demand letter",
  platform_tos: "Platform report",
  dmca: "DMCA takedown notice",
};

function EvidencePackageView({ evidence }: { evidence: EvidenceItem[] }) {
  if (evidence.length === 0) return null;
  return (
    <div className="border border-line bg-surface/40">
      <header className="border-b border-line px-5 py-3">
        <h3 className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ink">
          Preserved evidence package
        </h3>
      </header>
      <ul className="divide-y divide-line px-5">
        {evidence.map((item) => (
          <li key={item.id} className="py-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
                {item.label}
              </span>
              <span className="font-mono text-[0.65rem] text-muted">
                added {new Date(item.addedAt).toLocaleString("en-US")}
              </span>
            </div>
            <p className="mt-2 font-serif text-base leading-relaxed text-ink whitespace-pre-wrap break-words">
              {item.value}
            </p>
            <p className="mt-2 font-mono text-[0.65rem] text-muted break-all">
              sha256: {item.fingerprint.slice(0, 24)}…
            </p>
          </li>
        ))}
      </ul>
      <p className="border-t border-line px-5 py-4 font-mono text-[0.7rem] leading-relaxed text-muted">
        Each item carries the time it was added and a SHA-256 fingerprint of its
        content. This detects naive edits to the recorded material. It is not a
        tamper-proof seal.
      </p>
    </div>
  );
}

function DraftView({
  caseId,
  draft,
}: {
  caseId: string;
  draft: Draft;
}) {
  const [body, setBody] = useState(draft.body);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">(
    draft.edited ? "saved" : "idle",
  );
  const [error, setError] = useState("");

  async function save() {
    setSaveState("saving");
    setError("");
    try {
      const res = await fetch("/api/assembly", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, body }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setError(data?.error || "Could not save edits.");
        setSaveState("error");
        return;
      }
      setSaveState("saved");
    } catch {
      setError("Could not reach the service.");
      setSaveState("error");
    }
  }

  return (
    <div className="border border-line bg-surface/40">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
        <h3 className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ink">
          Draft · {draft.instrumentTitle}
        </h3>
        <span className="border border-accent px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-accent">
          Draft only
        </span>
      </header>

      <div className="space-y-5 px-5 py-5">
        <div className="space-y-1">
          <p className="font-serif text-xl leading-snug text-ink">{draft.title}</p>
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
            Directed to: {draft.recipient}
          </p>
        </div>

        <div>
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
            Draft text · editable
          </p>
          <textarea
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              if (saveState === "saved") setSaveState("idle");
            }}
            rows={18}
            className="mt-2 w-full rounded-none border border-line bg-[var(--ground)] px-4 py-3 font-mono text-sm leading-relaxed text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {saveState === "error" ? (
          <p className="font-mono text-[0.7rem] text-accent">{error}</p>
        ) : null}

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={save}
            disabled={saveState === "saving"}
            className="border border-accent bg-accent px-5 py-2 font-mono text-sm text-[var(--ground)] no-underline transition-colors hover:bg-accent-ink disabled:opacity-60"
          >
            {saveState === "saving" ? "Saving…" : "Save edits"}
          </button>
          {saveState === "saved" ? (
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
              Saved
            </span>
          ) : null}
        </div>

        <p className="border-t border-line pt-4 font-mono text-[0.7rem] leading-relaxed text-muted">
          This is a draft. Timbre does not address or send it. You review, edit,
          and file it yourself. Not legal advice. Verify current law.
        </p>
      </div>
    </div>
  );
}

type Status = "idle" | "loading" | "error";

export function AssemblyPanel({
  caseId,
  availableKinds,
  initialDraft,
  initialEvidence,
}: {
  caseId: string;
  availableKinds: InstrumentKind[];
  initialDraft: Draft | null;
  initialEvidence: EvidenceItem[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(initialDraft);
  const [evidence, setEvidence] = useState<EvidenceItem[]>(initialEvidence);
  const [kind, setKind] = useState<InstrumentKind>(
    availableKinds[0] ?? "state_right_of_publicity",
  );
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function run() {
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/assembly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, instrumentKind: kind }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setError(data?.error || "Assembly failed. Try again.");
        setStatus("error");
        return;
      }
      setDraft(data.draft as Draft);
      setEvidence(data.evidence as EvidenceItem[]);
      setStatus("idle");
      router.refresh();
    } catch {
      setError("Could not reach the assembly service. Try again.");
      setStatus("error");
    }
  }

  if (draft) {
    return (
      <div className="space-y-6">
        <EvidencePackageView evidence={evidence} />
        <DraftView caseId={caseId} draft={draft} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="font-serif text-base leading-relaxed text-ink/80">
        Assembly drafts the notice tuned to one instrument and preserves the
        evidence. It makes one real call to Claude (claude-sonnet-4-6) and
        returns a draft for you to review and edit. Nothing is sent.
      </p>

      <div className="border border-line bg-surface/40 px-5 py-5">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
          Draft for which instrument
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {availableKinds.map((k) => (
            <label
              key={k}
              className="flex cursor-pointer items-center gap-2 font-mono text-sm text-ink"
            >
              <input
                type="radio"
                name="instrumentKind"
                value={k}
                checked={kind === k}
                onChange={() => setKind(k)}
                className="accent-accent"
              />
              {KIND_LABEL[k]}
            </label>
          ))}
        </div>
      </div>

      {status === "error" ? (
        <div role="alert" className="border-2 border-accent bg-surface/60 px-5 py-4">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-accent">
            Assembly error
          </p>
          <p className="mt-2 font-serif text-base leading-relaxed text-ink">
            {error}
          </p>
          <p className="mt-2 font-mono text-[0.7rem] leading-relaxed text-muted">
            Nothing was saved. You can try again.
          </p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={run}
        disabled={status === "loading"}
        className="border border-accent bg-accent px-5 py-2 font-mono text-sm text-[var(--ground)] no-underline transition-colors hover:bg-accent-ink disabled:opacity-60"
      >
        {status === "loading" ? "Drafting…" : "Draft notice →"}
      </button>
    </div>
  );
}
