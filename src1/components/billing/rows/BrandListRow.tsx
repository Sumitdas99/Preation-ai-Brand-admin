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
        "flex min-w-0 flex-1 items-start border-b px-6 py-4 text-left text-sm transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0A1F44]",
        selected
          ? "bg-blue-50/70 text-[#0A1F44]"
          : "text-muted-foreground hover:bg-muted/50",
      )}
    >
      <div className="min-w-0 flex-1 space-y-2.5">
        <div
          className={cn(
            "truncate font-bold",
            selected ? "text-[#0A1F44]" : "text-foreground",
          )}
        >
          {row.brandName}
        </div>
        <div className="flex flex-wrap gap-1">
          <StatusBadgeList badges={row.badges} size="compact" />
        </div>
        {row.trialExpiresLabel ? (
          <p
            className={cn(
              "text-[11px] font-semibold leading-tight",
              selected ? "text-[#0A1F44]/60" : "text-muted-foreground",
            )}
          >
            {row.trialExpiresLabel}
          </p>
        ) : null}
      </div>
    </button>
  );
}
