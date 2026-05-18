import { cn } from "@/lib/utils";
import type { UsageMeterDetail } from "@/features/billing/adapters/toBillingDashboardData";

interface UsageMeterBarProps {
  meter: UsageMeterDetail;
  greyedOut?: boolean;
}

export function UsageMeterBar({ meter, greyedOut }: UsageMeterBarProps) {
  const percent = Math.min(meter.percent, 100);
  const remaining = Math.max(meter.limit - meter.used, 0);

  return (
    <div className={cn("my-0.5", greyedOut && "opacity-50 grayscale")}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-slate-800">
          {meter.label}
        </span>
        <span
          className={cn(
            "text-xs font-bold tabular-nums",
            meter.isOverage
              ? "text-rose-700"
              : meter.isApproaching
                ? "text-amber-700"
                : "text-emerald-700",
          )}
        >
          {meter.isOverage
            ? `${meter.overage.toLocaleString()} ${meter.unit} over limit`
            : `${remaining.toLocaleString()} remaining`}
        </span>
      </div>

      <div
        className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={meter.percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            "h-full rounded-full",
            meter.isOverage
              ? "bg-red-600"
              : meter.isApproaching
                ? "bg-amber-500"
                : "bg-emerald-600",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-1.5 flex items-baseline justify-between gap-3">
        <span className="text-xs font-semibold tabular-nums text-slate-500">
          {meter.used.toLocaleString()} of {meter.limit.toLocaleString()} used ({meter.percent}%)
        </span>
        {meter.overageRateLabel ? (
          <span className="text-xs font-medium text-slate-500">
            {meter.overageRateLabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}
