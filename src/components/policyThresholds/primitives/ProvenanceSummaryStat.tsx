import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ProvenanceSummaryStatProps {
  value: ReactNode;
  label: string;
  caption?: string;
  tone?: "positive" | "neutral";
}

export function ProvenanceSummaryStat({
  value,
  label,
  caption,
  tone = "positive",
}: ProvenanceSummaryStatProps) {
  return (
    <div className="px-6 py-5">
      <div
        className={cn(
          "text-3xl font-bold leading-none tabular-nums",
          tone === "positive" ? "text-emerald-700" : "text-slate-800",
        )}
      >
        {value}
      </div>
      <div className="mt-3.5 text-sm font-bold text-slate-700">{label}</div>
      {caption ? (
        <div className="mt-1 text-xs font-bold text-muted-foreground">
          {caption}
        </div>
      ) : null}
    </div>
  );
}
