import { cn } from "@/lib/utils";
import type { LegalRowStatusTone } from "../types";

interface Props {
  tone: LegalRowStatusTone;
  label: string;
  subline?: string;
  className?: string;
}

const DOT: Record<LegalRowStatusTone, string> = {
  amber: "bg-amber-500",
  green: "bg-emerald-500",
  red: "bg-red-500",
  neutral: "bg-slate-400",
};

const LABEL: Record<LegalRowStatusTone, string> = {
  amber: "text-amber-700",
  green: "text-emerald-700",
  red: "text-red-700",
  neutral: "text-foreground",
};

export function StatusDot({ tone, label, subline, className }: Props) {
  return (
    <div className={cn("flex items-start gap-2 leading-tight", className)}>
      <span
        aria-hidden
        className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", DOT[tone])}
      />
      <div className="min-w-0">
        <div className={cn("text-sm font-semibold", LABEL[tone])}>{label}</div>
        {subline ? (
          <div className={cn("text-[13px] font-medium", LABEL[tone])}>{subline}</div>
        ) : null}
      </div>
    </div>
  );
}
