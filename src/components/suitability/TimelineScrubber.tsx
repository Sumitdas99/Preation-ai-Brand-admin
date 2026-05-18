import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { AxisTickView } from "./types";

interface Props {
  durationMs?: number;
  peakMs?: number;
  axisTicks?: AxisTickView[];
  scrubberLabel?: string;
  onSeek?: (ms: number) => void;
}

const SCRUB_TRACK = "bg-primary/20";
const SCRUB_FILL = "bg-primary";
const SCRUB_THUMB = "bg-primary";
const SCRUB_PEAK_BORDER = "border-primary";

export function TimelineScrubber({
  durationMs,
  peakMs,
  axisTicks,
  scrubberLabel,
  onSeek,
}: Props) {
  const usable = durationMs !== undefined && durationMs > 0;
  const [scrubMs, setScrubMs] = useState(() => peakMs ?? 0);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    setScrubMs(peakMs ?? 0);
  }, [peakMs, durationMs]);

  const scrubPct = usable ? clamp01(scrubMs / (durationMs as number)) * 100 : 0;
  const peakPct =
    usable && peakMs !== undefined
      ? clamp01(peakMs / (durationMs as number)) * 100
      : undefined;

  function clientXToMs(clientX: number): number {
    if (!trackRef.current || !usable) return scrubMs;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = clamp01((clientX - rect.left) / rect.width);
    return Math.round(pct * (durationMs as number));
  }

  function snapToPeak(ms: number): number {
    if (!usable || peakMs === undefined || !trackRef.current) return ms;
    const dur = durationMs as number;
    const rectW = trackRef.current.getBoundingClientRect().width;
    if (rectW <= 0) return ms;
    const radius = (6 / rectW) * dur;
    return Math.abs(ms - peakMs) <= radius ? peakMs : ms;
  }

  function commit(ms: number) {
    if (!usable) return;
    const snapped = snapToPeak(ms);
    const clamped = clamp(snapped, 0, durationMs as number);
    setScrubMs(clamped);
    onSeek?.(clamped);
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!usable) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    commit(clientXToMs(e.clientX));
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !usable) return;
    commit(clientXToMs(e.clientX));
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  return (
    <div className="select-none space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        {scrubberLabel ? (
          <p className="text-xs font-semibold leading-snug text-slate-800">
            {scrubberLabel}
          </p>
        ) : (
          <span />
        )}
        {usable ? (
          <p className="shrink-0 font-mono text-xs font-semibold tabular-nums text-slate-800">
            <span className="font-bold text-slate-900">
              {formatTimecode(scrubMs)}
            </span>
            <span className="mx-1 font-semibold text-slate-500">/</span>
            <span className="font-semibold text-slate-800">
              {formatTimecode(durationMs as number)}
            </span>
          </p>
        ) : null}
      </div>

      <div
        ref={trackRef}
        aria-label="Timeline scrubber"
        className={cn(
          "relative flex h-5 w-full items-center",
          usable
            ? "cursor-pointer touch-none select-none"
            : "cursor-default opacity-60",
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className={cn(
            "relative h-1.5 w-full overflow-visible rounded-sm",
            SCRUB_TRACK,
          )}
        >
          <div
            className={cn(
              "absolute inset-y-0 left-0 rounded-sm",
              SCRUB_FILL,
            )}
            style={{ width: `${scrubPct}%` }}
            aria-hidden
          />

          {peakPct !== undefined ? (
            <div
              className={cn(
                "pointer-events-none absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2px] border-2 bg-white shadow-sm",
                SCRUB_PEAK_BORDER,
              )}
              style={{ left: `${peakPct}%` }}
              title={`Highest-scoring frame at ${formatTimecode(peakMs as number)}`}
              aria-label={`Highest-scoring frame at ${formatTimecode(peakMs as number)}`}
            />
          ) : null}

          {usable ? (
            <div
              className={cn(
                "pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_1px_3px_rgba(15,23,42,0.35)]",
                SCRUB_THUMB,
              )}
              style={{ left: `${scrubPct}%` }}
              aria-hidden
            />
          ) : null}
        </div>
      </div>

      {axisTicks && axisTicks.length > 0 && usable ? (
        <div className="relative h-4 w-full">
          {axisTicks.map((tick, i) => {
            const pct = clamp01(tick.ms / (durationMs as number)) * 100;
            const align =
              i === 0
                ? "left-0 translate-x-0"
                : i === axisTicks.length - 1
                  ? "right-0 -translate-x-0"
                  : "-translate-x-1/2";
            const style =
              i === 0 || i === axisTicks.length - 1
                ? undefined
                : { left: `${pct}%` };
            return (
              <span
                key={tick.ms}
                className={cn(
                  "absolute top-0 font-mono text-[11px] font-semibold tabular-nums text-slate-800",
                  align,
                )}
                style={style}
              >
                {tick.label}
              </span>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function clamp01(n: number): number {
  return clamp(n, 0, 1);
}

function formatTimecode(ms: number): string {
  const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
