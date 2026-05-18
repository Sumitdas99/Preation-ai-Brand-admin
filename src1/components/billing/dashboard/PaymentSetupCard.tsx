import { ChevronRight, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PaymentSetupBlockVM } from "@/features/billing/adapters/toBillingDashboardData";
import { StatusBadge } from "../primitives/StatusBadge";

interface PaymentSetupCardProps {
  block: PaymentSetupBlockVM;
  onSetup: () => void;
  isPending?: boolean;
  className?: string;
}

export function PaymentSetupCard({
  block,
  onSetup,
  isPending,
  className,
}: PaymentSetupCardProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg border-[1.25px] border-slate-200 bg-card shadow-sm",
        className,
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-accent/30 px-6 py-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0A1F44] text-white">
            <CreditCard className="h-4 w-4" aria-hidden />
          </span>
          <h2 className="text-xl font-semibold leading-none text-slate-600">
            {block.title}
          </h2>
        </div>
        <StatusBadge
          badge={{ label: block.badgeLabel, tone: block.badgeTone }}
        />
      </header>

      <div className="px-6 py-5">
        <div className="flex items-center justify-between gap-6 rounded-lg bg-[#0A1F44] px-5 py-5 text-white">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
              <CreditCard className="h-5 w-5" strokeWidth={1.75} aria-hidden />
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-medium text-white">
                {block.calloutTitle}
              </h3>
              <p className="mt-1 max-w-2xl text-xs font-semibold leading-relaxed text-white/80">
                {block.calloutBody}
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={onSetup}
            disabled={isPending}
            className="shrink-0 gap-1 bg-white/10 text-sm font-bold text-white backdrop-blur-md hover:bg-white/20"
          >
            {isPending ? "Opening Stripe\u2026" : block.ctaLabel}
            {!isPending ? <ChevronRight className="h-4 w-4" strokeWidth={2.5} /> : null}
          </Button>
        </div>
      </div>
    </section>
  );
}
