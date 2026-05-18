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
        "grid gap-x-8 gap-y-5 md:grid-cols-2",
        className,
      )}
    >
      {cells.map((cell) => (
        <div key={cell.label} className="min-w-0">
          <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {cell.label}
          </dt>
          <dd className="mt-1">
            {cell.tone === "highlight" ? (
              <span className="inline-flex items-center rounded bg-amber-100 px-1.5 py-px text-xs font-bold uppercase tracking-wider text-amber-900">
                {cell.value}
              </span>
            ) : (
              <span className="block break-words font-sans text-sm font-semibold text-slate-800">
                {cell.value}
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
