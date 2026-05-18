import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ConsentPath, RplSubmission } from "@/api/schemas/consent";
import { rplConsentTypeLabel } from "@/features/consent/adapters/copy";
import { formatSubmittedAt } from "@/features/consent/lib/labels";
import { CandidateChip } from "../primitives/CandidateChip";
import {
  SubmissionSummary,
  type SummaryItem,
} from "../primitives/SubmissionSummary";
import { PathAForm } from "../forms/PathAForm";
import { PathBForm } from "../forms/PathBForm";
import { PathCForm } from "../forms/PathCForm";
import type { RplPathOptionVM, RplSectionVM } from "../types";

interface Props {
  data: RplSectionVM;
  organisationName: string;
  submitting: boolean;
  onSubmitRpl: (body: RplSubmission) => void;
}

export function RplCard({
  data,
  organisationName,
  submitting,
  onSubmitRpl,
}: Props) {
  const [selected, setSelected] = useState<ConsentPath | undefined>(
    data.selectedPath,
  );

  if (!data.visible) return null;

  const locked = data.locked;
  const path = locked ? data.selectedPath : selected;
  const pathBPending =
    path === "B" && data.submitted?.consent_path === "B" && !locked;

  return (
    <section
      aria-labelledby="rpl-section-title"
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <header className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-slate-50/60 px-6 py-3.5">
        <span
          aria-hidden
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-600 text-sm font-semibold text-white"
        >
          1
        </span>
        <h3
          id="rpl-section-title"
          className="text-xl font-semibold leading-none text-slate-600"
        >
          {data.title}
        </h3>
        <div className="flex flex-wrap items-center gap-1.5">
          {data.statusPills.map((p) => (
            <StatusPill key={p} label={p} />
          ))}
        </div>
        {!locked ? (
          <span className="ml-auto inline-flex items-center rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 font-mono text-xs font-semibold text-amber-900">
            {data.actionRequiredPill}
          </span>
        ) : null}
      </header>

      <div className="px-5 pt-3 pb-5">
        <CandidatesBlock data={data} />

        <div className="-mx-5 mt-5 mb-3 border-t border-slate-100" />

        <PathSelector
          options={data.pathOptions}
          value={path}
          locked={locked}
          onChange={setSelected}
        />

        {path ? (
          <>
            <div className="-mx-5 mt-5 mb-3 border-t border-slate-100" />
            {locked && data.submitted ? (
              <SubmittedSummary data={data} />
            ) : (
              <>
                {path === "A" ? (
                  <PathAForm
                    copy={data.pathACopy}
                    consentTypeOptions={data.consentTypeOptions}
                    organisationName={organisationName}
                    disabled={locked}
                    submitting={submitting}
                    onSubmit={onSubmitRpl}
                  />
                ) : null}
                {path === "B" ? (
                  pathBPending ? (
                    <PathBPendingSummary data={data} />
                  ) : (
                    <PathBForm
                      copy={data.pathBCopy}
                      organisationName={organisationName}
                      disabled={locked}
                      submitting={submitting}
                      onSubmit={onSubmitRpl}
                    />
                  )
                ) : null}
                {path === "C" ? (
                  <PathCForm
                    copy={data.pathCCopy}
                    organisationName={organisationName}
                    disabled={locked}
                    submitting={submitting}
                    onSubmit={onSubmitRpl}
                  />
                ) : null}
              </>
            )}
          </>
        ) : null}
      </div>
    </section>
  );
}

function StatusPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-rose-800">
      {label}
    </span>
  );
}

function CandidatesBlock({ data }: { data: RplSectionVM }) {
  if (data.candidates.length === 0) return null;
  return (
    <div className="space-y-2.5">
      <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
        {data.candidatesHeader}
      </h2>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {data.candidates.map((c) => (
          <CandidateChip key={c.identity_id} data={c} />
        ))}
      </div>
    </div>
  );
}

interface PathSelectorProps {
  options: RplPathOptionVM[];
  value: ConsentPath | undefined;
  locked: boolean;
  onChange: (id: ConsentPath) => void;
}

function PathSelector({ options, value, locked, onChange }: PathSelectorProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Step 1 — Select your consent situation
        </h2>
        {value === undefined ? (
          <span className="text-[11px] font-bold leading-none text-rose-700">
            Required
          </span>
        ) : null}
      </div>
      <fieldset disabled={locked} className="space-y-2.5">
        {options.map((opt) => (
          <PathOptionCard
            key={opt.id}
            option={opt}
            checked={value === opt.id}
            disabled={locked}
            onSelect={() => onChange(opt.id)}
          />
        ))}
      </fieldset>
    </div>
  );
}

const TONE_STYLES: Record<
  RplPathOptionVM["tone"],
  {
    container: string;
    containerActive: string;
    radio: string;
    radioActive: string;
    title: string;
    description: string;
  }
> = {
  success: {
    container: "border-emerald-200 bg-emerald-50 hover:bg-emerald-100/60",
    containerActive: "border-emerald-500 bg-emerald-50",
    radio: "border-emerald-400",
    radioActive: "border-emerald-600 bg-emerald-600",
    title: "text-emerald-900/85",
    description: "text-emerald-900/75",
  },
  amber: {
    container: "border-amber-200 bg-amber-50 hover:bg-amber-100/60",
    containerActive: "border-amber-500 bg-amber-50",
    radio: "border-amber-400",
    radioActive: "border-amber-600 bg-amber-600",
    title: "text-amber-900/85",
    description: "text-amber-900/75",
  },
  danger: {
    container: "border-rose-200/80 bg-rose-50/60 hover:bg-rose-50",
    containerActive: "border-[#C9564A] bg-rose-50/60",
    radio: "border-rose-400",
    radioActive: "border-rose-600 bg-rose-600",
    title: "text-rose-900/85",
    description: "text-rose-900/75",
  },
};

interface PathOptionCardProps {
  option: RplPathOptionVM;
  checked: boolean;
  disabled: boolean;
  onSelect: () => void;
}

function PathOptionCard({
  option,
  checked,
  disabled,
  onSelect,
}: PathOptionCardProps) {
  const tone = TONE_STYLES[option.tone];
  return (
    <label
      className={cn(
        "group flex cursor-pointer items-start gap-3 rounded-md border-[1.5px] p-3.5 transition-colors",
        checked ? tone.containerActive : tone.container,
        disabled && "cursor-not-allowed opacity-70",
      )}
    >
      <input
        type="radio"
        name="rpl-path"
        value={option.id}
        checked={checked}
        disabled={disabled}
        onChange={onSelect}
        className="sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 bg-white transition-colors",
          checked ? tone.radioActive : tone.radio,
        )}
      >
        {checked ? (
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
        ) : null}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className={cn("text-sm font-semibold", tone.title)}>
          {option.label}
        </span>
        <span className={cn("text-xs leading-relaxed", tone.description)}>
          {option.description}
        </span>
      </div>
    </label>
  );
}

function PathBPendingSummary({ data }: { data: RplSectionVM }) {
  const s = data.submitted;
  if (!s || s.consent_path !== "B") return null;
  const items: SummaryItem[] = [
    { term: "Timeline note", detail: s.timeline_note },
    { term: "Submitted", detail: formatSubmittedAt(s.submitted_at) },
    { term: "By", detail: s.submitted_by },
  ];
  return (
    <SubmissionSummary
      tone="amber"
      heading="Pending declaration recorded"
      subtext={
        <>
          Asset remains on hold pending consent document upload. Switch to{" "}
          <strong className="font-bold text-slate-800">
            “We have valid consent on file”
          </strong>{" "}
          above when the document is available.
        </>
      }
      items={items}
    />
  );
}

function SubmittedSummary({ data }: { data: RplSectionVM }) {
  const s = data.submitted;
  if (!s) return null;
  const tone = data.status === "RPL_NO_CONSENT_BLOCK" ? "rose" : "emerald";
  const items: SummaryItem[] = [
    {
      term: "Consent type",
      detail: s.consent_type ? rplConsentTypeLabel(s.consent_type) : undefined,
    },
    { term: "Document", detail: s.document_filename },
    { term: "Description", detail: s.document_description },
    { term: "Timeline note", detail: s.timeline_note },
    { term: "Reason", detail: s.reason },
    { term: "Submitted", detail: formatSubmittedAt(s.submitted_at) },
    { term: "By", detail: s.submitted_by },
  ];
  return (
    <SubmissionSummary
      tone={tone}
      heading={
        data.status === "RPL_NO_CONSENT_BLOCK"
          ? "Escalated to Legal"
          : "Consent document attached"
      }
      items={items}
    />
  );
}
