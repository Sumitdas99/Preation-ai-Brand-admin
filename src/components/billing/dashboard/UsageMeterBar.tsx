import { AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UsageMeterDetail } from "@/features/billing/adapters/toBillingDashboardData";

interface UsageMeterBarProps {
  meter: UsageMeterDetail;
  greyedOut?: boolean;
}

export function UsageMeterBar({ meter, greyedOut }: UsageMeterBarProps) {
  const percent = Math.min(meter.percent, 100);
  const overagePercent =
    meter.isOverage && meter.limit > 0
      ? Math.min((meter.overage / meter.limit) * 100, 100)
      : 0;

  return (
    <div className={cn(greyedOut && "opacity-50 grayscale")}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-slate-800">
          {meter.label}
        </span>
        <span
          className={cn(
            "text-sm tabular-nums",
            meter.isOverage
              ? "text-rose-700 font-semibold"
              : meter.isApproaching
                ? "text-amber-700 font-semibold"
                : "text-slate-700",
          )}
        >
          {meter.used.toLocaleString()} / {meter.limit.toLocaleString()} ·{" "}
          {meter.percent}%
        </span>
      </div>

      <div
        className="relative mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={meter.percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all",
            meter.isOverage
              ? "bg-rose-500"
              : meter.isApproaching
                ? "bg-amber-500"
                : "bg-emerald-500",
          )}
          style={{ width: `${percent}%` }}
        />
        {meter.isOverage ? (
          <div
            className="absolute inset-y-0 right-0 bg-rose-700/60"
            style={{ width: `${overagePercent}%` }}
            aria-hidden
          />
        ) : null}
      </div>

      <p
        className={cn(
          "mt-1.5 text-xs",
          meter.isOverage
            ? "text-rose-700"
            : meter.isApproaching
              ? "text-amber-700"
              : "text-slate-500",
        )}
      >
        {meter.inlineSubLabel}
      </p>

      {meter.alertMessage ? (
        <div
          className={cn(
            "mt-2 flex items-start gap-2 rounded-md border px-3 py-2 text-xs",
            meter.alertTone === "danger"
              ? "border-rose-200 bg-rose-50 text-rose-900"
              : "border-amber-200 bg-amber-50 text-amber-900",
          )}
        >
          {meter.alertTone === "danger" ? (
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-600" />
          ) : (
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
          )}
          <span>{meter.alertMessage}</span>
        </div>
      ) : null}
    </div>
  );
}
