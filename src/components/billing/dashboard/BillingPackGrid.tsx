import { cn } from "@/lib/utils";
import type { BillingPackGridCell } from "@/features/billing/adapters/toBillingDashboardData";

interface BillingPackGridProps {
  cells: BillingPackGridCell[];
  className?: string;
}

export function BillingPackGrid({ cells, className }: BillingPackGridProps) {
  if (!cells.length) return null;
  return (
    <dl
      className={cn(
        "grid gap-x-6 gap-y-4 rounded-lg border border-slate-200 bg-slate-50/40 p-4 sm:grid-cols-2 md:grid-cols-3",
        className,
      )}
    >
      {cells.map((cell) => (
        <div key={cell.label} className="min-w-0">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            {cell.label}
          </dt>
          <dd className="mt-1">
            {cell.tone === "highlight" ? (
              <span className="inline-flex items-center rounded border border-amber-300 bg-amber-50 px-2 py-0.5 text-sm font-medium text-amber-900">
                {cell.value}
              </span>
            ) : (
              <span className="block truncate text-sm font-semibold text-slate-900">
                {cell.value}
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
