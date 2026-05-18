import { z } from "zod";

export const PackType = z.union([
  z.literal("TRIAL"),
  z.literal("ENTERPRISE"),
  z.literal("STANDARD"),
]);
export type PackType = z.infer<typeof PackType>;

export const OverrideType = z.union([
  z.literal("TRIAL_OVERRIDE"),
  z.literal("ENTERPRISE_OVERRIDE"),
  z.literal("STANDARD"),
]);
export type OverrideType = z.infer<typeof OverrideType>;

export const SubscriptionStatus = z.union([
  z.literal("PENDING"),
  z.literal("AWAITING_ACTIVATION"),
  z.literal("ACTIVE"),
  z.literal("PAST_DUE"),
  z.literal("SUSPENDED"),
  z.literal("CANCELLED"),
  z.string(),
]);
export type SubscriptionStatus = z.infer<typeof SubscriptionStatus>;

export const PackConfigStatus = z.union([
  z.literal("NOT_CONFIGURED"),
  z.literal("CONFIGURED_AWAITING_ACTIVATION"),
  z.literal("ACTIVE"),
  z.literal("TRIAL_ACTIVE"),
  z.literal("TRIAL_EXPIRED"),
  z.literal("PAST_DUE"),
  z.literal("SUSPENDED"),
  z.string(),
]);
export type PackConfigStatus = z.infer<typeof PackConfigStatus>;

export const Currency = z.union([
  z.literal("EUR"),
  z.literal("USD"),
  z.literal("GBP"),
  z.string(),
]);
export type Currency = z.infer<typeof Currency>;

export const Money = z
  .object({
    amount: z.number().nonnegative(),
    currency: Currency,
  })
  .passthrough();
export type Money = z.infer<typeof Money>;

export const BrandPack = z
  .object({
    brand_id: z.string(),
    pack_type: PackType,
    override_type: OverrideType.optional(),
    custom_price: z.number().nonnegative().optional(),
    override_reason: z.string().optional(),
    custom_image_limit: z.number().int().nonnegative().optional(),
    custom_video_limit: z.number().int().nonnegative().optional(),
    overage_image_price: z.number().nonnegative().optional(),
    overage_video_price: z.number().nonnegative().optional(),
    trial_image_limit: z.number().int().nonnegative().optional(),
    trial_video_limit: z.number().int().nonnegative().optional(),
    trial_end: z.string().optional(),
    override_expiry_date: z.string().optional(),
    first_charge_date: z.string().optional(),
    monthly_price: z.number().nonnegative().optional(),
    image_scan_limit: z.number().int().nonnegative().optional(),
    video_minutes_limit: z.number().int().nonnegative().optional(),
    currency: Currency.default("EUR"),
    status: PackConfigStatus.optional(),
    updated_at: z.string().optional(),
  })
  .passthrough();
export type BrandPack = z.infer<typeof BrandPack>;

export const BrandContact = z
  .object({
    brand_admin_name: z.string(),
    brand_admin_email: z.string().email(),
    registered_country: z.string(),
    registered_address: z.string(),
  })
  .passthrough();
export type BrandContact = z.infer<typeof BrandContact>;

export const BrandSummary = z
  .object({
    brand_id: z.string(),
    brand_name: z.string(),
    pack_type: PackType.optional(),
    override_type: OverrideType.optional(),
    subscription_status: SubscriptionStatus.optional(),
    payment_configured: z.boolean().optional(),
    pack_configured: z.boolean().optional(),
    trial_end: z.string().optional(),
    cycle_start: z.string().optional(),
    cycle_end: z.string().optional(),
    last_payment_failure_at: z.string().optional(),
    badge_labels: z.array(z.string()).default([]),
  })
  .passthrough();
export type BrandSummary = z.infer<typeof BrandSummary>;

export const BrandDetail = BrandSummary.merge(
  z
    .object({
      contact: BrandContact.optional(),
      pack: BrandPack.optional(),
      stripe_subscription_id: z.string().nullable().optional(),
    })
    .passthrough(),
);
export type BrandDetail = z.infer<typeof BrandDetail>;

export const BrandListResponse = z
  .object({
    items: z.array(BrandSummary).default([]),
    total_count: z.number().int().nonnegative().optional(),
  })
  .passthrough();
export type BrandListResponse = z.infer<typeof BrandListResponse>;

export const CreateBrandRequest = z.object({
  brand_name: z.string().min(1),
  contact: BrandContact,
  pack: BrandPack.omit({ brand_id: true }),
});
export type CreateBrandRequest = z.infer<typeof CreateBrandRequest>;

export const CreateBrandResponse = BrandDetail;
export type CreateBrandResponse = z.infer<typeof CreateBrandResponse>;

export const UpdateBrandPackRequest = BrandPack.omit({ brand_id: true }).partial();
export type UpdateBrandPackRequest = z.infer<typeof UpdateBrandPackRequest>;

export const UpdateBrandPackResponse = BrandPack;
export type UpdateBrandPackResponse = z.infer<typeof UpdateBrandPackResponse>;

export const UsageAlertCode = z.union([
  z.literal("APPROACHING_80_IMAGE"),
  z.literal("APPROACHING_80_VIDEO"),
  z.literal("LIMIT_REACHED_IMAGE"),
  z.literal("LIMIT_REACHED_VIDEO"),
  z.literal("OVERAGE_IMAGE"),
  z.literal("OVERAGE_VIDEO"),
  z.string(),
]);
export type UsageAlertCode = z.infer<typeof UsageAlertCode>;

export const UsageMetric = z
  .object({
    used: z.number().int().nonnegative(),
    limit: z.number().int().nonnegative(),
    overage: z.number().int().nonnegative().default(0),
    overage_unit_price: z.number().nonnegative().optional(),
    estimated_overage_charge: z.number().nonnegative().default(0),
    alert: UsageAlertCode.optional(),
  })
  .passthrough();
export type UsageMetric = z.infer<typeof UsageMetric>;

export const UsageSnapshot = z
  .object({
    brand_id: z.string(),
    cycle_start: z.string(),
    cycle_end: z.string(),
    days_remaining: z.number().int().nonnegative().optional(),
    is_trial: z.boolean().default(false),
    trial_end: z.string().optional(),
    image_scans: UsageMetric,
    video_minutes: UsageMetric,
    estimated_overage_total: z.number().nonnegative().default(0),
    currency: Currency.default("EUR"),
    updated_at: z.string().optional(),
  })
  .passthrough();
export type UsageSnapshot = z.infer<typeof UsageSnapshot>;

export const OveragePreviewResponse = UsageSnapshot.extend({
  applies: z.boolean().default(true),
});
export type OveragePreviewResponse = z.infer<typeof OveragePreviewResponse>;

export const PaymentStatus = z
  .object({
    brand_id: z.string(),
    payment_configured: z.boolean(),
    stripe_subscription_id: z.string().nullable().optional(),
    subscription_status: SubscriptionStatus,
    card_brand: z.string().optional(),
    card_last4: z.string().optional(),
    card_expiry: z.string().optional(),
    last_payment_failure_at: z.string().optional(),
    next_charge_date: z.string().optional(),
    next_charge_amount: z.number().nonnegative().optional(),
    failed_invoice_at: z.string().optional(),
    grace_period_ends_at: z.string().optional(),
    currency: Currency.default("EUR"),
    updated_at: z.string().optional(),
  })
  .passthrough();
export type PaymentStatus = z.infer<typeof PaymentStatus>;

export const SetupLinkRequest = z
  .object({
    brand_id: z.string(),
    return_url: z.string().optional(),
  })
  .passthrough();
export type SetupLinkRequest = z.infer<typeof SetupLinkRequest>;

export const SetupLinkResponse = z
  .object({
    session_id: z.string(),
    hosted_url: z.string(),
    expires_at: z.string().optional(),
  })
  .passthrough();
export type SetupLinkResponse = z.infer<typeof SetupLinkResponse>;

export const ActivateSubscriptionRequest = z
  .object({
    brand_id: z.string(),
  })
  .passthrough();
export type ActivateSubscriptionRequest = z.infer<typeof ActivateSubscriptionRequest>;

export const ActivateSubscriptionResponse = z
  .object({
    brand_id: z.string(),
    subscription_status: SubscriptionStatus,
    stripe_subscription_id: z.string().optional(),
    activated_at: z.string().optional(),
    cycle_start: z.string().optional(),
    cycle_end: z.string().optional(),
  })
  .passthrough();
export type ActivateSubscriptionResponse = z.infer<typeof ActivateSubscriptionResponse>;

export const SendInvitationRequest = z
  .object({
    brand_id: z.string(),
  })
  .passthrough();
export type SendInvitationRequest = z.infer<typeof SendInvitationRequest>;

export const SendInvitationResponse = z
  .object({
    brand_id: z.string(),
    invitation_id: z.string(),
    sent_at: z.string(),
    sent_to: z.string().email(),
  })
  .passthrough();
export type SendInvitationResponse = z.infer<typeof SendInvitationResponse>;
