import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadgeList } from "../primitives/StatusBadge";
import type { BrandSummaryRow } from "../types";

interface BrandListRowProps {
  row: BrandSummaryRow;
  selected: boolean;
  onSelect: (brandId: string) => void;
}

export function BrandListRow({ row, selected, onSelect }: BrandListRowProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(row.brandId)}
      aria-current={selected}
      className={cn(
        "group flex w-full items-start gap-3 rounded-lg border px-3 py-3 text-left transition outline-none",
        "focus-visible:ring-2 focus-visible:ring-[#0A1F44] focus-visible:ring-offset-1",
        selected
          ? "border-[#0A1F44] bg-[#0A1F44] text-white shadow-sm"
          : "border-transparent bg-white text-slate-900 hover:border-slate-200 hover:bg-slate-50",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
          selected ? "bg-white/10 text-white" : "bg-slate-100 text-slate-500",
        )}
      >
        <Building2 className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <div
          className={cn(
            "truncate text-sm font-semibold",
            selected ? "text-white" : "text-slate-900",
          )}
        >
          {row.brandName}
        </div>
        <StatusBadgeList badges={row.badges} />
        {row.trialExpiresLabel ? (
          <p
            className={cn(
              "text-[11px] leading-tight",
              selected ? "text-white/70" : "text-slate-500",
            )}
          >
            {row.trialExpiresLabel}
          </p>
        ) : null}
      </div>
    </button>
  );
}
