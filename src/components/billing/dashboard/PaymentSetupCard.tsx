import { ArrowRight, CreditCard } from "lucide-react";
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
        "rounded-xl border border-slate-200 bg-white p-5 shadow-sm",
        className,
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <h2 className="text-sm font-semibold text-slate-900">{block.title}</h2>
        <StatusBadge
          badge={{ label: block.badgeLabel, tone: block.badgeTone }}
        />
      </header>

      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-lg bg-[#0A1F44] p-5 text-white">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/10 ring-1 ring-white/15">
              <CreditCard className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-semibold">{block.calloutTitle}</h3>
              <p className="mt-1 text-sm leading-relaxed text-white/75">
                {block.calloutBody}
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={onSetup}
            disabled={isPending}
            className="bg-white text-[#0A1F44] hover:bg-white/90"
          >
            {isPending ? "Opening Stripe…" : block.ctaLabel}
            {!isPending ? <ArrowRight className="ml-1 h-4 w-4" /> : null}
          </Button>
        </div>

        <p className="rounded-md bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-600">
          {block.implementationNote}
        </p>
      </div>
    </section>
  );
}
