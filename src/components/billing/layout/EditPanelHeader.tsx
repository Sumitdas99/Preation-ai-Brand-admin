import type { BrandDetail } from "@/api/schemas/billing";
import { COPY } from "@/features/billing/adapters/copy";
import { formatCycleRange } from "@/features/billing/adapters/format";
import { toBrandStatusBadges } from "@/features/billing/adapters/toBadges";
import { OverrideTag } from "../primitives/OverrideTag";
import { StatusBadgeList } from "../primitives/StatusBadge";

interface EditPanelHeaderProps {
  brand: BrandDetail;
}

export function EditPanelHeader({ brand }: EditPanelHeaderProps) {
  const badges = toBrandStatusBadges(brand);
  const cycleLabel = formatCycleRange(brand.cycle_start, brand.cycle_end);

  const overrideToken =
    brand.pack_type === "TRIAL"
      ? "trial_override"
      : brand.pack_type === "ENTERPRISE"
        ? "enterprise_override"
        : brand.pack_type === "STANDARD"
          ? "standard"
          : undefined;

  const isActive = brand.subscription_status === "ACTIVE";
  const isAwaitingActivation =
    brand.subscription_status === "AWAITING_ACTIVATION" ||
    (brand.payment_configured === true && !brand.stripe_subscription_id);

  const metaParts: string[] = [];
  if (overrideToken) metaParts.push(overrideToken);
  if (isActive && brand.subscription_status) {
    metaParts.push(`subscription_status = ${brand.subscription_status.toLowerCase()}`);
  }
  if (brand.payment_configured !== undefined) {
    metaParts.push(`payment_configured = ${brand.payment_configured}`);
  }
  if (!isActive) {
    if (brand.stripe_subscription_id) {
      metaParts.push(`stripe_subscription_id = ${brand.stripe_subscription_id}`);
    } else {
      metaParts.push(
        `stripe_subscription_id = null${
          isAwaitingActivation ? " (awaiting Brand Admin activation)" : ""
        }`,
      );
    }
  }
  if (cycleLabel) metaParts.push(`Cycle: ${cycleLabel}`);

  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 bg-white px-6 py-4">
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <h2 className="truncate text-xl font-semibold text-slate-900">
            {brand.brand_name}
          </h2>
          {brand.pack_type ? <OverrideTag packType={brand.pack_type} /> : null}
        </div>
        {metaParts.length ? (
          <p className="font-mono text-[11px] text-slate-500">
            {metaParts.join(" · ")}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadgeList badges={badges} />
        <span className="rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
          {COPY.superAdminTag}
        </span>
      </div>
    </div>
  );
}
