import type {
  BrandDetail,
  Currency,
  PackType,
  PaymentStatus,
  UsageMetric,
  UsageSnapshot,
} from "@/api/schemas/billing";
import type {
  BadgeTone,
  DashboardTone,
} from "@/components/billing/types";
import { addDaysIso, formatCycleRange, formatDate, formatMoney } from "./format";

export type DashboardVariant = "navy" | "red";

export interface BillingPackGridCell {
  label: string;
  value: string;
  tone?: "default" | "highlight";
}

export interface UsageMeterDetail {
  key: "image_scans" | "video_minutes";
  label: string;
  used: number;
  limit: number;
  percent: number;
  overage: number;
  isOverage: boolean;
  isApproaching: boolean;
  unit: string;
  remainingLabel: string;
  estimatedOverageCharge: number;
  inlineSubLabel: string;
  overageRateLabel?: string;
  alertMessage?: string;
  alertTone?: "danger" | "warning";
}

export interface UsageBlockVM {
  variant: "empty" | "meters";
  title: string;
  sourceLabel?: string;
  emptyTitle?: string;
  emptyBody?: string;
  topNote?: { tone: "amber" | "info"; body: string };
  meters: UsageMeterDetail[];
  footerNote?: string;
  isGreyedOut?: boolean;
}

export interface SubscriptionBlockVM {
  title: string;
  badgeLabel: string;
  badgeTone: BadgeTone;
  packGrid: BillingPackGridCell[];
  topCallout?: { tone: "amber" | "info" | "danger"; body: string };
  showCardOnFileRow: boolean;
}

export interface PaymentSetupBlockVM {
  title: string;
  badgeLabel: string;
  badgeTone: BadgeTone;
  calloutTitle: string;
  calloutBody: string;
  ctaLabel: string;
  implementationNote: string;
}

export interface PaymentReadyBlockVM {
  title: string;
  badgeLabel: string;
  badgeTone: BadgeTone;
  cardTitle: string;
  cardDescription: string;
}

export interface ActivateBlockVM {
  title: string;
  body: string;
  ctaLabel: string;
  implementationNote: string;
}

export interface PastDueBlockVM {
  title: string;
  body: import("react").ReactNode;
  ctaLabel: string;
  implementationNote: string;
  variant: "past-due" | "suspended";
}

export interface BillingDashboardDataVM {
  tone: DashboardTone;
  header: { title: string; subtitle: string; subtitleParts?: string[]; variant: DashboardVariant };
  brandName: string;
  brandId: string;
  payment?: PaymentSetupBlockVM | PaymentReadyBlockVM;
  paymentVariant?: "setup" | "ready";
  activate?: ActivateBlockVM;
  pastDue?: PastDueBlockVM;
  subscription?: SubscriptionBlockVM;
  usage: UsageBlockVM;
  showStripeRedirectNote: boolean;
}

const BADGE_TONES: Record<DashboardTone, { label: string; tone: BadgeTone }> = {
  "welcome-payment-required": { label: "Trial active", tone: "warning" },
  "welcome-activate": { label: "Ready · not yet active", tone: "warning" },
  "trial-active": { label: "Trial active", tone: "warning" },
  "paid-active": { label: "Active", tone: "success" },
  "paid-overage": { label: "Active", tone: "success" },
  "past-due": { label: "Past due · grace period active", tone: "danger" },
  suspended: { label: "Suspended · scans paused", tone: "danger" },
};

export function deriveDashboardTone(
  brand: BrandDetail,
  status: PaymentStatus,
): DashboardTone {
  if (status.subscription_status === "SUSPENDED") return "suspended";
  if (status.subscription_status === "PAST_DUE") return "past-due";
  if (!status.payment_configured) return "welcome-payment-required";
  if (status.payment_configured && !status.stripe_subscription_id) {
    return "welcome-activate";
  }
  if (brand.pack_type === "TRIAL" && status.subscription_status === "ACTIVE") {
    return "trial-active";
  }
  return "paid-active";
}

function meter(
  key: "image_scans" | "video_minutes",
  label: string,
  unit: string,
  metric: UsageMetric,
  currency: Currency,
  isTrial: boolean,
  cycleEnd: string | undefined,
): UsageMeterDetail {
  const limit = Math.max(metric.limit, 0);
  const used = Math.max(metric.used, 0);
  const overage = Math.max(metric.overage, 0);
  const percent = limit === 0 ? 0 : Math.round((used / limit) * 100);
  const isOverage = overage > 0;
  const isApproaching = !isOverage && percent >= 75;
  const remaining = Math.max(limit - used, 0);
  const remainingLabel = isOverage
    ? `${overage.toLocaleString()} ${unit} over · estimated charge ${formatMoney(metric.estimated_overage_charge, currency)} at cycle close`
    : `${remaining.toLocaleString()} ${unit} remaining${
        isTrial ? " · trial limit" : " this cycle"
      }`;
  const overageRateLabel = metric.overage_unit_price
    ? `${formatMoney(metric.overage_unit_price, currency)}/${unit === "minutes" ? "min" : "image"} above ${limit.toLocaleString()}`
    : undefined;
  const inlineSubLabel = isOverage
    ? `${overage.toLocaleString()} ${unit} over limit`
    : `${remaining.toLocaleString()} ${unit} remaining`;

  let alertMessage: string | undefined;
  let alertTone: "danger" | "warning" | undefined;

  if (isOverage) {
    const cycleEndLabel = cycleEnd ? ` (${formatDate(cycleEnd)})` : "";
    alertMessage =
      key === "image_scans"
        ? `Image limit exceeded · ${overage.toLocaleString()} images in overage · ${formatMoney(
            metric.estimated_overage_charge,
            currency,
          )} estimated overage charge billed automatically at cycle close${cycleEndLabel}. Scans continue — not blocked.`
        : `Video limit exceeded · ${overage.toLocaleString()} minutes in overage · ${formatMoney(
            metric.estimated_overage_charge,
            currency,
          )} estimated overage charge billed automatically at cycle close${cycleEndLabel}. Scans continue — not blocked.`;
    alertTone = "danger";
  } else if (isApproaching) {
    const overagePrice = metric.overage_unit_price
      ? `${formatMoney(metric.overage_unit_price, currency)}/${unit === "minutes" ? "minute" : "image"} overage applies above ${limit}${unit === "minutes" ? " min" : ""}`
      : "";
    alertMessage =
      key === "image_scans"
        ? `Images at ${percent}% of limit · 80% alert sent by email${overagePrice ? ` · ${overagePrice}` : ""}`
        : `Video at ${percent}% of limit · 80% alert sent by email${overagePrice ? ` · ${overagePrice}` : ""}`;
    alertTone = "warning";
  }

  return {
    key,
    label,
    used,
    limit,
    percent,
    overage,
    isOverage,
    isApproaching,
    unit,
    remainingLabel,
    inlineSubLabel,
    overageRateLabel,
    estimatedOverageCharge: metric.estimated_overage_charge,
    alertMessage,
    alertTone,
  };
}

function packGridForState(
  brand: BrandDetail,
  status: PaymentStatus,
  tone: DashboardTone,
  currency: Currency,
): BillingPackGridCell[] {
  const pack = brand.pack;
  const packTypeLabel: Record<PackType, string> = {
    TRIAL: "Trial",
    ENTERPRISE: "Enterprise",
    STANDARD: "Standard",
  };
  const packType = brand.pack_type;
  const trialEnd = pack?.trial_end ?? brand.trial_end;
  const firstChargeIso = pack?.first_charge_date ?? addDaysIso(trialEnd, 1);
  const monthlyPrice = pack?.monthly_price ?? pack?.custom_price;
  const imageLimit = pack?.custom_image_limit ?? pack?.image_scan_limit;
  const videoLimit = pack?.custom_video_limit ?? pack?.video_minutes_limit;
  const overageImage = pack?.overage_image_price;
  const overageVideo = pack?.overage_video_price;
  const trialImageCap = pack?.trial_image_limit;
  const trialVideoCap = pack?.trial_video_limit;
  const nextChargeDate = status.next_charge_date;
  const nextChargeAmount = status.next_charge_amount;
  const failedAt = status.failed_invoice_at ?? brand.last_payment_failure_at;

  if (tone === "welcome-payment-required") {
    return compact([
      cell("Pack type", packType ? packTypeLabel[packType] : "—", "highlight"),
      cell(
        packType === "TRIAL" ? "Trial period" : "Cycle",
        packType === "TRIAL"
          ? `Until ${formatDate(trialEnd)}`
          : formatCycleRange(brand.cycle_start, brand.cycle_end) ?? "—",
      ),
      cell(
        packType === "TRIAL" ? "First charge date" : "Next charge",
        packType === "TRIAL"
          ? formatDate(firstChargeIso)
          : formatDate(nextChargeDate),
      ),
      cell(
        "Monthly price (post-trial)",
        formatMoney(monthlyPrice, currency) +
          (monthlyPrice ? " / month" : ""),
      ),
      cell(
        "Image scan limit",
        imageLimit !== undefined ? `${imageLimit.toLocaleString()} / cycle` : "—",
      ),
      cell(
        "Video limit",
        videoLimit !== undefined ? `${videoLimit.toLocaleString()} min / cycle` : "—",
      ),
    ]);
  }

  if (tone === "welcome-activate") {
    return compact([
      cell("Pack type", packType ? packTypeLabel[packType] : "—", "highlight"),
      cell(
        packType === "TRIAL" ? "Trial expires" : "Next charge",
        packType === "TRIAL" ? formatDate(trialEnd) : formatDate(nextChargeDate),
      ),
      cell(
        packType === "TRIAL" ? "First charge" : "Charge amount",
        packType === "TRIAL"
          ? firstChargeIso
            ? `${formatDate(firstChargeIso)} (${formatMoney(nextChargeAmount ?? monthlyPrice, currency)})`
            : "—"
          : formatMoney(nextChargeAmount ?? monthlyPrice, currency),
      ),
      packType === "TRIAL"
        ? cell(
            "Trial image cap",
            trialImageCap !== undefined ? `${trialImageCap.toLocaleString()} scans` : "—",
          )
        : null,
      packType === "TRIAL"
        ? cell(
            "Trial video cap",
            trialVideoCap !== undefined ? `${trialVideoCap.toLocaleString()} minutes` : "—",
          )
        : null,
      cell(
        packType === "TRIAL" ? "Post-trial limits" : "Cycle limits",
        imageLimit !== undefined && videoLimit !== undefined
          ? `${imageLimit.toLocaleString()} images, ${videoLimit.toLocaleString()} min`
          : imageLimit !== undefined
            ? `${imageLimit.toLocaleString()} images`
            : videoLimit !== undefined
              ? `${videoLimit.toLocaleString()} min`
              : "—",
      ),
      cell(
        "Overage rates",
        overageImage !== undefined && overageVideo !== undefined
          ? `${formatMoney(overageImage, currency)} / image, ${formatMoney(overageVideo, currency)} / min`
          : overageImage !== undefined
            ? `${formatMoney(overageImage, currency)} / image`
            : overageVideo !== undefined
              ? `${formatMoney(overageVideo, currency)} / min`
              : "—",
      ),
    ]);
  }

  if (tone === "trial-active") {
    const daysLeft = computeDaysRemaining(trialEnd);
    return compact([
      cell("Pack type", packType ? packTypeLabel[packType] : "—", "highlight"),
      cell(
        "Trial expires",
        trialEnd
          ? daysLeft !== undefined
            ? `${formatDate(trialEnd)} (${daysLeft} days left)`
            : formatDate(trialEnd)
          : "—",
      ),
      cell(
        "First charge",
        firstChargeIso
          ? `${formatDate(firstChargeIso)} (${formatMoney(nextChargeAmount ?? monthlyPrice, currency)})`
          : "—",
      ),
      cell(
        "Post-trial image limit",
        imageLimit !== undefined ? `${imageLimit.toLocaleString()} / cycle` : "—",
      ),
      cell(
        "Post-trial video limit",
        videoLimit !== undefined ? `${videoLimit.toLocaleString()} min / cycle` : "—",
      ),
      cell(
        "Overage rates",
        overageImage !== undefined && overageVideo !== undefined
          ? `${formatMoney(overageImage, currency)} / image, ${formatMoney(overageVideo, currency)} / min`
          : overageImage !== undefined
            ? `${formatMoney(overageImage, currency)} / image`
            : overageVideo !== undefined
              ? `${formatMoney(overageVideo, currency)} / min`
              : "—",
      ),
    ]);
  }

  if (tone === "paid-active" || tone === "paid-overage") {
    return compact([
      cell("Pack type", packType ? packTypeLabel[packType] : "—", "highlight"),
      cell(
        "Monthly price",
        monthlyPrice !== undefined
          ? `${formatMoney(monthlyPrice, currency)} / month`
          : "—",
      ),
      cell("Next charge", formatDate(nextChargeDate)),
      cell(
        "Image limit",
        imageLimit !== undefined ? `${imageLimit.toLocaleString()} / cycle` : "—",
      ),
      cell(
        "Video limit",
        videoLimit !== undefined ? `${videoLimit.toLocaleString()} min / cycle` : "—",
      ),
      cell(
        "Overage rates",
        overageImage !== undefined && overageVideo !== undefined
          ? `${formatMoney(overageImage, currency)} / image, ${formatMoney(overageVideo, currency)} / min`
          : overageImage !== undefined
            ? `${formatMoney(overageImage, currency)} / image`
            : overageVideo !== undefined
              ? `${formatMoney(overageVideo, currency)} / min`
              : "—",
      ),
    ]);
  }

  if (tone === "past-due" || tone === "suspended") {
    return compact([
      cell("Pack type", packType ? packTypeLabel[packType] : "—", "highlight"),
      cell(
        "Monthly price",
        monthlyPrice !== undefined
          ? `${formatMoney(monthlyPrice, currency)} / month`
          : "—",
      ),
      cell(
        "Failed invoice",
        failedAt ? `${formatDate(failedAt)} (Stripe retrying)` : "—",
      ),
    ]);
  }

  return [];
}

function cell(
  label: string,
  value: string,
  tone: BillingPackGridCell["tone"] = "default",
): BillingPackGridCell {
  return { label, value, tone };
}

function compact<T>(values: (T | null | undefined | false)[]): T[] {
  return values.filter(Boolean) as T[];
}



function computeDaysRemaining(iso: string | undefined): number | undefined {
  if (!iso) return undefined;
  const target = new Date(iso);
  if (Number.isNaN(target.getTime())) return undefined;
  const diffMs = target.getTime() - Date.now();
  if (diffMs <= 0) return 0;
  return Math.ceil(diffMs / 86_400_000);
}

export function toBillingDashboardData(input: {
  brand: BrandDetail;
  paymentStatus: PaymentStatus;
  usage?: UsageSnapshot;
}): BillingDashboardDataVM {
  const { brand, paymentStatus, usage } = input;
  const tone = deriveDashboardTone(brand, paymentStatus);
  const currency: Currency =
    (paymentStatus.currency as Currency) ??
    (brand.pack?.currency as Currency) ??
    "EUR";
  const cycleLabel =
    formatCycleRange(brand.cycle_start, brand.cycle_end) ??
    formatCycleRange(usage?.cycle_start, usage?.cycle_end);
  const trialEnd = brand.pack?.trial_end ?? brand.trial_end;
  const firstChargeIso = brand.pack?.first_charge_date ?? addDaysIso(trialEnd, 1);
  const showCardOnFileRow =
    paymentStatus.payment_configured &&
    Boolean(paymentStatus.stripe_subscription_id);

  const header = ((): BillingDashboardDataVM["header"] => {
    switch (tone) {
      case "welcome-payment-required":
        return {
          title: "Billing & Usage",
          subtitle: "Set up payment to activate your compliance workspace",
          variant: "navy",
        };
      case "welcome-activate":
        return {
          title: "Billing & Usage",
          subtitle: "Payment ready and waiting for activation",
          variant: "navy",
        };
      case "trial-active": {
        const trialParts = ["Trial active", brand.brand_name];
        if (cycleLabel) trialParts.push(cycleLabel.replace(" – ", " to "));
        return {
          title: "Billing & Usage",
          subtitle: trialParts.join(" · "),
          subtitleParts: trialParts,
          variant: "navy",
        };
      }
      case "paid-active":
      case "paid-overage": {
        const days = usage?.days_remaining;
        const paidParts = ["Active subscription", brand.brand_name];
        if (cycleLabel) paidParts.push(cycleLabel.replace(" – ", " to "));
        if (typeof days === "number") paidParts.push(`${days} days remaining`);
        return {
          title: "Billing & Usage",
          subtitle: paidParts.join(" | "),
          subtitleParts: paidParts,
          variant: "navy",
        };
      }
      case "past-due": {
        const pastDueParts = ["Payment issue", "Action required to prevent scan suspension"];
        return {
          title: "Billing & Usage",
          subtitle: pastDueParts.join(" | "),
          subtitleParts: pastDueParts,
          variant: "red",
        };
      }
      case "suspended":
      default: {
        const suspendedParts = ["Account suspended", "New scans paused until payment is resolved"];
        return {
          title: "Billing & Usage",
          subtitle: suspendedParts.join(" | "),
          subtitleParts: suspendedParts,
          variant: "red",
        };
      }
    }
  })();

  let payment: PaymentSetupBlockVM | PaymentReadyBlockVM | undefined;
  let paymentVariant: "setup" | "ready" | undefined;
  let activate: ActivateBlockVM | undefined;
  let pastDue: PastDueBlockVM | undefined;
  let subscription: SubscriptionBlockVM | undefined;

  if (tone === "welcome-payment-required") {
    paymentVariant = "setup";
    payment = {
      title: "Payment setup",
      badgeLabel: "Not configured",
      badgeTone: "danger",
      calloutTitle: "Add your payment details to get started",
      calloutBody:
        "You'll be redirected to a secure Stripe-hosted page to add your card. Your card is not charged now. It will be charged when you activate your subscription in the next step. Praetion never stores your card details.",
      ctaLabel: "Add payment details",
      implementationNote:
        "After adding your card, you'll be returned here automatically. We'll verify your payment setup (usually takes a few seconds) then show your pack details and activation button. Calls POST /billing/setup-link → redirects to Stripe hosted page. On return: polls GET /billing/payment-status/{brand_id} every 3s for up to 30s.",
    };
    subscription = {
      title: "Your pack",
      badgeLabel: "Configured · awaiting activation",
      badgeTone: "neutral",
      packGrid: packGridForState(brand, paymentStatus, tone, currency),
      showCardOnFileRow: false,
    };
  } else if (tone === "welcome-activate") {
    paymentVariant = "ready";
    payment = {
      title: "Payment",
      badgeLabel: "Configured",
      badgeTone: "success",
      ...cardSummary(paymentStatus),
    };
    const trialAmount =
      paymentStatus.next_charge_amount ?? brand.pack?.monthly_price;
    activate = {
      title: brand.pack_type === "TRIAL"
        ? "Activate your trial to start scanning"
        : "Activate your subscription to start scanning",
      body:
        brand.pack_type === "TRIAL"
          ? `Your card will not be charged today. Your trial starts now and runs until ${formatDate(trialEnd)} with up to ${brand.pack?.trial_image_limit ?? 0} images and ${brand.pack?.trial_video_limit ?? 0} video minutes included. Paid billing at ${formatMoney(trialAmount, currency)}/month begins automatically on ${formatDate(firstChargeIso)} with no action required from you.`
          : `Your card will be charged ${formatMoney(trialAmount, currency)} on activation and at the start of every billing cycle.`,
      ctaLabel: brand.pack_type === "TRIAL" ? "Activate trial" : "Activate subscription",
      implementationNote:
        "Calls POST /api/v1/billing/activate. Returns 422 if pack not configured or payment_configured = false. On success: Stripe Subscription created → dashboard transitions to State B (trial active).",
    };
    subscription = {
      title: "Your pack — ready to activate",
      badgeLabel: "Ready · not yet active",
      badgeTone: "warning",
      packGrid: packGridForState(brand, paymentStatus, tone, currency),
      showCardOnFileRow: false,
    };
  } else if (tone === "trial-active") {
    subscription = {
      title: "Subscription",
      badgeLabel: "Trial active",
      badgeTone: "warning",
      packGrid: packGridForState(brand, paymentStatus, tone, currency),
      showCardOnFileRow,
    };
  } else if (tone === "paid-active" || tone === "paid-overage") {
    subscription = {
      title: "Subscription",
      badgeLabel: "Active",
      badgeTone: "success",
      packGrid: packGridForState(brand, paymentStatus, tone, currency),
      showCardOnFileRow,
    };
  } else if (tone === "past-due" || tone === "suspended") {
    const isSuspended = tone === "suspended";
    pastDue = {
      title: isSuspended
        ? "Your account has been suspended and new scans are paused"
        : "Your most recent payment has failed and the subscription is past due",
      body: isSuspended
        ? "Your account has been suspended because the most recent invoice could not be charged within the 3-day grace period. New compliance scans are paused. Existing audit records and Evidence Packs remain accessible. Resolve payment to restore scanning."
        : <>Your most recent invoice could not be charged. Stripe will retry automatically. <strong className="font-extrabold">Compliance scans continue uninterrupted during the grace period (3 days).</strong> If payment is not resolved within 3 days, your account will be suspended and new scans will be paused. Please update your payment method or contact your account manager.</>,
      ctaLabel: "Update payment method",
      implementationNote: "Calls POST /billing/setup-link · Stripe-hosted",
      variant: isSuspended ? "suspended" : "past-due",
    };
    subscription = {
      title: "Subscription",
      badgeLabel: BADGE_TONES[tone].label,
      badgeTone: BADGE_TONES[tone].tone,
      packGrid: packGridForState(brand, paymentStatus, tone, currency),
      showCardOnFileRow: false,
    };
  }

  const usageVM = buildUsageBlock(tone, brand, usage, currency);

  return {
    tone,
    header,
    brandName: brand.brand_name,
    brandId: brand.brand_id,
    payment,
    paymentVariant,
    activate,
    pastDue,
    subscription,
    usage: usageVM,
    showStripeRedirectNote: true,
  };
}

function cardSummary(paymentStatus: PaymentStatus): { cardTitle: string; cardDescription: string } {
  const cardTitle = "Card on file";
  let cardDescription: string;
  if (paymentStatus.card_brand && paymentStatus.card_last4 && paymentStatus.card_expiry) {
    cardDescription = `${paymentStatus.card_brand} ending in ${paymentStatus.card_last4} expiring ${paymentStatus.card_expiry} and managed securely by Stripe`;
  } else if (paymentStatus.card_brand && paymentStatus.card_last4) {
    cardDescription = `${paymentStatus.card_brand} ending in ${paymentStatus.card_last4} and managed securely by Stripe`;
  } else {
    cardDescription = "Managed securely by Stripe";
  }
  return { cardTitle, cardDescription };
}

function buildUsageBlock(
  tone: DashboardTone,
  brand: BrandDetail,
  usage: UsageSnapshot | undefined,
  currency: Currency,
): UsageBlockVM {
  if (tone === "welcome-payment-required") {
    return {
      variant: "empty",
      title: "Usage",
      emptyTitle: "Available after payment setup",
      emptyBody: "Complete Step 1 above to see your usage metrics",
      meters: [],
    };
  }

  if (tone === "welcome-activate") {
    return {
      variant: "empty",
      title: "Usage",
      emptyTitle: "Available after activation",
      emptyBody: "Activate your subscription to see real-time usage",
      meters: [],
    };
  }

  if (!usage) {
    return {
      variant: "empty",
      title: "Usage",
      emptyTitle: "Loading usage…",
      meters: [],
    };
  }

  const isTrial = tone === "trial-active";
  const meters: UsageMeterDetail[] = [
    meter(
      "image_scans",
      "Image scans",
      "images",
      usage.image_scans,
      currency,
      isTrial,
      usage.cycle_end,
    ),
    meter(
      "video_minutes",
      "Video minutes",
      "minutes",
      usage.video_minutes,
      currency,
      isTrial,
      usage.cycle_end,
    ),
  ];

  if (tone === "trial-active") {
    return {
      variant: "meters",
      title: "Usage",
      meters,
    };
  }

  if (tone === "paid-active" || tone === "paid-overage") {
    return {
      variant: "meters",
      title: "Usage",
      meters,
    };
  }

  if (tone === "past-due") {
    return {
      variant: "meters",
      title: "Usage",
      meters: meters.map((m) => ({
        ...m,
        alertMessage: undefined,
        alertTone: undefined,
        inlineSubLabel: `${Math.max(m.limit - m.used, 0).toLocaleString()} ${m.unit} remaining this cycle`,
      })),
    };
  }

  return {
    variant: "meters",
    title: "Usage",
    isGreyedOut: true,
    meters,
  };
}
