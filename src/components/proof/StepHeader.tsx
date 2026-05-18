import { cn } from "@/lib/utils";

interface Props {
  step: number;
  title: string;
  badge?: string;
  badgeTone?: "required" | "neutral" | "info";
  rightSlot?: React.ReactNode;
}

export function StepHeader({
  step,
  title,
  badge,
  badgeTone = "required",
  rightSlot,
}: Props) {
  return (
    <header className="flex items-center gap-3 border-b border-slate-200 bg-slate-50/60 px-6 py-3.5">
      <span
        aria-hidden
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0A1F44] text-sm font-semibold text-white"
      >
        {step}
      </span>
      <h2 className="text-xl font-semibold leading-none text-slate-600">
        {title}
      </h2>
      {badge ? (
        <span
          className={cn(
            "shrink-0 text-sm font-semibold leading-none",
            badgeTone === "required" && "text-red-600",
            badgeTone === "info" && "text-emerald-700",
            badgeTone === "neutral" && "text-slate-500",
          )}
        >
          {badge}
        </span>
      ) : null}
      {rightSlot ? (
        <div className="ml-auto shrink-0 text-sm font-medium text-slate-500">
          {rightSlot}
        </div>
      ) : null}
    </header>
  );
}
