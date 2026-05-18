import { useCallback, useRef, useState } from "react";
import { Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { GeoPresetId } from "@/api/schemas/policyThresholds";
import type { CategoryLabelParts } from "../categoryLabels";
import { cn } from "@/lib/utils";

const fmt = (n: number) => n.toFixed(2);

export type BaselineCell =
  | { kind: "value"; value: number }
  | { kind: "absent" };

export type ChangeCell =
  | { kind: "unchanged" }
  | { kind: "delta"; previous: number; next: number }
  | { kind: "adds"; next: number; suffix: "flag" | "block" }
  | { kind: "removed"; previous: number; suffix: "flag" | "block" };

export interface ComparisonRowVm {
  categoryKey: string;
  labelParts: CategoryLabelParts;
  baseline: BaselineCell;
  changesByPreset: Record<GeoPresetId, ChangeCell>;
}

export interface ComparisonLockedRowVm {
  categoryKey: string;
  labelParts: CategoryLabelParts;
  baseline: BaselineCell;
}

interface PresetComparisonCardProps {
  baselinePresetId: GeoPresetId;
  pendingPresetId: GeoPresetId;
  presetIds: GeoPresetId[];
  rows: ComparisonRowVm[];
  lockedRows: ComparisonLockedRowVm[];
  lockedMessage: string;
}

function CategoryName({
  parts,
  locked = false,
}: {
  parts: CategoryLabelParts;
  locked?: boolean;
}) {
  const label = parts.kind
    ? `${parts.name} (${parts.kind.toLowerCase()})`
    : parts.name;

  return (
    <span
      className={cn(
        "text-sm font-bold whitespace-nowrap",
        locked ? "text-rose-700" : "text-foreground",
      )}
    >
      {label}
    </span>
  );
}

function BaselineValue({ cell }: { cell: BaselineCell }) {
  if (cell.kind === "absent") {
    return (
      <span className="text-sm font-bold text-muted-foreground/50">
        No flag
      </span>
    );
  }
  return (
    <span className="text-sm font-bold tabular-nums text-foreground/80">
      {fmt(cell.value)}
    </span>
  );
}

function ChangeCellView({
  cell,
  emphasized,
}: {
  cell: ChangeCell;
  emphasized: boolean;
}) {
  if (cell.kind === "unchanged") {
    return <span className="text-sm font-bold text-muted-foreground/30">—</span>;
  }
  if (cell.kind === "delta") {
    return (
      <span
        className={cn(
          "tabular-nums text-sm",
          emphasized
            ? "font-extrabold text-rose-600"
            : "font-bold text-rose-600",
        )}
      >
        <span className="line-through text-muted-foreground/50">
          {fmt(cell.previous)}
        </span>{" "}
        → {fmt(cell.next)}
      </span>
    );
  }
  if (cell.kind === "adds") {
    return (
      <span
        className={cn(
          "tabular-nums text-sm",
          emphasized
            ? "font-extrabold text-emerald-700"
            : "font-bold text-emerald-700",
        )}
      >
        +{fmt(cell.next)}
      </span>
    );
  }
  return (
    <span className="tabular-nums text-sm font-bold text-rose-600">
      <span className="line-through text-muted-foreground/50">
        No flag
      </span>{" "}
      → {fmt(cell.previous)}
    </span>
  );
}

export function PresetComparisonCard({
  baselinePresetId,
  pendingPresetId,
  presetIds,
  rows,
  lockedRows,
  lockedMessage,
}: PresetComparisonCardProps) {
  const otherPresetIds = presetIds.filter((id) => id !== baselinePresetId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollRight(el.scrollWidth - el.scrollLeft - el.clientWidth > 1);
  }, []);

  const scrollRefCallback = useCallback(
    (node: HTMLDivElement | null) => {
      (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current =
        node;
      if (!node) return;
      const ro = new ResizeObserver(checkScroll);
      ro.observe(node);
      checkScroll();
    },
    [checkScroll],
  );

  return (
    <Card className="overflow-hidden">
      <header className="space-y-1 border-b bg-muted/30 px-5 py-4">
        <h2 className="text-xl font-[550] text-slate-700">
          Preset Comparison: Changes vs{" "}
          <span className="font-[550]">{baselinePresetId}</span>
        </h2>
        <p className="text-xs font-bold uppercase tracking-wide text-foreground/70">
          Showing changes for{" "}
          <span className="font-bold uppercase text-[#0A1F44]">
            {pendingPresetId}
          </span>
        </p>
      </header>
      <div className="relative">
        <div
          ref={scrollRefCallback}
          onScroll={checkScroll}
          className="overflow-x-auto overscroll-x-contain [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
        >
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-foreground/10 bg-muted/30 text-left text-[13px] font-extrabold uppercase tracking-wide text-foreground/65">
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5 whitespace-nowrap">
                  {baselinePresetId}
                </th>
                {otherPresetIds.map((id) => (
                  <th
                    key={id}
                    className={cn(
                      "px-5 py-3.5 whitespace-nowrap",
                      id === pendingPresetId && "text-[#0A1F44]",
                    )}
                  >
                    {id}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => (
                <tr key={row.categoryKey} className="hover:bg-muted/10">
                  <td className="px-5 py-3.5">
                    <CategoryName parts={row.labelParts} />
                  </td>
                  <td className="px-5 py-3.5">
                    <BaselineValue cell={row.baseline} />
                  </td>
                  {otherPresetIds.map((id) => (
                    <td key={id} className="px-5 py-3.5">
                      <ChangeCellView
                        cell={
                          row.changesByPreset[id] ?? { kind: "unchanged" }
                        }
                        emphasized={id === pendingPresetId}
                      />
                    </td>
                  ))}
                </tr>
              ))}
              {lockedRows.length > 0 ? (
                <tr className="bg-rose-50/40">
                  <td
                    className="px-5 py-3 text-xs font-bold text-rose-700"
                    colSpan={2 + otherPresetIds.length}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Lock
                        className="h-3 w-3 shrink-0 text-rose-700"
                        strokeWidth={3}
                        aria-hidden
                      />
                      {lockedMessage}
                    </span>
                  </td>
                </tr>
              ) : null}
              {lockedRows.map((row) => (
                <tr key={row.categoryKey} className="bg-rose-50/40">
                  <td className="px-5 py-3.5 align-middle">
                    <span className="inline-flex items-center gap-2">
                      <CategoryName parts={row.labelParts} locked />
                      <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-rose-700">
                        <Lock
                          className="h-2.5 w-2.5"
                          strokeWidth={3}
                          aria-hidden
                        />
                        Locked
                      </span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5 align-middle">
                    <span className="text-sm font-bold tabular-nums text-rose-600">
                      {row.baseline.kind === "value"
                        ? fmt(row.baseline.value)
                        : "No flag"}
                    </span>
                  </td>
                  <td
                    className="px-5 py-3.5 align-middle text-xs font-bold text-rose-600/70"
                    colSpan={otherPresetIds.length}
                  />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
