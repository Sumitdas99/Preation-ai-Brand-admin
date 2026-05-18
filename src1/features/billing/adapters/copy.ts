import type { PackType } from "@/api/schemas/billing";

export const PACK_TYPE_LABEL: Record<PackType, string> = {
  TRIAL: "Trial",
  ENTERPRISE: "Enterprise",
  STANDARD: "Standard",
};

export const PACK_TYPE_DESCRIPTION: Record<PackType, string> = {
  TRIAL:
    "Free trial with no charges until the trial ends. Payment details are collected upfront so billing starts automatically when the trial period expires.",
  ENTERPRISE:
    "Custom pricing with a fixed monthly fee. Billing begins as soon as the subscription is activated.",
  STANDARD:
    "Pre-configured plan with standard pricing. Ideal for brands that don't need custom rates or limits.",
};

export const PACK_TYPE_TAG: Record<PackType, string> = {
  TRIAL: "Trial",
  ENTERPRISE: "Enterprise",
  STANDARD: "Standard",
};

export const SECTION_3_HEADER: Record<PackType, string> = {
  TRIAL: "Committed monthly pack",
  ENTERPRISE: "Committed monthly pack",
  STANDARD: "Committed monthly pack",
};

export const SECTION_3_SUBTITLE: Record<PackType, string> = {
  TRIAL:
    "Applies from trial end date onwards (or immediately for Enterprise) · writes to custom_* columns",
  ENTERPRISE:
    "Charges on activation · currently active · Changes to limits or pricing take effect at next cycle close — not immediately.",
  STANDARD:
    "Optional overrides on top of plan_version defaults · writes to custom_* columns",
};

export const SECTION_3_COMMITTED_NOTE: Record<PackType, string> = {
  TRIAL:
    "What the brand has committed to paying monthly after the trial ends. For trial customers, the card is on file but not charged until trial_expiry_date + 1 day.",
  ENTERPRISE:
    "Charges immediately at cycle start. Pricing edits apply to the next cycle close — current cycle is unaffected.",
  STANDARD:
    "Standard pack defaults from plan_version. Overrides here apply to this brand only.",
};

export const COPY = {
  trialAlertTitle: "Trial period limits and expiry",
  trialAlertBody:
    "These limits apply only during the trial window (while trial_override is active and override_expiry_date > today). When the trial ends, metering automatically switches to the committed monthly limits in Section 3 below.",
  overagePreviewTitle: "Current cycle overage preview",
  overagePreviewSubtitle:
    "Real-time estimate of overage charges for the current billing cycle. Not an invoice — final values are computed by Stripe at cycle close.",
  overagePreviewSourceNote:
    "Sourced from Redis counter (falls back to meter_events aggregation if Redis unavailable).",
  superAdminTag: "Super Admin",
  packConfigNoStripeAlertTitle: "No Stripe call on save",
  packConfigNoStripeAlertBody:
    "The Brand Admin activates the subscription from their own Billing Dashboard after completing payment setup. The Activate Subscription button is not here.",
  sevenDayExpiryAlertPrefix: "7-day expiry alert configured",
  sevenDayExpiryAlertSuffix:
    "fires automatically to Super Admin",
  trialAlertEffectiveLimit:
    "Effective limit resolution: When override_type = trial_override AND today < override_expiry_date, metering uses trial_image_limit / trial_video_limit. After trial ends, metering automatically switches to custom_image_limit / custom_video_limit (Section 3). It falls back to committed limits for the trial period.",
  limitSwitching:
    "Limit switching: While trial is active → metering uses trial_image_limit / trial_video_limit. After trial ends → metering switches automatically to committed limits in Section 3. No manual action required.",
  verifyingPaymentTitle: "Verifying payment details…",
  verifyingPaymentBody:
    "We're confirming your card with Stripe. This usually takes a few seconds.",
};
