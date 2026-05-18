import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepDefinition {
  id: string;
  label: string;
}

interface StepProgressProps {
  steps: StepDefinition[];
  activeIndex: number;
  className?: string;
}

export function StepProgress({
  steps,
  activeIndex,
  className,
}: StepProgressProps) {
  return (
    <ol className={cn("flex flex-wrap items-center gap-3", className)}>
      {steps.map((step, i) => {
        const isComplete = i < activeIndex;
        const isActive = i === activeIndex;
        return (
          <li
            key={step.id}
            className="flex items-center gap-2 text-sm"
            aria-current={isActive ? "step" : undefined}
          >
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition",
                isComplete && "bg-emerald-500 text-white",
                isActive && "bg-[#0A1F44] text-white",
                !isComplete && !isActive && "bg-slate-200 text-slate-500",
              )}
            >
              {isComplete ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span
              className={cn(
                "font-medium",
                isComplete && "text-emerald-700",
                isActive && "text-slate-900",
                !isComplete && !isActive && "text-slate-500",
              )}
            >
              {step.label}
            </span>
            {i < steps.length - 1 ? (
              <span className="mx-1 hidden h-px w-8 shrink-0 bg-slate-300 sm:block" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
