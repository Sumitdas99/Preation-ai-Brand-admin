import { Activity, Clock3, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { OveragePreviewVM } from "@/features/billing/adapters/toOveragePreviewData";
import { COPY } from "@/features/billing/adapters/copy";

interface OveragePreviewCardProps {
  vm?: OveragePreviewVM;
  isPending?: boolean;
  onRefresh?: () => void;
}

export function OveragePreviewCard({
  vm,
  isPending,
  onRefresh,
}: OveragePreviewCardProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#0A1F44]" aria-hidden />
            <h3 className="text-sm font-semibold text-slate-900">
              {COPY.overagePreviewTitle}
            </h3>
            <span className="rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Read-only
            </span>
          </div>
          <p className="text-xs text-slate-500">{COPY.overagePreviewSubtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          {vm ? (
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <Clock3 className="h-3.5 w-3.5" aria-hidden />
              {vm.cycleLabel} · {vm.daysRemainingLabel}
            </span>
          ) : null}
          {onRefresh ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onRefresh}
              disabled={isPending}
              className="h-8 gap-1.5 text-xs"
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5", isPending && "animate-spin")}
              />
              Refresh
            </Button>
          ) : null}
        </div>
      </header>

      {isPending || !vm ? (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Stat
              label="Estimated overage charge"
              value={vm.estimatedTotalLabel}
              hint="If cycle closed today"
              tone={vm.imagesMeter.isOverage || vm.videoMeter.isOverage ? "warning" : "neutral"}
            />
            <Stat
              label="Images — overage units"
              value={vm.imagesOverageLabel}
              hint={vm.imagesUnitPriceLabel}
              tone={vm.imagesMeter.isOverage ? "warning" : "neutral"}
            />
            <Stat
              label="Video — overage units"
              value={vm.videoOverageLabel}
              hint={vm.videoUnitPriceLabel}
              tone={vm.videoMeter.isOverage ? "warning" : "neutral"}
            />
          </div>

          <div className="mt-4 space-y-3">
            <Meter label="Images" used={vm.imagesMeter.used} limit={vm.imagesMeter.limit} percent={vm.imagesMeter.percent} overage={vm.imagesMeter.overage} remainingLabel={vm.imagesMeter.remainingLabel} />
            <Meter label="Video minutes" used={vm.videoMeter.used} limit={vm.videoMeter.limit} percent={vm.videoMeter.percent} overage={vm.videoMeter.overage} remainingLabel={vm.videoMeter.remainingLabel} />
          </div>

          {vm.calculationNote ? (
            <p className="mt-4 rounded-md bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-600">
              <strong>How this is calculated:</strong> {vm.calculationNote}.
              This is a real-time estimate only — final overage is computed by
              the cycle close job against the frozen usage snapshot.{" "}
              {COPY.overagePreviewSourceNote}
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}

interface StatProps {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "warning";
}

function Stat({ label, value, hint, tone = "neutral" }: StatProps) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-3",
        tone === "warning"
          ? "border-amber-200 bg-amber-50"
          : "border-slate-200 bg-slate-50/50",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-lg font-semibold tabular-nums",
          tone === "warning" ? "text-amber-900" : "text-slate-900",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-[11px] text-slate-500">{hint}</p> : null}
    </div>
  );
}

interface MeterProps {
  label: string;
  used: number;
  limit: number;
  overage: number;
  percent: number;
  remainingLabel: string;
}

function Meter({ label, used, limit, percent, overage, remainingLabel }: MeterProps) {
  const isOverage = overage > 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-medium text-slate-700">{label}</span>
        <span
          className={cn(
            "text-xs tabular-nums",
            isOverage ? "text-amber-700" : "text-slate-600",
          )}
        >
          {used.toLocaleString()} / {limit.toLocaleString()}
          {isOverage ? ` (+${overage.toLocaleString()})` : ""}
        </span>
      </div>
      <div className="relative mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            isOverage ? "bg-amber-500" : "bg-emerald-500",
          )}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
        {isOverage ? (
          <div
            className="absolute inset-y-0 right-0 bg-rose-500/40"
            style={{ width: `${Math.min((overage / Math.max(limit, 1)) * 100, 100)}%` }}
            aria-hidden
          />
        ) : null}
      </div>
      <p className="mt-1 text-[11px] text-slate-500">{remainingLabel}</p>
    </div>
  );
}
