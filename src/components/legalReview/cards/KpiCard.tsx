import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import type { LegalDashboardKpi } from "../types";

interface Props {
  kpi: LegalDashboardKpi;
  className?: string;
}

const VALUE_TONE: Record<NonNullable<LegalDashboardKpi["tone"]>, string> = {
  neutral: "text-white",
  amber: "text-amber-300",
  red: "text-red-300",
  green: "text-emerald-300",
};

const ICON_TONE: Record<NonNullable<LegalDashboardKpi["tone"]>, string> = {
  neutral: "text-transparent",
  amber: "text-transparent",
  red: "text-red-300",
  green: "text-transparent",
};

export function KpiCard({ kpi, className }: Props) {
  const tone = kpi.tone ?? "neutral";
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className={cn("text-[34px] font-bold leading-none", VALUE_TONE[tone])}>
        {kpi.value}
      </div>
      <div className="flex items-center gap-1.5 text-sm text-white/70">
        <span>{kpi.label}</span>
        {tone === "red" ? (
          <AlertTriangle
            className={cn("h-4 w-4", ICON_TONE[tone])}
            aria-hidden
          />
        ) : null}
      </div>
    </div>
  );
}
