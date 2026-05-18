import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type VerdictTone = "block" | "warning" | "allow";

interface Props {
  tone: VerdictTone;
  label: string;
  note: string;
}

const TONES: Record<VerdictTone, { pill: string; icon: LucideIcon }> = {
  block: { pill: "bg-red-600 text-white", icon: AlertTriangle },
  warning: { pill: "bg-amber-600 text-white", icon: AlertTriangle },
  allow: { pill: "bg-emerald-600 text-white", icon: CheckCircle2 },
};

export function VerdictPill({ tone, label, note }: Props) {
  const t = TONES[tone];
  const Icon = t.icon;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-md px-3 py-2 font-mono text-sm font-bold uppercase tracking-wide",
          t.pill,
        )}
      >
        <Icon className="h-4 w-4 shrink-0" aria-hidden />
        {label}
      </div>
      {note && (
        <p className="flex-1 text-sm font-bold text-muted-foreground">
          {note}
        </p>
      )}
    </div>
  );
}
