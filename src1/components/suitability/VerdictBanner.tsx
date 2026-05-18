import {
  AlertTriangle,
  CheckCircle2,
  PackageX,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { VerdictBannerTone, VerdictBannerView } from "./types";

interface ToneStyle {
  container: string;
  iconWrap: string;
  icon: string;
  title: string;
  description: string;
  pillBlocked: string;
  pillFlagged: string;
  pillAllowed: string;
}

const PILL_BLOCKED = "border-[#cb2122]/60 bg-[#cb2122] text-white";
const PILL_FLAGGED = "border-[#e6880a]/60 bg-[#e6880a] text-white";
const PILL_ALLOWED = "border-emerald-500/60 bg-emerald-600 text-white";

const TONES: Record<VerdictBannerTone, ToneStyle> = {
  blocked: {
    container: "border-l-red-600 bg-red-50",
    iconWrap: "bg-red-600",
    icon: "text-white",
    title: "text-red-800",
    description: "text-red-900/85",
    pillBlocked: PILL_BLOCKED,
    pillFlagged: PILL_FLAGGED,
    pillAllowed: PILL_ALLOWED,
  },
  flagged: {
    container: "border-l-amber-600 bg-amber-50",
    iconWrap: "bg-amber-600",
    icon: "text-white",
    title: "text-amber-900",
    description: "text-amber-900/85",
    pillBlocked: PILL_BLOCKED,
    pillFlagged: PILL_FLAGGED,
    pillAllowed: PILL_ALLOWED,
  },
  clear: {
    container: "border-l-emerald-600 bg-emerald-50",
    iconWrap: "bg-emerald-600",
    icon: "text-white",
    title: "text-emerald-900",
    description: "text-emerald-900/85",
    pillBlocked: PILL_BLOCKED,
    pillFlagged: PILL_FLAGGED,
    pillAllowed: PILL_ALLOWED,
  },
  withdrawn: {
    container: "border-l-slate-700 bg-slate-100",
    iconWrap: "bg-slate-700",
    icon: "text-white",
    title: "text-slate-900",
    description: "text-slate-800/90",
    pillBlocked: PILL_BLOCKED,
    pillFlagged: PILL_FLAGGED,
    pillAllowed: PILL_ALLOWED,
  },
};

const ICONS: Record<VerdictBannerTone, LucideIcon> = {
  blocked: AlertTriangle,
  flagged: AlertTriangle,
  clear: CheckCircle2,
  withdrawn: PackageX,
};

interface Props {
  data: VerdictBannerView;
}

export function VerdictBanner({ data }: Props) {
  const tone = TONES[data.tone];
  const Icon = ICONS[data.tone];
  return (
    <section
      role="status"
      aria-live="polite"
      className={cn("rounded-r-md border-l-4 p-4", tone.container)}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
              tone.iconWrap,
            )}
          >
            <Icon
              className={cn("h-5 w-5", tone.icon)}
              aria-hidden
              strokeWidth={2.5}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className={cn("font-semibold tracking-tight", tone.title)}>
              {renderTitle(data.title)}
            </h2>
            <p
              className={cn(
                "mt-1 text-sm font-[650] leading-relaxed",
                tone.description,
              )}
            >
              {data.description}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <CountPill
            value={data.counts.blocked}
            label="BLOCKED"
            className={tone.pillBlocked}
          />
          <CountPill
            value={data.counts.flagged}
            label="FLAGGED"
            className={tone.pillFlagged}
          />
          <CountPill
            value={data.counts.allowed}
            label="ALLOWED"
            className={tone.pillAllowed}
          />
        </div>
      </div>
    </section>
  );
}

interface CountPillProps {
  value: number;
  label: string;
  className: string;
}

function renderTitle(title: string) {
  const colonIdx = title.indexOf(":");
  if (colonIdx === -1) {
    return <span className="text-lg">{title}</span>;
  }
  const lead = title.slice(0, colonIdx);
  const verdict = title.slice(colonIdx + 1).trim();
  return (
    <>
      <span className="text-lg">{lead}:</span>{" "}
      <span className="text-[15px] font-extrabold">{verdict}</span>
    </>
  );
}

function CountPill({ value, label, className }: CountPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-xs font-bold tracking-wide",
        className,
      )}
    >
      <span className="tabular-nums">{value}</span>
      <span>{label}</span>
    </span>
  );
}
