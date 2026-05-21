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
  cardLine: string;
}

export interface ActivateBlockVM {
  title: string;
  body: string;
  ctaLabel: string;
  implementationNote: string;
}

export interface PastDueBlockVM {
  title: string;
  body: string;
  ctaLabel: string;
  implementationNote: string;
  variant: "past-due" | "suspended";
}

export interface BillingDashboardDataVM {
  tone: DashboardTone;
  header: { title: string; subtitle: string; variant: DashboardVariant };
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
  if (!status.payment_configured) return "welcome-payment-required";
  if (status.subscription_status === "SUSPENDED") return "suspended";
  if (status.subscription_status === "PAST_DUE") return "past-due";
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
  const isApproaching = !isOverage && percent >= 80;
  const remaining = Math.max(limit - used, 0);
  const remainingLabel = isOverage
    ? `${overage.toLocaleString()} ${unit} over · estimated charge ${formatMoney(metric.estimated_overage_charge, currency)} at cycle close`
    : `${remaining.toLocaleString()} ${unit} remaining${
        isTrial ? " · trial limit" : " this cycle"
      }`;
  const inlineSubLabel = isOverage
    ? `${overage.toLocaleString()} ${unit} in overage · estimated charge: ${formatMoney(
        metric.estimated_overage_charge,
        currency,
      )} at cycle close`
    : isApproaching
      ? `${remaining.toLocaleString()} ${unit} remaining · approaching limit · alert sent at 80%`
      : `${remaining.toLocaleString()} ${unit} remaining${
          isTrial && metric.overage_unit_price
            ? ` · trial limit · ${formatMoney(metric.overage_unit_price, currency)} per ${unit === "minutes" ? "minute" : "image"} above ${limit}`
            : ""
        }`;

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
    if (packType === "TRIAL") {
      return compact([
        cell("Pack type", packType ? packTypeLabel[packType] : "—", "highlight"),
        cell("Trial expires", formatDate(trialEnd)),
        cell(
          "First charge",
          firstChargeIso
            ? `${formatDate(firstChargeIso)}${
                monthlyPrice !== undefined
                  ? ` · ${formatMoney(monthlyPrice, currency)}`
                  : ""
              }`
            : "—",
        ),
        cell(
          "Monthly price (post-trial)",
          monthlyPrice !== undefined ? `${formatMoney(monthlyPrice, currency)} / month` : "—",
        ),
        cell(
          "Post-trial image limit",
          imageLimit !== undefined ? `${imageLimit.toLocaleString()} / cycle` : "—",
        ),
        cell(
          "Post-trial video limit",
          videoLimit !== undefined ? `${videoLimit.toLocaleString()} min / cycle` : "—",
        ),
      ]);
    } else {
      return compact([
        cell("Pack type", packType ? packTypeLabel[packType] : "—", "highlight"),
        cell(
          "Monthly price",
          monthlyPrice !== undefined ? `${formatMoney(monthlyPrice, currency)} / month` : "—",
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
          compactJoin(
            overageImage !== undefined ? `${formatMoney(overageImage, currency)} / image` : undefined,
            overageVideo !== undefined ? `${formatMoney(overageVideo, currency)} / min` : undefined,
          ) || "—",
        ),
      ]);
    }
  }

  if (tone === "welcome-activate") {
    if (packType === "TRIAL") {
      return compact([
        cell("Pack type", packType ? packTypeLabel[packType] : "—", "highlight"),
        cell("Trial expires", formatDate(trialEnd)),
        cell(
          "First charge",
          `${formatDate(firstChargeIso)}${
            nextChargeAmount !== undefined
              ? ` · ${formatMoney(nextChargeAmount, currency)}`
              : monthlyPrice !== undefined
                ? ` · ${formatMoney(monthlyPrice, currency)}`
                : ""
          }`,
        ),
        cell(
          "Trial image cap",
          trialImageCap !== undefined ? `${trialImageCap.toLocaleString()} scans` : "—",
        ),
        cell(
          "Trial video cap",
          trialVideoCap !== undefined ? `${trialVideoCap.toLocaleString()} minutes` : "—",
        ),
        cell(
          "Post-trial limits",
          compactJoin(
            imageLimit !== undefined ? `${imageLimit.toLocaleString()} scans` : undefined,
            videoLimit !== undefined ? `${videoLimit.toLocaleString()} min` : undefined,
          ) || "—",
        ),
        cell(
          "Overage — per image",
          overageImage !== undefined ? formatMoney(overageImage, currency) : "—",
        ),
        cell(
          "Overage — per video minute",
          overageVideo !== undefined ? formatMoney(overageVideo, currency) : "—",
        ),
      ]);
    } else {
      return compact([
        cell("Pack type", packType ? packTypeLabel[packType] : "—", "highlight"),
        cell(
          "Monthly price",
          monthlyPrice !== undefined ? `${formatMoney(monthlyPrice, currency)} / month` : "—",
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
          compactJoin(
            overageImage !== undefined ? `${formatMoney(overageImage, currency)} / image` : undefined,
            overageVideo !== undefined ? `${formatMoney(overageVideo, currency)} / min` : undefined,
          ) || "—",
        ),
      ]);
    }
  }

  if (tone === "trial-active") {
    const daysLeft = computeDaysRemaining(trialEnd);
    return compact([
      cell("Pack type", packType ? packTypeLabel[packType] : "—", "highlight"),
      cell(
        "Trial expires",
        trialEnd
          ? `${formatDate(trialEnd)}${daysLeft !== undefined ? ` · ${daysLeft} days left` : ""}`
          : "—",
      ),
      cell(
        "First charge",
        firstChargeIso
          ? `${formatDate(firstChargeIso)}${
              nextChargeAmount !== undefined
                ? ` · ${formatMoney(nextChargeAmount, currency)}`
                : monthlyPrice !== undefined
                  ? ` · ${formatMoney(monthlyPrice, currency)}`
                  : ""
            }`
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
        compactJoin(
          overageImage !== undefined
            ? `${formatMoney(overageImage, currency)} / image`
            : undefined,
          overageVideo !== undefined
            ? `${formatMoney(overageVideo, currency)} / min`
            : undefined,
        ) || "—",
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
        compactJoin(
          overageImage !== undefined
            ? `${formatMoney(overageImage, currency)} / image`
            : undefined,
          overageVideo !== undefined
            ? `${formatMoney(overageVideo, currency)} / min`
            : undefined,
        ) || "—",
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
        failedAt ? `${formatDate(failedAt)} · Stripe retrying` : "—",
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

function compactJoin(...parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(" · ");
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
          subtitle: "Payment ready · activate your subscription to start scanning",
          variant: "navy",
        };
      case "trial-active":
        return {
          title: "Billing & Usage",
          subtitle: cycleLabel
            ? `Trial active · ${brand.brand_name} · Cycle: ${cycleLabel}`
            : `Trial active · ${brand.brand_name}`,
          variant: "navy",
        };
      case "paid-active":
      case "paid-overage": {
        const days = usage?.days_remaining;
        return {
          title: "Billing & Usage",
          subtitle: cycleLabel
            ? `Active subscription · ${brand.brand_name} · Cycle: ${cycleLabel}${
                typeof days === "number" ? ` · ${days} days remaining` : ""
              }`
            : `Active subscription · ${brand.brand_name}`,
          variant: "navy",
        };
      }
      case "past-due":
        return {
          title: "Billing & Usage",
          subtitle: "Payment issue — action required to prevent scan suspension",
          variant: "red",
        };
      case "suspended":
      default:
        return {
          title: "Billing & Usage",
          subtitle: "Account suspended · new scans paused until payment is resolved",
          variant: "red",
        };
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
        "You'll be redirected to a secure Stripe-hosted page to add your card. Your card is not charged now — it will be charged when you activate your subscription in the next step. Praetion never stores your card details.",
      ctaLabel: "Add payment details",
      implementationNote:
        "After adding your card, you'll be returned here automatically. We'll verify your payment setup (usually takes a few seconds) then show your pack details and activation button.",
    };
    const trialImg = brand.pack?.trial_image_limit;
    const trialVid = brand.pack?.trial_video_limit;
    const fullImg = brand.pack?.custom_image_limit ?? brand.pack?.image_scan_limit;
    const fullVid = brand.pack?.custom_video_limit ?? brand.pack?.video_minutes_limit;
    const trialFooter =
      trialImg !== undefined && trialVid !== undefined && fullImg !== undefined && fullVid !== undefined
        ? `Trial limits (during trial): ${trialImg.toLocaleString()} images · ${trialVid.toLocaleString()} video minutes. Switches to full limits (${fullImg.toLocaleString()} images / ${fullVid.toLocaleString()} min) after trial ends automatically.`
        : undefined;
    subscription = {
      title: "Your pack",
      badgeLabel: "Configured · awaiting activation",
      badgeTone: "neutral",
      packGrid: packGridForState(brand, paymentStatus, tone, currency),
      topCallout: trialFooter
        ? { tone: "info", body: trialFooter }
        : undefined,
      showCardOnFileRow: false,
    };
  } else if (tone === "welcome-activate") {
    paymentVariant = "ready";
    payment = {
      title: "Payment",
      badgeLabel: "✓ Configured",
      badgeTone: "success",
      cardLine: cardLine(paymentStatus),
    };
    const trialAmount =
      paymentStatus.next_charge_amount ?? brand.pack?.monthly_price;
    activate = {
      title: brand.pack_type === "TRIAL"
        ? "Activate your trial to start scanning"
        : "Activate your subscription to start scanning",
      body:
        brand.pack_type === "TRIAL"
          ? `Your card will not be charged today. Trial starts now and ends ${formatDate(trialEnd)}. Paid billing (${formatMoney(trialAmount, currency)}/month) begins automatically on ${formatDate(firstChargeIso)} — no action required from you. You can scan up to ${brand.pack?.trial_image_limit ?? "—"} images and ${brand.pack?.trial_video_limit ?? "—"} video minutes during the trial.`
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
      topCallout: {
        tone: "amber",
        body: `Card on file · not charged until ${formatDate(firstChargeIso)}. Paid subscription starts automatically — no action required. Trial usage limits apply until then.`,
      },
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
        ? "Account suspended — new scans paused"
        : "Payment failed — subscription past due",
      body: isSuspended
        ? "Your account has been suspended because the most recent invoice could not be charged within the 3-day grace period. New compliance scans are paused. Existing audit records and Evidence Packs remain accessible. Resolve payment to restore scanning."
        : "Your most recent invoice could not be charged. Stripe will retry automatically. Compliance scans continue uninterrupted during the grace period (3 days). If payment is not resolved within 3 days, your account will be suspended and new scans will be paused. Please update your payment method or contact your account manager.",
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

function cardLine(paymentStatus: PaymentStatus): string {
  const parts: string[] = ["Card on file"];
  if (paymentStatus.card_brand && paymentStatus.card_last4) {
    parts.push(`${paymentStatus.card_brand} ending ${paymentStatus.card_last4}`);
  }
  if (paymentStatus.card_expiry) {
    parts.push(`expires ${paymentStatus.card_expiry}`);
  }
  parts.push("managed securely by Stripe");
  return parts.join(" · ");
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

  const zeroMetric: UsageMetric = {
    used: 0,
    limit: 0,
    overage: 0,
    estimated_overage_charge: 0,
  };

  const imageMetric: UsageMetric = usage.image_scans ?? zeroMetric;
  const videoMetric: UsageMetric = usage.video_minutes ?? zeroMetric;

  const isTrial = tone === "trial-active";
  const meters: UsageMeterDetail[] = [
    meter(
      "image_scans",
      "Image scans",
      "images",
      imageMetric,
      currency,
      isTrial,
      usage.cycle_end,
    ),
    meter(
      "video_minutes",
      "Video minutes",
      "minutes",
      videoMetric,
      currency,
      isTrial,
      usage.cycle_end,
    ),
  ];

  if (tone === "trial-active") {
    return {
      variant: "meters",
      title: "Usage — trial period · limits apply",
      sourceLabel: "",
      topNote: {
        tone: "amber",
        body: `Trial limits active: ${imageMetric.limit.toLocaleString()} image scans · ${videoMetric.limit.toLocaleString()} video minutes. Full limits (${
          (brand.pack?.custom_image_limit ?? brand.pack?.image_scan_limit ?? 0).toLocaleString()
        } / ${(brand.pack?.custom_video_limit ?? brand.pack?.video_minutes_limit ?? 0).toLocaleString()} min) unlock automatically when trial ends.`,
      },
      meters,
      footerNote:
        "Scans are never blocked — usage continues even above trial limits. Overage is tracked and billed at cycle close. Alerts sent at 80% and 100% of trial limits.",
    };
  }

  if (tone === "paid-active" || tone === "paid-overage") {
    return {
      variant: "meters",
      title: "Usage — current cycle",
      sourceLabel: "Real-time · GET /billing/usage/{brand_id}",
      meters,
      footerNote:
        "Compliance scans are never blocked regardless of usage level. Overage is accumulated and billed automatically at cycle close. No action required from you.",
    };
  }

  if (tone === "past-due") {
    return {
      variant: "meters",
      title: "Usage — scans continuing during grace period",
      meters: meters.map((m) => ({
        ...m,
        alertMessage: undefined,
        alertTone: undefined,
        inlineSubLabel: `${Math.max(m.limit - m.used, 0).toLocaleString()} ${m.unit} remaining this cycle`,
      })),
      footerNote:
        "Scans continue during the grace period (3 days from payment failure). If payment is not resolved, account transitions to Suspended state — new scans will be paused. Existing audit records and Evidence Packs remain accessible.",
    };
  }

  return {
    variant: "meters",
    title: "Usage — scans paused (account suspended)",
    isGreyedOut: true,
    meters,
    footerNote:
      "New scans are paused while the account is suspended. Existing audit records and Evidence Packs remain accessible. Resolve payment to restore scanning.",
  };
}
