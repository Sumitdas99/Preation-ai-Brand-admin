import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { BrandSummaryRow } from "../types";
import { BrandListRow } from "../rows/BrandListRow";

interface BrandListPanelProps {
  rows: BrandSummaryRow[];
  selectedBrandId?: string;
  onSelect: (brandId: string) => void;
  query: string;
  onQueryChange: (value: string) => void;
  onOnboardClick: () => void;
  isPending?: boolean;
  className?: string;
}

export function BrandListPanel({
  rows,
  selectedBrandId,
  onSelect,
  query,
  onQueryChange,
  onOnboardClick,
  isPending,
  className,
}: BrandListPanelProps) {
  return (
    <aside
      className={cn(
        "flex h-full min-h-0 flex-col border-r border-slate-200 bg-slate-50/60",
        className,
      )}
    >
      <div className="space-y-3 border-b border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">All Brands</h2>
          <span className="text-xs text-slate-500">
            {rows.length} {rows.length === 1 ? "brand" : "brands"}
          </span>
        </div>
        <div className="relative">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search brands"
            className="h-9 pl-8 text-sm"
            aria-label="Search brands"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {isPending ? (
          <BrandListSkeleton />
        ) : rows.length === 0 ? (
          <p className="px-1 py-6 text-center text-xs text-slate-500">
            No brands match your search.
          </p>
        ) : (
          rows.map((row) => (
            <BrandListRow
              key={row.brandId}
              row={row}
              selected={row.brandId === selectedBrandId}
              onSelect={onSelect}
            />
          ))
        )}
      </div>

      <div className="border-t border-slate-200 p-3">
        <Button
          type="button"
          variant="outline"
          onClick={onOnboardClick}
          className="w-full justify-center border-dashed border-[#0A1F44]/40 bg-white text-[#0A1F44] hover:bg-[#0A1F44]/5"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Onboard new brand
        </Button>
      </div>
    </aside>
  );
}

function BrandListSkeleton() {
  return (
    <div className="space-y-2">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-lg border border-slate-200 bg-white px-3 py-3"
        >
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="mt-2 h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
