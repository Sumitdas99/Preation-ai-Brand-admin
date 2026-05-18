import { cn } from "@/lib/utils";
import type { BadgeTone, SubscriptionBadge } from "../types";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-slate-200/80 text-slate-700",
  info: "bg-sky-100 text-sky-800",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-900",
  danger: "bg-rose-100 text-rose-800",
};

const SIZE_CLASSES = {
  default: "rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
  compact: "rounded px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide",
} as const;

type BadgeSize = keyof typeof SIZE_CLASSES;

interface StatusBadgeProps {
  badge: SubscriptionBadge;
  size?: BadgeSize;
  className?: string;
}

export function StatusBadge({ badge, size = "default", className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center",
        SIZE_CLASSES[size],
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
  size?: BadgeSize;
  className?: string;
}

export function StatusBadgeList({ badges, size, className }: StatusBadgeListProps) {
  if (!badges.length) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {badges.map((badge, i) => (
        <StatusBadge key={`${badge.label}-${i}`} badge={badge} size={size} />
      ))}
    </div>
  );
}
