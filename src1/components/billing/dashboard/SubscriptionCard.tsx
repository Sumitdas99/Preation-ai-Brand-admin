import type { ReactNode } from "react";
import { Package } from "lucide-react";
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
        "overflow-hidden rounded-lg border-[1.25px] border-slate-200 bg-card shadow-sm",
        className,
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-accent/30 px-6 py-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0A1F44] text-white">
            <Package className="h-4 w-4" aria-hidden />
          </span>
          <h2 className="text-xl font-semibold leading-none text-slate-600">
            {block.title}
          </h2>
        </div>
        <StatusBadge
          badge={{ label: block.badgeLabel, tone: block.badgeTone }}
        />
      </header>
      <div className="space-y-4 px-6 py-5">
        <BillingPackGrid cells={block.packGrid} />
        {block.topCallout ? (
          <InlineNotice tone={block.topCallout.tone}>
            {block.topCallout.body}
          </InlineNotice>
        ) : null}
        {belowGridSlot}
      </div>
      {block.showCardOnFileRow ? cardOnFileSlot : null}
    </section>
  );
}
