"use client";

import { useState } from "react";
import { createCase } from "@/app/intake/actions";
import {
  COVERED_STATE_OPTIONS,
  GENERAL_STATE_OPTIONS,
} from "@/lib/states";
import { INCIDENT_TYPES } from "@/lib/types";

const inputClass =
  "w-full rounded-none border border-line bg-surface px-3 py-2 font-mono text-sm text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

const labelClass =
  "block font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted";

const helpClass = "font-serif text-sm leading-relaxed text-ink/70";

function Field({
  label,
  htmlFor,
  help,
  children,
}: {
  label: string;
  htmlFor?: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
      {help ? <p className={helpClass}>{help}</p> : null}
      {children}
    </div>
  );
}

function Radio({
  name,
  value,
  label,
  defaultChecked,
  onChange,
}: {
  name: string;
  value: string;
  label: string;
  defaultChecked?: boolean;
  onChange?: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 font-mono text-sm text-ink">
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        onChange={onChange}
        required
        className="accent-accent"
      />
      {label}
    </label>
  );
}

function Section({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-line bg-surface/40">
      <header className="flex items-baseline gap-3 border-b border-line px-5 py-3">
        <span className="font-mono text-[0.7rem] tracking-[0.18em] text-accent">
          {index}
        </span>
        <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-ink">
          {title}
        </h2>
      </header>
      <div className="space-y-6 px-5 py-6">{children}</div>
    </section>
  );
}

export function IntakeForm() {
  const [priorConsent, setPriorConsent] = useState<"none" | "yes">("none");

  return (
    <form action={createCase} className="space-y-6">
      <Section index="01" title="What happened">
        <Field
          label="Describe what happened"
          htmlFor="description"
          help="In your own words. What was cloned, where you saw it, and how it is being used."
        >
          <textarea
            id="description"
            name="description"
            required
            maxLength={5000}
            rows={5}
            placeholder="A cloned version of my voice is being used in an ad I never agreed to."
            className={inputClass}
          />
        </Field>

        <Field label="Incident type" htmlFor="incidentType">
          <select
            id="incidentType"
            name="incidentType"
            required
            defaultValue=""
            className={inputClass}
          >
            <option value="" disabled>
              Select one
            </option>
            {INCIDENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="What was cloned">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Radio name="clonedWhat" value="voice" label="Voice" />
            <Radio name="clonedWhat" value="image" label="Image" />
            <Radio name="clonedWhat" value="both" label="Both" />
          </div>
        </Field>
      </Section>

      <Section index="02" title="Where it lives">
        <Field
          label="URL where the replica is hosted"
          htmlFor="hostUrl"
          help="A direct link to where it is posted, if you have one."
        >
          <input
            id="hostUrl"
            name="hostUrl"
            type="url"
            required
            maxLength={2000}
            placeholder="https://"
            className={inputClass}
          />
        </Field>

        <Field label="Platform" htmlFor="platform">
          <input
            id="platform"
            name="platform"
            type="text"
            required
            maxLength={200}
            placeholder="YouTube, Instagram, TikTok, Spotify, a website"
            className={inputClass}
          />
        </Field>

        <Field label="When you found it" htmlFor="foundDate">
          <input
            id="foundDate"
            name="foundDate"
            type="date"
            required
            className={inputClass}
          />
        </Field>
      </Section>

      <Section index="03" title="You and consent">
        <Field
          label="Are you identifiable in the replica?"
          help="Could an ordinary viewer or listener recognize it as you?"
        >
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Radio name="identifiable" value="yes" label="Yes" />
            <Radio name="identifiable" value="no" label="No" />
            <Radio name="identifiable" value="unsure" label="Not sure" />
          </div>
        </Field>

        <Field label="Did any prior consent exist?">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Radio
              name="priorConsent"
              value="none"
              label="No consent"
              defaultChecked
              onChange={() => setPriorConsent("none")}
            />
            <Radio
              name="priorConsent"
              value="yes"
              label="Some consent existed"
              onChange={() => setPriorConsent("yes")}
            />
          </div>
        </Field>

        {priorConsent === "yes" ? (
          <Field
            label="Scope of that consent"
            htmlFor="consentScope"
            help="What was agreed to, and what the current use goes beyond."
          >
            <textarea
              id="consentScope"
              name="consentScope"
              rows={3}
              required
              maxLength={3000}
              placeholder="I licensed my voice for one campaign in 2024. This use was not part of it."
              className={inputClass}
            />
          </Field>
        ) : null}
      </Section>

      <Section index="04" title="Jurisdiction">
        <Field
          label="Your state"
          htmlFor="state"
          help="The applicable statute depends on this. States marked covered have tailored support in v1. Others are selectable but general; verify locally."
        >
          <select
            id="state"
            name="state"
            required
            defaultValue=""
            className={inputClass}
          >
            <option value="" disabled>
              Select your state
            </option>
            <optgroup label="Covered in v1">
              {COVERED_STATE_OPTIONS.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="General — verify locally">
              {GENERAL_STATE_OPTIONS.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </optgroup>
          </select>
        </Field>
      </Section>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">
          No AI yet. This step captures and stores your case.
        </p>
        <button
          type="submit"
          className="rounded-none border border-accent bg-accent px-5 py-2 font-mono text-sm btn-accent no-underline transition-colors hover:bg-accent-ink"
        >
          Save intake →
        </button>
      </div>
    </form>
  );
}
