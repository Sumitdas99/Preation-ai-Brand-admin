import { Fragment } from "react";
import type { SuitabilityAllowedSummaryView } from "./types";

interface Props {
  data: SuitabilityAllowedSummaryView;
}

export function AllowedSummaryCard({ data }: Props) {
  return (
    <section className="flex flex-wrap items-start gap-x-6 gap-y-3 rounded-r-md border-l-4 border-l-emerald-600 bg-emerald-50/50 p-4 sm:flex-nowrap">
      <div className="min-w-0 flex-1">
        <h4 className="text-base font-semibold text-emerald-900">
          All {data.count} categories allowed
        </h4>
        <p className="mt-1 text-sm font-[650] leading-relaxed text-emerald-900/80">
          {data.categories.map((label, i) => (
            <Fragment key={`${label}-${i}`}>
              {i > 0 ? <span aria-hidden>, </span> : null}
              <span>{label}</span>
            </Fragment>
          ))}
          {data.note ? (
            <span className="text-emerald-900/70">, {data.note}</span>
          ) : null}
        </p>
      </div>
      <span className="shrink-0 rounded-md border border-emerald-600/60 bg-emerald-600 px-3 py-1.5 font-mono text-xs font-extrabold uppercase tracking-wider text-white">
        {data.badgeLabel}
      </span>
    </section>
  );
}
