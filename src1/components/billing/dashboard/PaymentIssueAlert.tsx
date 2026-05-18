import { AlertCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PastDueBlockVM } from "@/features/billing/adapters/toBillingDashboardData";

interface PaymentIssueAlertProps {
  block: PastDueBlockVM;
  onUpdatePayment: () => void;
  isPending?: boolean;
  className?: string;
}

export function PaymentIssueAlert({
  block,
  onUpdatePayment,
  isPending,
  className,
}: PaymentIssueAlertProps) {
  const isSuspended = block.variant === "suspended";

  return (
    <section
      className={cn(
        "rounded-r-md border-l-4 border-l-red-700 bg-red-50 p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-6">
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-700/10">
            <AlertCircle
              className="h-5 w-5 text-red-700"
              strokeWidth={2}
              aria-hidden
            />
          </span>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-red-700">
              {block.title}
            </h3>
            <p className="mt-1 max-w-3xl text-xs font-bold leading-relaxed text-red-700">
              {block.body}
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={onUpdatePayment}
          disabled={isPending}
          className="shrink-0 gap-1 bg-red-700 text-sm font-bold text-white hover:bg-red-700/90"
        >
          {isPending ? "Opening Stripe\u2026" : block.ctaLabel}
          {!isPending ? <ChevronRight className="h-4 w-4" strokeWidth={2.5} /> : null}
        </Button>
      </div>
    </section>
  );
}
