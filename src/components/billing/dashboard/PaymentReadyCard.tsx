import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentReadyBlockVM } from "@/features/billing/adapters/toBillingDashboardData";
import { StatusBadge } from "../primitives/StatusBadge";

interface PaymentReadyCardProps {
  block: PaymentReadyBlockVM;
  className?: string;
}

export function PaymentReadyCard({ block, className }: PaymentReadyCardProps) {
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
      <div className="mt-4">
        <p className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
          {block.cardLine}
        </p>
      </div>
    </section>
  );
}
