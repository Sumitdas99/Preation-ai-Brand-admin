import { cn } from "@/lib/utils";
import { ScoreBar } from "./ScoreBar";
import { SuitabilityFrameTile } from "./SuitabilityFrameTile";
import type { SuitabilityCategoryRowView } from "./types";

interface Props {
  row: SuitabilityCategoryRowView;
}

export function CategoryRow({ row }: Props) {
  const isBlocked = row.verdict === "BLOCKED";
  return (
    <article
      className={cn(
        "overflow-hidden rounded-r-md border-l-4 bg-card shadow-sm",
        isBlocked ? "border-l-red-600" : "border-l-amber-600",
      )}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4 sm:gap-x-5">
        <div className="flex w-full min-w-[10rem] flex-col gap-0.5 sm:w-auto sm:basis-[10rem]">
          <h4 className="min-w-0 truncate text-base font-semibold leading-tight">
            {row.categoryLabel}
          </h4>
          {row.hasDetail ? (
            <a
              href={row.detailHref}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              View detail →
            </a>
          ) : null}
        </div>

        <div className="flex w-full min-w-0 items-center sm:mr-3 sm:flex-1">
          <ScoreBar
            score={row.score}
            flagThreshold={row.thresholds.flag}
            blockThreshold={row.thresholds.block}
            size="full"
            ariaLabel={`Score ${formatPct(row.score)} for ${row.categoryLabel}`}
          />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="font-mono text-sm font-semibold tabular-nums">
            {formatScore(row.score)}
          </span>
          <VerdictPill verdict={row.verdict} />
        </div>

        <div className="shrink-0 text-xs leading-snug">
          <ThresholdStrip
            flag={row.thresholds.flag}
            block={row.thresholds.block}
          />
        </div>
      </div>

      {row.thumbnails.length > 0 ? (
        <div className="border-t border-border p-4">
          <ThumbStrip
            label={row.thumbnailLabel}
            thumbnails={row.thumbnails}
          />
        </div>
      ) : null}
    </article>
  );
}

function VerdictPill({ verdict }: { verdict: "BLOCKED" | "FLAGGED" | "ALLOWED" }) {
  const styles =
    verdict === "BLOCKED"
      ? "border-red-300 bg-red-50 text-red-700"
      : verdict === "FLAGGED"
        ? "border-amber-300 bg-amber-50 text-amber-800"
        : "border-emerald-300 bg-emerald-50 text-emerald-800";
  return (
    <span
      className={cn(
        "rounded-sm border px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider",
        styles,
      )}
    >
      {verdict}
    </span>
  );
}

interface ThresholdStripProps {
  flag: number;
  block?: number;
}

function ThresholdStrip({ flag, block }: ThresholdStripProps) {
  return (
    <div className="font-semibold text-muted-foreground">
      <span>
        Flag:{" "}
        <span className="font-bold text-foreground">{formatScore(flag)}</span>
      </span>
      <span className="mx-1.5 text-muted-foreground/40">·</span>
      <span>
        Block:{" "}
        <span className="font-bold text-foreground">
          {block !== undefined ? formatScore(block) : "—"}
        </span>
      </span>
    </div>
  );
}

interface ThumbStripProps {
  label: string;
  thumbnails: SuitabilityCategoryRowView["thumbnails"];
}

function ThumbStrip({ label, thumbnails }: ThumbStripProps) {
  if (thumbnails.length === 0) return <span aria-hidden />;
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-14 items-center text-xs font-bold text-muted-foreground">
        {label}
      </span>
      <div className="flex items-end gap-2">
        {thumbnails.map((t) => (
          <FrameThumb key={t.timecodeMs} thumb={t} />
        ))}
      </div>
    </div>
  );
}

interface FrameThumbProps {
  thumb: SuitabilityCategoryRowView["thumbnails"][number];
}

function FrameThumb({ thumb }: FrameThumbProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <SuitabilityFrameTile
        timecodeMs={thumb.timecodeMs}
        timecodeLabel={thumb.timecodeLabel}
      />
      <span className="font-mono text-[11px] font-semibold tabular-nums text-muted-foreground">
        {thumb.timecodeLabel}
      </span>
    </div>
  );
}

function formatScore(n: number): string {
  return n.toFixed(2);
}

function formatPct(n: number): string {
  return `${Math.round(n * 100)}%`;
}
