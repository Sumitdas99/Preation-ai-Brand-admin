import { Fragment } from "react";
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
    <nav
      aria-label="Onboarding progress"
      className={cn("border-b border-border bg-card", className)}
    >
      <ol className="mx-auto flex max-w-[1180px] items-center gap-3 px-6 py-[18px]">
        {steps.map((step, idx) => {
          const isComplete = idx < activeIndex;
          const isActive = idx === activeIndex;
          const prevComplete = idx > 0 && idx - 1 < activeIndex;
          return (
            <Fragment key={step.id}>
              {idx > 0 && (
                <span
                  aria-hidden
                  className={cn(
                    "h-0.5 min-w-6 flex-1 rounded-full transition-colors",
                    prevComplete ? "bg-[#0A1F44]" : "bg-[#0A1F44]/20",
                  )}
                />
              )}
              <li
                className={cn(
                  "flex shrink-0 items-center gap-2.5",
                  !isComplete && !isActive && "opacity-40",
                )}
                aria-current={isActive ? "step" : undefined}
              >
                <StepBadge
                  index={idx + 1}
                  complete={isComplete}
                  active={isActive}
                />
                <span
                  className={cn(
                    "font-display text-base tracking-tight text-[#0A1F44]",
                    isActive ? "font-[550] text-blue-700" : "font-[450]",
                  )}
                >
                  {step.label}
                </span>
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

const BADGE_BASE =
  "flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full text-[13px] font-semibold transition-shadow";

function StepBadge({
  index,
  complete,
  active,
}: {
  index: number;
  complete: boolean;
  active: boolean;
}) {
  if (complete) {
    return (
      <span className={cn(BADGE_BASE, "bg-[#0A1F44] text-white")}>
        <Check className="h-[17px] w-[17px]" aria-hidden strokeWidth={2.5} />
      </span>
    );
  }
  if (active) {
    return (
      <span
        className={cn(BADGE_BASE, "bg-[#0A1F44] text-white ring-4 ring-blue-100")}
      >
        {index}
      </span>
    );
  }
  return (
    <span className={cn(BADGE_BASE, "bg-[#0A1F44] text-white")}>
      {index}
    </span>
  );
}
