import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { SubscriptionBlockVM } from "@/features/billing/adapters/toBillingDashboardData";
import { StatusBadge } from "../primitives/StatusBadge";
import { InlineNotice } from "../primitives/InlineNotice";
import { BillingPackGrid } from "./BillingPackGrid";

interface SubscriptionCardProps {
  block: SubscriptionBlockVM;
  cardOnFileSlot?: ReactNode;
  belowGridSlot?: ReactNode;
  className?: string;
}

export function SubscriptionCard({
  block,
  cardOnFileSlot,
  belowGridSlot,
  className,
}: SubscriptionCardProps) {
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
      <div className="mt-4 space-y-4">
        <BillingPackGrid cells={block.packGrid} />
        {block.topCallout ? (
          <InlineNotice tone={block.topCallout.tone}>
            {block.topCallout.body}
          </InlineNotice>
        ) : null}
        {belowGridSlot}
        {block.showCardOnFileRow ? cardOnFileSlot : null}
      </div>
    </section>
  );
}
