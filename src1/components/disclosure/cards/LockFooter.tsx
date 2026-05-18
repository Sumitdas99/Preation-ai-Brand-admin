import { BadgeCheck, Clock, Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LockFooterVM, LockStatusTone } from "../types";

interface Props {
  data: LockFooterVM;
  submitting?: boolean;
  onLock: () => void;
}

interface ToneVisuals {
  icon: LucideIcon;
  panel: string;
  iconWrap: string;
  iconColor: string;
  heading: string;
  body: string;
  chip: string;
  chipDot: string;
  chipLabel: string;
}

const TONE_VISUALS: Record<LockStatusTone, ToneVisuals> = {
  pending: {
    icon: Clock,
    panel: "bg-amber-50/40",
    iconWrap: "bg-amber-100/70 ring-1 ring-inset ring-amber-200/70",
    iconColor: "text-amber-700",
    heading: "text-amber-900",
    body: "text-amber-800/75",
    chip: "bg-amber-100/80 text-amber-800 ring-1 ring-inset ring-amber-200/70",
    chipDot: "bg-amber-500",
    chipLabel: "Pending",
  },
  ready: {
    icon: BadgeCheck,
    panel: "bg-emerald-50/40",
    iconWrap: "bg-emerald-100/70 ring-1 ring-inset ring-emerald-200/70",
    iconColor: "text-emerald-700",
    heading: "text-emerald-900",
    body: "text-emerald-800/75",
    chip:
      "bg-emerald-100/80 text-emerald-800 ring-1 ring-inset ring-emerald-200/70",
    chipDot: "bg-emerald-500",
    chipLabel: "Ready",
  },
  locked: {
    icon: Lock,
    panel: "bg-slate-50/60",
    iconWrap: "bg-slate-100 ring-1 ring-inset ring-slate-200",
    iconColor: "text-slate-600",
    heading: "text-slate-800",
    body: "text-slate-600",
    chip: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
    chipDot: "bg-slate-400",
    chipLabel: "Locked",
  },
};

export function LockFooter({ data, submitting, onLock }: Props) {
  const buttonDisabled = data.disabled || submitting;
  const tone = data.statusTone;
  const v = TONE_VISUALS[tone];
  const Icon = v.icon;

  return (
    <section>
      <div className="overflow-hidden rounded-lg border-[1.25px] border-slate-200 bg-card shadow-sm [contain:layout_paint]">
        <div className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-stretch lg:justify-between lg:gap-5">
          <div
            className={cn(
              "flex min-w-0 flex-1 items-center gap-3.5 rounded-md px-4 py-3.5",
              v.panel,
            )}
          >
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
                v.iconWrap,
              )}
            >
              <Icon
                className={cn("h-[22px] w-[22px]", v.iconColor)}
                strokeWidth={2}
                aria-hidden
              />
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h3
                  className={cn(
                    "text-[14px] font-semibold leading-tight",
                    v.heading,
                  )}
                >
                  {data.heading}
                </h3>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider",
                    v.chip,
                  )}
                >
                  <span
                    aria-hidden
                    className={cn("h-1.5 w-1.5 rounded-full", v.chipDot)}
                  />
                  {v.chipLabel}
                </span>
              </div>

              <p className={cn("text-[13px] font-semibold leading-relaxed", v.body)}>
                {data.body}
              </p>

              {tone === "locked" &&
              (data.lockedAt || data.lockedHash) ? (
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 pt-1.5 text-[11.5px] text-slate-500">
                  {data.lockedAt ? (
                    <span>{formatDateTime(data.lockedAt)}</span>
                  ) : null}
                  {data.lockedAt && data.lockedHash ? (
                    <span aria-hidden className="text-slate-300">
                      ·
                    </span>
                  ) : null}
                  {data.lockedHash ? (
                    <span className="font-mono text-slate-400">
                      {truncateHash(data.lockedHash)}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          {tone !== "locked" ? (
            <button
              type="button"
              onClick={onLock}
              disabled={buttonDisabled}
              className={cn(
                "inline-flex shrink-0 items-center justify-center gap-2 self-stretch rounded-md border px-5 py-3 text-[15px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-400 lg:self-auto",
                buttonDisabled
                  ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                  : "border-slate-200 bg-white text-slate-600 shadow-sm hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800",
              )}
            >
              <Lock className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              {submitting ? "Locking…" : data.ctaLabel}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function truncateHash(hash: string): string {
  if (hash.length <= 22) return hash;
  return `${hash.slice(0, 14)}…${hash.slice(-6)}`;
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}
