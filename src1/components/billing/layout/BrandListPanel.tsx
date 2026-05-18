import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { BrandSummaryRow } from "../types";
import { BrandListRow } from "../rows/BrandListRow";

const DIVIDER_PASSIVE = "w-px shrink-0 self-stretch bg-border";
const DIVIDER_ACTIVE = "w-[3px] shrink-0 self-stretch bg-[#0A1F44]";

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
        "flex h-full min-h-0 flex-col overflow-hidden bg-white",
        className,
      )}
    >
      <div className="flex">
        <p className="flex-1 px-6 pt-[19px] pb-2 text-[13px] font-extrabold uppercase tracking-wide text-foreground/70">
          All Brands
        </p>
        <div className={DIVIDER_PASSIVE} />
      </div>

      <div className="flex">
        <div className="flex-1 border-b px-4 pb-4">
          <div className="group/search relative">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within/search:text-foreground"
            />
            <Input
              type="search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search brands..."
              className="h-9 rounded-md border border-slate-200 bg-white pl-9 text-sm shadow-none placeholder:text-muted-foreground/50 focus:border-2 focus:border-[#0A1F44] focus:outline-none focus:ring-0 focus:placeholder:text-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              aria-label="Search brands"
            />
          </div>
        </div>
        <div className={DIVIDER_PASSIVE} />
      </div>

      <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-hide">
        {isPending ? (
          <BrandListSkeleton />
        ) : rows.length === 0 ? (
          <div className="flex flex-1">
            <p className="flex-1 px-6 py-6 text-center text-xs text-muted-foreground">
              No brands match your search.
            </p>
            <div className={DIVIDER_PASSIVE} />
          </div>
        ) : (
          <>
            {rows.map((row) => {
              const selected = row.brandId === selectedBrandId;
              return (
                <div key={row.brandId} className="flex">
                  <BrandListRow
                    row={row}
                    selected={selected}
                    onSelect={onSelect}
                  />
                  <div className={selected ? DIVIDER_ACTIVE : DIVIDER_PASSIVE} />
                </div>
              );
            })}
            <div className="flex flex-1">
              <div className="flex-1" />
              <div className={DIVIDER_PASSIVE} />
            </div>
          </>
        )}
      </nav>

      <div className="flex">
        <div className="flex-1 border-t p-3">
          <Button
            type="button"
            onClick={onOnboardClick}
            className="w-full justify-center gap-1.5 bg-[#0A1F44] text-white hover:bg-[#0A1F44]/90"
          >
            <Plus className="h-4 w-4" /> Onboard new brand
          </Button>
        </div>
        <div className={DIVIDER_PASSIVE} />
      </div>
    </aside>
  );
}

function BrandListSkeleton() {
  return (
    <div>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex">
          <div className="flex-1 border-b px-6 py-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="mt-2 h-3 w-1/2" />
          </div>
          <div className={DIVIDER_PASSIVE} />
        </div>
      ))}
    </div>
  );
}
