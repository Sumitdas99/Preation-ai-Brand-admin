import type {
  BrandDetail,
  BrandSummary,
  PaymentStatus,
} from "@/api/schemas/billing";
import type { SubscriptionBadge } from "@/components/billing/types";
import { formatDate } from "./format";

type BrandLike = BrandSummary | BrandDetail;

export function toBrandStatusBadges(brand: BrandLike): SubscriptionBadge[] {
  const badges: SubscriptionBadge[] = [];

  if (brand.pack_configured === false) {
    badges.push({ label: "Pack not configured", tone: "warning" });
    return badges;
  }

  if (brand.pack_type === "TRIAL") {
    if (brand.subscription_status === "ACTIVE") {
      badges.push({ label: "Trial · active", tone: "success" });
    } else if (brand.subscription_status === "AWAITING_ACTIVATION") {
      badges.push({ label: "Trial · awaiting activation", tone: "info" });
    } else {
      badges.push({ label: "Trial", tone: "info" });
    }
    if (brand.trial_end) {
      badges.push({
        label: `Trial expires ${formatDate(brand.trial_end)}`,
        tone: "neutral",
      });
    }
    return badges;
  }

  switch (brand.subscription_status) {
    case "ACTIVE":
      badges.push({ label: "Active · paid", tone: "success" });
      break;
    case "AWAITING_ACTIVATION":
      badges.push({ label: "Awaiting activation", tone: "info" });
      break;
    case "PAST_DUE":
      badges.push({ label: "Past due", tone: "danger" });
      badges.push({ label: "Payment failed · Stripe retrying", tone: "warning" });
      break;
    case "SUSPENDED":
      badges.push({ label: "Suspended", tone: "danger" });
      break;
    case "PENDING":
      badges.push({ label: "Pending", tone: "neutral" });
      break;
    default:
      if (brand.subscription_status) {
        badges.push({ label: String(brand.subscription_status), tone: "neutral" });
      }
  }

  return badges;
}

export function toPaymentStatusBadges(
  status: PaymentStatus | undefined,
): SubscriptionBadge[] {
  if (!status) return [];
  if (!status.payment_configured) {
    return [{ label: "Payment not configured", tone: "warning" }];
  }
  if (status.subscription_status === "AWAITING_ACTIVATION") {
    return [
      { label: "Card on file", tone: "info" },
      { label: "Awaiting brand admin activation", tone: "info" },
    ];
  }
  if (status.subscription_status === "ACTIVE") {
    return [{ label: "Card on file", tone: "success" }];
  }
  if (status.subscription_status === "PAST_DUE") {
    return [
      { label: "Past due", tone: "danger" },
      { label: "Stripe retrying", tone: "warning" },
    ];
  }
  return [];
}
