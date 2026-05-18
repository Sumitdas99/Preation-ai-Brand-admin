import { Fragment } from "react";
import { cn } from "@/lib/utils";
import type { ChallengeSummaryRow } from "../types";

interface Props {
  header: string;
  rows: ChallengeSummaryRow[];
}

const CHIP_TONE: Record<string, string> = {
  BLOCK_BAND: "bg-red-700/85 text-white",
  FLAG_BAND: "bg-amber-500 text-white",
  HIGH_CONFIDENCE: "bg-red-700/85 text-white",
  MEDIUM_CONFIDENCE: "bg-amber-500 text-white",
  LOW_CONFIDENCE: "bg-slate-400 text-white",
};

const DEFAULT_CHIP = "bg-[#E2E0F9] text-[#3C3489]";

const BAR_FILL: Record<string, string> = {
  BLOCK_BAND: "bg-red-700",
  FLAG_BAND: "bg-amber-500",
  BELOW_THRESHOLD: "bg-slate-400",
};

const SCORE_TONE: Record<string, string> = {
  BLOCK_BAND: "text-red-800",
  FLAG_BAND: "text-amber-700",
  BELOW_THRESHOLD: "text-slate-700",
};

export function DetectionSummaryReadOnly({ header, rows }: Props) {
  return (
    <section className="@container overflow-hidden rounded-md border border-[#534BB7]/25 bg-white">
      <h4 className="bg-white px-4 pt-3 pb-1 text-sm font-semibold uppercase tracking-wider text-[#3C3489]">
        {header}
      </h4>
      <div>
        {rows.map((row, i) => {
          const chipKey = row.band ?? row.value;
          const chipLabel = chipKey ? chipKey.replace(/_/g, " ") : null;
          const hasScore = row.score !== undefined;
          const fillPct = hasScore
            ? Math.max(0, Math.min(1, row.score!)) * 100
            : 0;
          const barFill = (row.band && BAR_FILL[row.band]) ?? "bg-slate-400";
          const scoreTone =
            (row.band && SCORE_TONE[row.band]) ?? "text-slate-800";
          return (
            <Fragment key={row.key}>
              {i > 0 ? (
                <div
                  aria-hidden
                  className="mx-4 h-[1.5px] rounded-full bg-[#534BB7]/25"
                />
              ) : null}
              <div className="flex items-center gap-3 px-4 py-2.5 text-sm">
                <span className="min-w-0 shrink truncate text-sm font-bold text-zinc-500 @[32rem]:shrink-0 @[32rem]:basis-44">
                  {row.label}
                </span>
                <div className="hidden min-w-0 flex-1 px-1 @[32rem]:block">
                  {hasScore ? (
                    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[#EEEDFE]">
                      <div
                        className={cn(
                          "absolute inset-y-0 left-0 rounded-full",
                          barFill,
                        )}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  ) : null}
                </div>
                <span
                  className={cn(
                    "ml-auto hidden w-12 shrink-0 text-right text-sm font-bold @[24rem]:inline-block @[32rem]:ml-0",
                    hasScore ? scoreTone : "text-[#3C3489]/40",
                  )}
                >
                  {hasScore ? row.score!.toFixed(2) : "—"}
                </span>
                <div className="ml-auto flex shrink-0 justify-end @[24rem]:ml-3 @[24rem]:w-40">
                  {chipLabel ? (
                    <span
                      className={cn(
                        "rounded px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider",
                        (chipKey && CHIP_TONE[chipKey]) || DEFAULT_CHIP,
                      )}
                    >
                      {chipLabel}
                    </span>
                  ) : null}
                </div>
              </div>
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}
