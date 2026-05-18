import { cn } from "@/lib/utils";

export interface ScoreBarProps {
  score: number;
  flagThreshold: number;
  blockThreshold?: number;
  size?: "mini" | "full";
  showLegend?: boolean;
  markerLabel?: string;
  className?: string;
  ariaLabel?: string;
}

type Tone = "emerald" | "amber" | "red";

const ZONE_LABEL: Record<Tone, string> = {
  emerald: "ALLOWED",
  amber: "FLAGGED",
  red: "BLOCKED",
};

const MARKER_FILL: Record<Tone, string> = {
  emerald: "#059669",
  amber: "#f59e0b",
  red: "#dc2626",
};

const PILL_BG: Record<Tone, string> = {
  emerald: "bg-emerald-600",
  amber: "bg-[#e6880a]",
  red: "bg-[#cb2122]",
};

export function ScoreBar({
  score,
  flagThreshold,
  blockThreshold,
  size = "full",
  showLegend = false,
  markerLabel,
  className,
  ariaLabel,
}: ScoreBarProps) {
  const clamped = clamp01(score);
  const flag = clamp01(flagThreshold);
  const block =
    blockThreshold === undefined ? undefined : clamp01(blockThreshold);

  const isMini = size === "mini";
  const flagPct = flag * 100;
  const amberWidthPct =
    (block === undefined ? 1 : Math.max(0, block - flag)) * 100;
  const blockStartPct = flagPct + amberWidthPct;
  const indicatorPct = clamped * 100;

  const inBlocked = block !== undefined && clamped >= block;
  const inFlagged = !inBlocked && clamped >= flag;
  const tone: Tone = inBlocked ? "red" : inFlagged ? "amber" : "emerald";

  const barHeightClass = isMini ? "h-1" : "h-1.5";
  const triangleW = isMini ? 10 : 13;
  const triangleH = isMini ? 8 : 10;

  const computedAriaLabel =
    ariaLabel ??
    `Score ${formatPct(clamped)}, flag threshold ${formatPct(flag)}${
      block !== undefined
        ? `, block threshold ${formatPct(block)}`
        : ", advisory only"
    }, ${ZONE_LABEL[tone]} zone`;

  return (
    <div
      className={cn("w-full", className)}
      role="img"
      aria-label={computedAriaLabel}
    >
      <div className={cn("relative", barHeightClass)}>
        <div
          className={cn(
            "absolute inset-0 overflow-hidden rounded-full bg-slate-100 ring-1 ring-inset ring-slate-900/30 shadow-[0_1px_2px_rgba(15,23,42,0.18)]",
          )}
        >
          <div
            className="absolute inset-y-0 left-0 bg-emerald-500"
            style={{ width: `${flagPct}%` }}
            aria-hidden
          />
          <div
            className="absolute inset-y-0 bg-amber-500"
            style={{ left: `${flagPct}%`, width: `${amberWidthPct}%` }}
            aria-hidden
          />
          {block !== undefined ? (
            <div
              className="absolute inset-y-0 bg-red-500"
              style={{
                left: `${blockStartPct}%`,
                width: `${Math.max(0, 100 - blockStartPct)}%`,
              }}
              aria-hidden
            />
          ) : null}

          <div
            className="absolute inset-y-0 w-px bg-slate-900/40"
            style={{ left: `${flagPct}%` }}
            aria-hidden
            title={`Flag threshold ${formatPct(flag)}`}
          />
          {block !== undefined ? (
            <div
              className="absolute inset-y-0 w-px bg-slate-900/40"
              style={{ left: `${blockStartPct}%` }}
              aria-hidden
              title={`Block threshold ${formatPct(block)}`}
            />
          ) : null}
        </div>

        {markerLabel ? (
          <div
            className="absolute bottom-0 flex -translate-x-1/2 flex-col items-center transition-[left] duration-300 ease-out"
            style={{
              left: `${indicatorPct}%`,
              height: `calc(100% + 22px)`,
            }}
            title={`Score ${formatPct(clamped)}, ${ZONE_LABEL[tone]} zone`}
          >
            <span
              className={cn(
                "shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[11px] font-bold tabular-nums leading-none text-white shadow-[0_1px_2px_rgba(15,23,42,0.4)]",
                PILL_BG[tone],
              )}
            >
              {markerLabel}
            </span>
            <div className="-mt-px w-px flex-1 bg-slate-900/70" aria-hidden />
          </div>
        ) : (
          <div
            className="absolute bottom-0 flex -translate-x-1/2 flex-col items-center transition-[left] duration-300 ease-out"
            style={{
              left: `${indicatorPct}%`,
              height: `calc(100% + ${triangleH}px)`,
            }}
            title={`Score ${formatPct(clamped)}, ${ZONE_LABEL[tone]} zone`}
          >
            <svg
              width={triangleW}
              height={triangleH}
              viewBox={`0 0 ${triangleW} ${triangleH}`}
              aria-hidden
              className="shrink-0 drop-shadow-[0_1px_2px_rgba(15,23,42,0.4)]"
            >
              <polygon
                points={
                  isMini
                    ? "0.6,0.6 9.4,0.6 5,7.4"
                    : "0.6,0.6 12.4,0.6 6.5,9.4"
                }
                fill={MARKER_FILL[tone]}
                stroke="rgb(15 23 42)"
                strokeWidth={isMini ? 0.9 : 1.1}
                strokeLinejoin="round"
              />
            </svg>
            <div className="-mt-px w-px flex-1 bg-slate-900" aria-hidden />
          </div>
        )}
      </div>

      {showLegend ? (
        <div className="mt-1.5 flex justify-between text-[11px] font-semibold text-muted-foreground">
          <span className="text-foreground">Score {formatScore(clamped)}</span>
          <span>
            Flag {formatScore(flag)}
            {block !== undefined ? ` · Block ${formatScore(block)}` : " · Advisory"}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function formatPct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

function formatScore(n: number): string {
  return n.toFixed(2);
}
