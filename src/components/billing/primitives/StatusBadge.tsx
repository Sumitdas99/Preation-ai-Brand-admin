import { cn } from "@/lib/utils";
import type { BadgeTone, SubscriptionBadge } from "../types";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-700 border border-slate-200",
  info: "bg-sky-50 text-sky-700 border border-sky-200",
  success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  warning: "bg-amber-50 text-amber-800 border border-amber-200",
  danger: "bg-rose-50 text-rose-700 border border-rose-200",
};

interface StatusBadgeProps {
  badge: SubscriptionBadge;
  className?: string;
}

export function StatusBadge({ badge, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        TONE_CLASSES[badge.tone],
        className,
      )}
    >
      {badge.label}
    </span>
  );
}

interface StatusBadgeListProps {
  badges: SubscriptionBadge[];
  className?: string;
}

export function StatusBadgeList({ badges, className }: StatusBadgeListProps) {
  if (!badges.length) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {badges.map((badge, i) => (
        <StatusBadge key={`${badge.label}-${i}`} badge={badge} />
      ))}
    </div>
  );
}
