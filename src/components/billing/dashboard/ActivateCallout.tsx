import { ArrowRight } from "lucide-react";
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
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-amber-900">{block.title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-amber-900/85">
            {block.body}
          </p>
        </div>
        <Button
          type="button"
          onClick={onActivate}
          disabled={isPending}
          className="bg-[#0A1F44] text-white hover:bg-[#0A1F44]/90"
        >
          {isPending ? "Activating…" : block.ctaLabel}
          {!isPending ? <ArrowRight className="ml-1 h-4 w-4" /> : null}
        </Button>
      </div>
      <p className="rounded-md bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-600">
        {block.implementationNote}
      </p>
    </div>
  );
}
