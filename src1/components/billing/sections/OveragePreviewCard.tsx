import { Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { OveragePreviewVM } from "@/features/billing/adapters/toOveragePreviewData";
import { COPY } from "@/features/billing/adapters/copy";

interface OveragePreviewCardProps {
  vm?: OveragePreviewVM;
  isPending?: boolean;
}

export function OveragePreviewCard({
  vm,
  isPending,
}: OveragePreviewCardProps) {
  return (
    <section className="overflow-hidden rounded-lg border-[1.25px] border-slate-200 bg-card shadow-sm">
      <header className="flex items-center gap-3 border-b border-border bg-accent/30 px-6 py-3.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0A1F44] text-white">
          <Activity className="h-3.5 w-3.5" aria-hidden />
        </span>
        <h3 className="text-xl font-semibold leading-none text-slate-600">
          {COPY.overagePreviewTitle}
        </h3>
        {vm ? (
          <span className="ml-auto shrink-0 text-xs font-semibold text-slate-500">
            {vm.cycleLabel} ({vm.daysRemainingLabel})
          </span>
        ) : null}
      </header>

      {isPending || !vm ? (
        <div className="grid gap-3 px-6 py-5 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-3 px-6 pt-5 md:grid-cols-3">
            <Stat
              label="Estimated overage charge"
              value={vm.estimatedTotalLabel}
              tone={vm.imagesMeter.isOverage || vm.videoMeter.isOverage ? "warning" : "neutral"}
            />
            <Stat
              label="Overage images"
              value={vm.imagesOverageLabel}
              tone={vm.imagesMeter.isOverage ? "warning" : "neutral"}
            />
            <Stat
              label="Overage video"
              value={vm.videoOverageLabel}
              tone={vm.videoMeter.isOverage ? "warning" : "neutral"}
            />
          </div>

          <div className="mt-4 space-y-3 px-6 pb-5">
            <Meter label="Images" used={vm.imagesMeter.used} limit={vm.imagesMeter.limit} percent={vm.imagesMeter.percent} overage={vm.imagesMeter.overage} remainingLabel={vm.imagesMeter.remainingLabel} />
            <Meter label="Video minutes" used={vm.videoMeter.used} limit={vm.videoMeter.limit} percent={vm.videoMeter.percent} overage={vm.videoMeter.overage} remainingLabel={vm.videoMeter.remainingLabel} />
          </div>

          {vm.calculationNote ? (
            <p className="mx-6 mt-4 mb-5 rounded-md bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-600">
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
        "rounded-lg border px-4 py-3",
        tone === "warning"
          ? "border-amber-200 bg-amber-50"
          : "border-slate-200 bg-slate-50/50",
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-lg font-bold tabular-nums",
          tone === "warning" ? "text-amber-900" : "text-slate-900",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-xs font-semibold text-slate-500">{hint}</p> : null}
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
        <span className="text-xs font-bold text-slate-700">{label}</span>
        <span
          className={cn(
            "text-xs font-semibold tabular-nums",
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
      <p className="mt-1 text-xs font-semibold text-slate-500">{remainingLabel}</p>
    </div>
  );
}
