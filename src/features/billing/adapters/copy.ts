import type { PackType } from "@/api/schemas/billing";

export const PACK_TYPE_LABEL: Record<PackType, string> = {
  TRIAL: "Trial",
  ENTERPRISE: "Enterprise (paid)",
  STANDARD: "Standard",
};

export const PACK_TYPE_DESCRIPTION: Record<PackType, string> = {
  TRIAL:
    "Card collected upfront, not charged during trial period. Brand commits to the monthly pack below — first charge flows automatically on trial_expiry_date + 1 day. Trial usage is capped separately.",
  ENTERPRISE:
    "Paid custom pack. Fixed monthly fee at cycle start. Card charged immediately on activation.",
  STANDARD:
    "Uses plan_version defaults. No custom pricing overrides. Suitable for self-serve onboarding.",
};

export const PACK_TYPE_TAG: Record<PackType, string> = {
  TRIAL: "trial_override",
  ENTERPRISE: "enterprise_override",
  STANDARD: "standard",
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
  trialExpiredNoticeTitle:
    "The trial period for this brand has ended.",
  trialExpiredNoticeBody:
    "Stripe is now billing the committed monthly fee automatically. Consider switching the pack type from Trial to Enterprise (paid) to reflect the ongoing paid relationship.",
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
