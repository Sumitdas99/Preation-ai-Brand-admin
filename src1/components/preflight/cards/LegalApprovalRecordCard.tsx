import type { LegalApprovalRecord } from "../types";

interface Props {
  data: LegalApprovalRecord;
}

export function LegalApprovalRecordCard({ data }: Props) {
  return (
    <section className="border-b border-border px-6 py-5">
      <header className="mb-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Legal Approval Record
        </h2>
      </header>

      <div className="rounded-r-md border border-l-4 border-emerald-200 border-l-emerald-600 bg-emerald-50 px-4 py-3.5">
        <div className="mb-3 flex items-center gap-1">
          <AcuteCheck className="h-4 w-4 shrink-0 -translate-y-px text-emerald-800" />
          <h3 className="text-base font-semibold leading-relaxed text-emerald-800 [font-family:Arial,Helvetica,sans-serif]">
            {data.title}
          </h3>
        </div>

        <dl className="grid gap-x-6 gap-y-2.5 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
          {data.fields.map((field) => (
            <div key={field.label} className="min-w-0">
              <dt className="mb-1 text-xs font-bold uppercase tracking-wider text-emerald-600">
                {field.label}
              </dt>
              <dd
                className="truncate text-sm font-semibold tracking-tight text-emerald-900"
                title={field.value}
              >
                {field.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function AcuteCheck({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M4 13.5l5 5L21 5" />
    </svg>
  );
}
