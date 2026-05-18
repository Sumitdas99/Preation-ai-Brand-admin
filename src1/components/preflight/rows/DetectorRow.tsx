import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Detector, DetectorBand } from "../types";

interface BandStyle {
  bar: string;
  score: string;
  badge: string;
}

const BAND_STYLES: Record<DetectorBand, BandStyle> = {
  BLOCK_BAND: {
    bar: "bg-red-600",
    score: "text-red-800",
    badge: "bg-red-600 text-white",
  },
  FLAG_BAND: {
    bar: "bg-amber-500",
    score: "text-amber-700",
    badge: "bg-amber-500 text-white",
  },
  FLAGGED_ADVISORY: {
    bar: "bg-amber-500",
    score: "text-amber-700",
    badge: "bg-amber-100 text-amber-800 border border-amber-300",
  },
  FLAGGED_ACCEPTED: {
    bar: "bg-emerald-600",
    score: "text-emerald-700",
    badge: "bg-emerald-600 text-white",
  },
  CHALLENGED_BY_REVIEWER: {
    bar: "bg-indigo-500",
    score: "text-indigo-700",
    badge: "bg-indigo-100 text-indigo-800 border border-indigo-300",
  },
  ALLOW: {
    bar: "bg-emerald-600",
    score: "text-foreground",
    badge: "bg-emerald-600 text-white",
  },
  NOT_DETECTED: {
    bar: "",
    score: "text-muted-foreground",
    badge: "bg-transparent text-muted-foreground border border-border",
  },
  NO_PEOPLE_DETECTED: {
    bar: "",
    score: "text-muted-foreground",
    badge: "bg-transparent text-muted-foreground border border-border",
  },
};

interface Props {
  row: Detector;
  last?: boolean;
}

export function DetectorRow({ row, last }: Props) {
  const style = BAND_STYLES[row.band];
  const hasScore = typeof row.score === "number";
  const hasBar = hasScore && !!style.bar;

  return (
    <>
      <div
        className={cn(
          "col-span-full grid grid-cols-[subgrid] items-center py-3",
          !last && "border-b-2 border-border",
        )}
      >
        <span className="truncate text-sm font-bold text-foreground">
          {row.label}
        </span>

        <div className="min-w-0 overflow-hidden">
          {hasBar ? (
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full", style.bar)}
                style={{ width: `${Math.max(2, Math.min(100, row.score! * 100))}%` }}
                aria-hidden
              />
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </div>

        <span
          className={cn(
            "text-right font-mono text-sm font-semibold tabular-nums",
            style.score,
          )}
        >
          {hasScore ? row.score!.toFixed(2) : <span className="text-foreground">—</span>}
        </span>

        <div className="flex justify-end">
          <span
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wide whitespace-nowrap",
              style.badge,
            )}
          >
            {row.badgeLabel}
          </span>
        </div>
      </div>

      {row.inlineCallout && (
        <div className="col-span-full mb-2 flex items-start gap-3 rounded-md border border-dashed border-amber-400 bg-amber-50/60 px-4 py-3">
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
            aria-hidden
          />
          <span className="text-sm font-medium text-amber-800/90">
            {row.inlineCallout.text}
          </span>
        </div>
      )}
    </>
  );
}
