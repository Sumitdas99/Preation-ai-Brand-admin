import type { BrandDetail } from "@/api/schemas/billing";
import { formatCycleRange } from "@/features/billing/adapters/format";
import { toBrandStatusBadges } from "@/features/billing/adapters/toBadges";
import { OverrideTag } from "../primitives/OverrideTag";
import { StatusBadgeList } from "../primitives/StatusBadge";

interface EditPanelHeaderProps {
  brand: BrandDetail;
}

function describeStatus(brand: BrandDetail): string {
  switch (brand.subscription_status) {
    case "ACTIVE":
      return "Subscription active";
    case "AWAITING_ACTIVATION":
      return "Awaiting activation by Brand Admin";
    case "PAST_DUE":
      return "Payment past due";
    case "SUSPENDED":
      return "Subscription suspended";
    default:
      return "";
  }
}

export function EditPanelHeader({ brand }: EditPanelHeaderProps) {
  const badges = toBrandStatusBadges(brand);
  const cycleLabel = formatCycleRange(brand.cycle_start, brand.cycle_end);

  const parts: string[] = [];

  const statusPhrase = describeStatus(brand);
  if (statusPhrase) parts.push(statusPhrase);

  if (brand.payment_configured) {
    parts.push("payment method on file");
  } else {
    parts.push("no payment method on file");
  }

  if (cycleLabel) parts.push(`cycle ${cycleLabel}`);

  const summary = parts.length
    ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) + (parts.length > 1 ? ", " + parts.slice(1).join(", ") : "")
    : undefined;

  return (
    <div className="border-b border-border bg-accent/30 px-6 py-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="truncate font-display text-xl font-[550] text-slate-700">
          {brand.brand_name}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {brand.pack_type ? <OverrideTag packType={brand.pack_type} /> : null}
          <StatusBadgeList badges={badges} />
        </div>
      </div>
      {summary ? (
        <p className="mt-1 text-xs font-semibold leading-relaxed text-foreground/70">{summary}</p>
      ) : null}
    </div>
  );
}
