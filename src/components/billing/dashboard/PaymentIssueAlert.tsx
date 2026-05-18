import { AlertTriangle, ArrowRight } from "lucide-react";
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
        "rounded-xl border-l-4 p-5 shadow-sm",
        isSuspended
          ? "border-rose-700 bg-rose-50"
          : "border-rose-600 bg-rose-50",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-2.5">
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-rose-700"
            aria-hidden
          />
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-rose-900">
              {block.title}
            </h3>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-rose-900/90">
              {block.body}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onUpdatePayment}
          disabled={isPending}
          className="border-rose-300 bg-white text-rose-800 hover:bg-rose-100"
        >
          {isPending ? "Opening Stripe…" : block.ctaLabel}
          {!isPending ? <ArrowRight className="ml-1 h-4 w-4" /> : null}
        </Button>
      </div>
      <p className="mt-3 rounded-md bg-white/60 px-3 py-1.5 font-mono text-[11px] text-rose-900/70">
        {block.implementationNote}
      </p>
    </section>
  );
}
