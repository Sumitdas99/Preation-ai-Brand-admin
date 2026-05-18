import { Check as CheckIcon } from "lucide-react";
import { ActionsSection } from "../actions/ActionsSection";
import { VerdictPill } from "../primitives/VerdictPill";
import type { Check, PreFlightData } from "../types";

interface Props {
  data: PreFlightData;
}

export function AllowBottom({ data }: Props) {
  if (data.verdict.kind !== "allow-checks") return null;

  return (
    <section className="space-y-6 px-6 py-5">
      <VerdictPill
        tone="allow"
        label={data.verdict.pillLabel}
        note={data.verdict.pillNote}
      />

      <ChecksList
        header={data.verdict.listHeader}
        items={data.verdict.checks}
      />

      {data.actionSections.map((section, i) => (
        <ActionsSection key={i} title={section.title} items={section.items} />
      ))}
    </section>
  );
}

function ChecksList({ header, items }: { header: string; items: Check[] }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
        {header}
      </h3>
      <div className="space-y-2.5">
        {items.map((c) => (
          <CheckCard key={c.title} check={c} />
        ))}
      </div>
    </div>
  );
}

function CheckCard({ check }: { check: Check }) {
  return (
    <div className="rounded-r-md border-l-4 border-l-emerald-600 bg-emerald-50 p-4">
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600"
          aria-hidden
        >
          <CheckIcon className="h-3 w-3 text-white" strokeWidth={3} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-bold text-emerald-900">
            {check.title}
          </div>
          <p className="mt-1 text-[13px] font-semibold leading-relaxed text-foreground/80">
            {check.description}
          </p>
        </div>
      </div>
    </div>
  );
}
