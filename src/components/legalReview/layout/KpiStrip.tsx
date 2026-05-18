import { cn } from "@/lib/utils";
import type { LegalDashboardKpi } from "../types";
import { KpiCard } from "../cards/KpiCard";

interface Props {
  kpis: LegalDashboardKpi[];
  className?: string;
}

export function KpiStrip({ kpis, className }: Props) {
  if (kpis.length === 0) return null;
  return (
    <div className={cn("mx-6 mb-6 rounded-lg bg-white/5 px-6 py-5", className)}>
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} kpi={k} />
        ))}
      </div>
    </div>
  );
}
