import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ActivateBlockVM } from "@/features/billing/adapters/toBillingDashboardData";

interface ActivateCalloutProps {
  block: ActivateBlockVM;
  onActivate: () => void;
  isPending?: boolean;
  className?: string;
}

export function ActivateCallout({
  block,
  onActivate,
  isPending,
  className,
}: ActivateCalloutProps) {
  return (
    <div className={cn("flex items-center justify-between gap-6 rounded-lg bg-amber-50 px-5 py-5", className)}>
      <div className="flex min-w-0 items-center gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
          <Zap className="h-5 w-5 text-amber-700" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-medium text-amber-900">
            {block.title}
          </h3>
          <p className="mt-0.5 max-w-2xl text-xs font-semibold leading-relaxed text-amber-800/80">
            {block.body}
          </p>
        </div>
      </div>
      <Button
        type="button"
        onClick={onActivate}
        disabled={isPending}
        className="shrink-0 gap-1 bg-amber-700 text-sm font-bold text-white hover:bg-amber-800"
      >
        {isPending ? "Activating…" : block.ctaLabel}
        {!isPending ? <ArrowRight className="h-4 w-4" strokeWidth={2.5} /> : null}
      </Button>
    </div>
  );
}
