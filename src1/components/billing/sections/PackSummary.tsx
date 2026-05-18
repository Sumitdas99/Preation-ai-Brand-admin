import type { PackSummary as PackSummaryVM } from "@/features/billing/adapters/toPackSummary";

interface PackSummaryProps {
  brandName: string;
  summary: PackSummaryVM;
}

export function PackSummary({ brandName: _brandName, summary }: PackSummaryProps) {
  const hasTrial = summary.showTrial;

  return (
    <section className="overflow-hidden rounded-lg border-[1.25px] border-slate-200 bg-card shadow-sm">
      <header className="border-b border-border bg-accent/30 px-6 py-3.5">
        <h3 className="text-xl font-semibold leading-none text-slate-600">
          Pack summary
        </h3>
      </header>

      {hasTrial ? (
        <div className="grid md:grid-cols-[1fr_1px_1fr]">
          <SummaryColumn title="Trial period" rows={summary.trialRows} />
          <div className="hidden bg-slate-200/70 md:block" />
          <SummaryColumn title="Committed monthly pack" rows={summary.committedRows} />
        </div>
      ) : (
        <SummaryColumn title="Committed monthly pack" rows={summary.committedRows} />
      )}
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
      <div className="px-4 py-2.5">
        <p className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
          {title}
        </p>
      </div>
      <dl className="divide-y divide-slate-200/40">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center gap-6 px-4 py-2.5"
          >
            <dt className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-muted-foreground sm:w-[160px]">
              {row.label}
            </dt>
            <dd className="min-w-0 flex-1 truncate text-xs font-semibold text-foreground sm:text-right">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
