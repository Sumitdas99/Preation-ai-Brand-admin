import { Check } from "lucide-react";
import { ActionsSection } from "../actions/ActionsSection";
import { VerdictPill } from "../primitives/VerdictPill";
import type { Challenge, PreFlightData } from "../types";

interface Props {
  data: PreFlightData;
}

export function ChallengeBottom({ data }: Props) {
  if (data.verdict.kind !== "challenge") return null;
  const { pillLabel, pillNote, listHeader, challenge } = data.verdict;

  return (
    <section className="space-y-6 px-6 py-5">
      <VerdictPill tone="block" label={pillLabel} note={pillNote} />

      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {listHeader}
        </h3>
        <ChallengeStatusCard challenge={challenge} />
      </div>

      {data.actionSections.map((section, i) => (
        <ActionsSection key={i} title={section.title} items={section.items} />
      ))}
    </section>
  );
}

function ChallengeStatusCard({ challenge }: { challenge: Challenge }) {
  return (
    <div className="space-y-4 rounded-r-md border-l-4 border-indigo-500 bg-indigo-50 p-4">
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <span className="inline-flex max-w-full items-center rounded-md bg-indigo-600 px-3 py-1.5">
          <code
            className="truncate font-mono text-sm font-semibold uppercase tracking-wider text-white"
            title={challenge.enumValue}
          >
            {challenge.enumValue}
          </code>
        </span>
        <p className="text-right text-sm font-bold leading-relaxed text-indigo-900">
          {challenge.submittedAt} by {challenge.submittedBy}
        </p>
      </header>

      <div>
        <h4 className="mb-1 text-sm font-semibold uppercase tracking-wider text-indigo-900">
          Reviewer justification
        </h4>
        <div className="rounded-md border-2 border-indigo-200 bg-white px-4 py-3">
          <p className="text-sm font-bold italic leading-relaxed text-indigo-900">
            &ldquo;{challenge.reviewerJustification}&rdquo;
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-4">
        <div className="flex shrink-0 items-center gap-2 rounded-md border-2 border-indigo-200 bg-white px-3 py-2">
          <span
            className="flex h-3 w-3 shrink-0 items-center justify-center rounded-sm border-[1.5px] border-indigo-900/70"
            aria-hidden
          >
            <Check
              className="h-2 w-2 text-indigo-900/70"
              strokeWidth={3.75}
            />
          </span>
          <div>
            <div className="text-[11px] font-extrabold uppercase leading-[1.1] tracking-wider text-indigo-900/70">
              Declaration
            </div>
            <div className="text-[11px] font-extrabold uppercase leading-[1.1] tracking-wider text-indigo-900/70">
              confirmed
            </div>
          </div>
        </div>
        <p className="min-w-0 flex-1 text-sm font-bold italic leading-relaxed text-muted-foreground">
          &ldquo;{challenge.declarationText}&rdquo;
        </p>
      </div>

      <div className="rounded-md bg-indigo-900/5 px-4 pb-3">
        <p className="text-sm font-bold leading-relaxed text-indigo-900">
          {challenge.auditNote}
        </p>
      </div>
    </div>
  );
}
