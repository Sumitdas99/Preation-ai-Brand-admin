import type { HumanPresenceSubmission } from "@/api/schemas/consent";
import { humanPresenceConsentTypeLabel } from "@/features/consent/adapters/copy";
import { formatSubmittedAt } from "@/features/consent/lib/labels";
import { HumanPresenceForm } from "../forms/HumanPresenceForm";
import {
  SubmissionSummary,
  type SummaryItem,
} from "../primitives/SubmissionSummary";
import type { HumanPresenceSectionVM } from "../types";

interface Props {
  data: HumanPresenceSectionVM;
  organisationName: string;
  submitting: boolean;
  onSubmit: (body: HumanPresenceSubmission) => void;
}

export function HumanPresenceCard({
  data,
  organisationName,
  submitting,
  onSubmit,
}: Props) {
  if (!data.visible) return null;

  return (
    <section
      aria-labelledby="human-presence-section-title"
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <header className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-slate-50/60 px-6 py-3.5">
        <span
          aria-hidden
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-600 text-sm font-semibold text-white"
        >
          2
        </span>
        <h3
          id="human-presence-section-title"
          className="text-xl font-semibold leading-none text-slate-600"
        >
          {data.title}
        </h3>
        {!data.locked ? (
          <span className="ml-auto inline-flex items-center rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 font-mono text-xs font-semibold text-amber-900">
            {data.actionRequiredPill}
          </span>
        ) : null}
      </header>

      <div className="px-5 py-5">
        {data.locked && data.submitted ? (
          <SubmittedSummary data={data} />
        ) : (
          <HumanPresenceForm
            data={data}
            organisationName={organisationName}
            disabled={data.locked}
            submitting={submitting}
            onSubmit={onSubmit}
          />
        )}
      </div>
    </section>
  );
}

function SubmittedSummary({ data }: { data: HumanPresenceSectionVM }) {
  const s = data.submitted;
  if (!s) return null;
  const items: SummaryItem[] = [
    { term: "Detected", detail: String(s.person_count_detected) },
    { term: "Confirmed", detail: String(s.person_count_confirmed) },
    {
      term: "Consent type",
      detail: humanPresenceConsentTypeLabel(s.consent_type),
    },
    { term: "Notes", detail: s.notes },
    { term: "Submitted", detail: formatSubmittedAt(s.submitted_at) },
    { term: "By", detail: s.submitted_by },
  ];
  return (
    <SubmissionSummary
      tone="emerald"
      heading="Presence declaration recorded"
      items={items}
    />
  );
}
