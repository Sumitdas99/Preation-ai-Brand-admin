import { cn } from "@/lib/utils";

interface Props {
  label: string;
  tone?: "neutral" | "amber" | "red";
  className?: string;
}

const TONE: Record<NonNullable<Props["tone"]>, string> = {
  neutral: "border-slate-300 bg-slate-50 text-slate-700",
  amber: "border-amber-300 bg-amber-50 text-amber-800",
  red: "border-red-300 bg-red-50 text-red-800",
};

export function AgeBadge({ label, tone = "neutral", className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md border px-2 py-1 font-mono text-[12px] font-semibold tabular-nums",
        TONE[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}
