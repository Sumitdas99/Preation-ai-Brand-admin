import { cn } from "@/lib/utils";
import { SuitabilityFrameTile } from "./SuitabilityFrameTile";
import { TimelineScrubber } from "./TimelineScrubber";
import type { FrameContributionRowView, PerTimecodeView } from "./types";
import { SUITABILITY_DETAIL_COPY } from "@/features/suitability/adapters/copy";

interface Props {
  data: PerTimecodeView;
}

export function PerTimecodeTable({ data }: Props) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200/80 bg-card shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_8px_-2px_rgba(15,23,42,0.06)]">
      <header className="border-b border-slate-200/70 px-4 py-2">
        <h2 className="text-[15px] font-extrabold uppercase tracking-wider text-slate-700 [font-family:Arial,Helvetica,sans-serif]">
          {data.heading}
        </h2>
      </header>

      <div className="p-5">
        <TimelineScrubber
          scrubberLabel={data.scrubberLabel}
          durationMs={data.durationMs}
          peakMs={data.peakMs}
          axisTicks={data.axisTicks}
        />

        {data.contributions.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            {SUITABILITY_DETAIL_COPY.noFrameContributionsNote}
          </p>
        ) : (
          <div className="mt-6 min-w-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div
              role="table"
              className="min-w-[44rem] overflow-hidden rounded-md"
            >
              <div
                role="row"
                className={cn(ROW_GRID, ROW_BG.header, "px-4 py-2.5")}
              >
                <ColumnHead align="left">Frame</ColumnHead>
                <ColumnHead>Timecode</ColumnHead>
                <ColumnHead>Score</ColumnHead>
                <ColumnHead>Verdict</ColumnHead>
                <ColumnHead>Sub-field</ColumnHead>
              </div>
              {data.contributions.map((row, idx) => (
                <FrameRow
                  key={`${row.timecodeMs}-${row.subFieldLabel ?? "_"}`}
                  row={row}
                  rowIndex={idx}
                />
              ))}
            </div>
          </div>
        )}

        <p className="mt-5 text-xs font-semibold leading-relaxed text-slate-800">
          {data.footerNote}
        </p>
      </div>
    </section>
  );
}

const ROW_GRID =
  "grid items-center gap-x-6 grid-cols-[5rem_repeat(4,minmax(0,1fr))]";

const CELL_CENTER = "flex flex-col items-center text-center";
const CELL_LEFT = "flex flex-col items-start text-left";

const ROW_BG = {
  header: "bg-slate-100/80",
  light: "bg-slate-50/60",
  dark: "bg-slate-100/80",
} as const;

function ColumnHead({
  children,
  align = "center",
}: {
  children: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div
      role="columnheader"
      className={cn(
        align === "left" ? CELL_LEFT : CELL_CENTER,
        "text-[12px] font-extrabold uppercase tracking-wider text-slate-800",
      )}
    >
      {children}
    </div>
  );
}

interface FrameRowProps {
  row: FrameContributionRowView;
  rowIndex: number;
}

function FrameRow({ row, rowIndex }: FrameRowProps) {
  const ms = row.timecodeMs;
  const bg = rowIndex % 2 === 0 ? ROW_BG.light : ROW_BG.dark;
  return (
    <div
      role="row"
      className={cn(ROW_GRID, bg, "px-4 py-3.5")}
    >
      <div role="cell" className={CELL_LEFT}>
        <SuitabilityFrameTile
          timecodeMs={ms}
          timecodeLabel={row.timecodeLabel}
        />
      </div>
      <div role="cell" className={CELL_CENTER}>
        <div className="font-mono text-sm font-semibold tabular-nums text-slate-900">
          {row.timecodeLabel}
        </div>
        <div className="mt-0.5 font-mono text-[11px] font-medium tabular-nums text-slate-500">
          ({ms.toLocaleString()} ms)
        </div>
      </div>
      <div role="cell" className={CELL_CENTER}>
        <span
          className={cn(
            "font-mono text-sm font-bold tabular-nums",
            verdictNumberColor(row.verdict),
          )}
        >
          {row.score.toFixed(2)}
        </span>
      </div>
      <div role="cell" className={CELL_CENTER}>
        <FrameVerdictPill verdict={row.verdict} />
      </div>
      <div
        role="cell"
        className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center"
      >
        <span className="break-words text-sm font-semibold text-slate-900">
          {row.subFieldLabel ?? "—"}
        </span>
        {row.isPeak ? (
          <span className="inline-flex shrink-0 items-center rounded-sm bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700">
            Peak
          </span>
        ) : null}
      </div>
    </div>
  );
}

const VERDICT_PILL_STYLES: Record<
  FrameContributionRowView["verdict"],
  string
> = {
  BLOCKED: "border-[#cb2122]/60 bg-[#cb2122] text-white",
  FLAGGED: "border-[#e6880a]/60 bg-[#e6880a] text-white",
  ALLOWED: "border-emerald-500/60 bg-emerald-600 text-white",
};

function FrameVerdictPill({
  verdict,
}: {
  verdict: FrameContributionRowView["verdict"];
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-[11px] font-bold uppercase leading-none tracking-wider",
        VERDICT_PILL_STYLES[verdict] ??
          "border-border bg-muted text-muted-foreground",
      )}
    >
      {verdict}
    </span>
  );
}

function verdictNumberColor(
  verdict: FrameContributionRowView["verdict"],
): string {
  if (verdict === "BLOCKED") return "text-[#cb2122]";
  if (verdict === "FLAGGED") return "text-[#e6880a]";
  return "text-slate-900";
}
