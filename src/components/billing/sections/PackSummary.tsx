import type { PackSummary as PackSummaryVM } from "@/features/billing/adapters/toPackSummary";

interface PackSummaryProps {
  brandName: string;
  summary: PackSummaryVM;
}

export function PackSummary({ brandName, summary }: PackSummaryProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="flex items-baseline justify-between gap-3 border-b border-slate-100 pb-3">
        <h3 className="text-sm font-semibold text-slate-900">
          Pack summary — {brandName}
        </h3>
        <span className="text-[11px] text-slate-500">
          Updates as you fill the fields above
        </span>
      </header>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        {summary.showTrial ? (
          <SummaryColumn title="Trial period (Section 2)" rows={summary.trialRows} />
        ) : null}
        <SummaryColumn
          title="Committed monthly pack (Section 3)"
          rows={summary.committedRows}
        />
      </div>
    </section>
  );
}

interface SummaryColumnProps {
  title: string;
  rows: { label: string; value: string }[];
}

function SummaryColumn({ title, rows }: SummaryColumnProps) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </p>
      <dl className="mt-2 space-y-1.5">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-baseline justify-between gap-3"
          >
            <dt className="text-xs text-slate-500">{row.label}</dt>
            <dd className="truncate text-sm font-medium text-slate-900">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
