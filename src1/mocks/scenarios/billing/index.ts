import type {
  BrandDetail,
  BrandListResponse,
  PaymentStatus,
  UsageSnapshot,
} from "@/api/schemas/billing";

export const BILLING_SCENARIO_IDS = [
  "default",
  "welcome-payment-required",
  "welcome-activate",
  "trial-active",
  "paid-active",
  "paid-overage",
  "past-due",
  "suspended",
] as const;

export type BillingScenarioId = (typeof BILLING_SCENARIO_IDS)[number];

export const DEFAULT_BILLING_SCENARIO: BillingScenarioId = "default";

export function isBillingScenarioId(value: unknown): value is BillingScenarioId {
  return (
    typeof value === "string" &&
    (BILLING_SCENARIO_IDS as readonly string[]).includes(value)
  );
}

const MOCK_BRAND_ID = "brn_demo_acme_eu";
const MOCK_BRAND_NAME = "Acme Corporation EU";
const MOCK_ADMIN_EMAIL = "s.chen@acmecorp.eu";

const baseBrand: BrandDetail = {
  brand_id: MOCK_BRAND_ID,
  brand_name: MOCK_BRAND_NAME,
  pack_type: "TRIAL",
  override_type: "TRIAL_OVERRIDE",
  subscription_status: "AWAITING_ACTIVATION",
  payment_configured: false,
  pack_configured: true,
  trial_end: "2026-06-30",
  badge_labels: ["Trial", "Awaiting activation"],
  contact: {
    brand_admin_name: "Sarah Chen",
    brand_admin_email: MOCK_ADMIN_EMAIL,
    registered_country: "Germany (DE)",
    registered_address:
      "Acme Corporation EU GmbH · Friedrichstraße 89 · 10117 Berlin · Germany",
  },
  pack: {
    brand_id: MOCK_BRAND_ID,
    pack_type: "TRIAL",
    override_type: "TRIAL_OVERRIDE",
    custom_price: 2400,
    override_reason: "Q2 2026 pilot — agreed with CEO 14 Apr",
    custom_image_limit: 500,
    custom_video_limit: 120,
    overage_image_price: 0.8,
    overage_video_price: 3.5,
    trial_image_limit: 50,
    trial_video_limit: 20,
    trial_end: "2026-06-30",
    first_charge_date: "2026-07-01",
    monthly_price: 2400,
    image_scan_limit: 500,
    video_minutes_limit: 120,
    currency: "EUR",
    status: "CONFIGURED_AWAITING_ACTIVATION",
    updated_at: "2026-04-23T10:00:00Z",
  },
  stripe_subscription_id: null,
};

const luminary: BrandDetail = {
  brand_id: "brn_demo_luminary",
  brand_name: "Luminary Fashion GmbH",
  pack_type: "ENTERPRISE",
  override_type: "ENTERPRISE_OVERRIDE",
  subscription_status: "ACTIVE",
  payment_configured: true,
  pack_configured: true,
  cycle_start: "2026-04-01",
  cycle_end: "2026-04-30",
  badge_labels: ["Active", "Paid"],
  contact: {
    brand_admin_name: "M. Bauer",
    brand_admin_email: "m.bauer@luminary.de",
    registered_country: "Germany (DE)",
    registered_address: "Luminary Fashion GmbH · Maximilianstraße 12 · Munich",
  },
  pack: {
    brand_id: "brn_demo_luminary",
    pack_type: "ENTERPRISE",
    override_type: "ENTERPRISE_OVERRIDE",
    custom_price: 1800,
    override_reason: "Fashion vertical pilot · Jan 2026",
    custom_image_limit: 500,
    custom_video_limit: 120,
    overage_image_price: 0.8,
    overage_video_price: 3.5,
    monthly_price: 1800,
    image_scan_limit: 500,
    video_minutes_limit: 120,
    currency: "EUR",
    status: "ACTIVE",
    updated_at: "2026-04-19T08:30:00Z",
  },
  stripe_subscription_id: "sub_demo_luminary",
};

const nordvik: BrandDetail = {
  brand_id: "brn_demo_nordvik",
  brand_name: "Nordvik Media AS",
  pack_type: "ENTERPRISE",
  override_type: "ENTERPRISE_OVERRIDE",
  subscription_status: "PAST_DUE",
  payment_configured: true,
  pack_configured: true,
  badge_labels: ["Past due", "Payment failed", "Stripe retrying"],
  last_payment_failure_at: "2026-04-29T08:00:00Z",
  contact: {
    brand_admin_name: "T. Erikssen",
    brand_admin_email: "t.erikssen@nordvik.no",
    registered_country: "Norway (NO)",
    registered_address: "Nordvik Media AS · Karl Johans gate 1 · Oslo",
  },
  pack: {
    brand_id: "brn_demo_nordvik",
    pack_type: "ENTERPRISE",
    monthly_price: 1500,
    overage_image_price: 0.8,
    overage_video_price: 3.5,
    image_scan_limit: 400,
    video_minutes_limit: 90,
    currency: "EUR",
    status: "PAST_DUE",
    updated_at: "2026-04-29T08:30:00Z",
  },
  stripe_subscription_id: "sub_demo_nordvik",
};

const solaris: BrandDetail = {
  brand_id: "brn_demo_solaris",
  brand_name: "Solaris Brands FR",
  pack_type: "TRIAL",
  override_type: "TRIAL_OVERRIDE",
  subscription_status: "ACTIVE",
  payment_configured: true,
  pack_configured: true,
  trial_end: "2026-08-15",
  badge_labels: ["Trial", "Active"],
  contact: {
    brand_admin_name: "C. Dupont",
    brand_admin_email: "c.dupont@solaris.fr",
    registered_country: "France (FR)",
    registered_address: "Solaris Brands FR SAS · 8 rue de Rivoli · Paris",
  },
  pack: {
    brand_id: "brn_demo_solaris",
    pack_type: "TRIAL",
    override_type: "TRIAL_OVERRIDE",
    custom_price: 1200,
    custom_image_limit: 300,
    custom_video_limit: 60,
    overage_image_price: 0.8,
    overage_video_price: 3.5,
    trial_image_limit: 30,
    trial_video_limit: 10,
    trial_end: "2026-08-15",
    first_charge_date: "2026-08-16",
    monthly_price: 1200,
    image_scan_limit: 300,
    video_minutes_limit: 60,
    currency: "EUR",
    status: "TRIAL_ACTIVE",
  },
  stripe_subscription_id: "sub_demo_solaris",
};

const ember: BrandDetail = {
  brand_id: "brn_demo_ember",
  brand_name: "Ember Creative Ltd",
  subscription_status: "PENDING",
  payment_configured: false,
  pack_configured: false,
  badge_labels: ["Pack not configured"],
  contact: {
    brand_admin_name: "P. Singh",
    brand_admin_email: "p.singh@ember.co.uk",
    registered_country: "United Kingdom (UK)",
    registered_address: "Ember Creative Ltd · 14 Old Street · London",
  },
  stripe_subscription_id: null,
};

const STORAGE_KEY = "mock_added_brands";

function loadPersistedBrands(): BrandDetail[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BrandDetail[]) : [];
  } catch {
    return [];
  }
}

const allBrands: BrandDetail[] = [
  baseBrand, luminary, nordvik, solaris, ember,
  ...loadPersistedBrands(),
];

export function addMockBrand(brand: BrandDetail): void {
  allBrands.push(brand);
  try {
    const persisted = loadPersistedBrands();
    persisted.push(brand);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  } catch { }
}

export function getMockBrandList(): BrandListResponse {
  return {
    items: allBrands.map((b) => ({
      brand_id: b.brand_id,
      brand_name: b.brand_name,
      pack_type: b.pack_type,
      override_type: b.override_type,
      subscription_status: b.subscription_status,
      payment_configured: b.payment_configured ?? false,
      pack_configured: b.pack_configured ?? Boolean(b.pack),
      badge_labels: b.badge_labels ?? [],
      contact: b.contact,
      trial_end: b.trial_end ?? b.pack?.trial_end,
    })),
    total_count: allBrands.length,
  };
}

const baseBrandList: BrandListResponse = {
  items: allBrands.map((b) => ({
    brand_id: b.brand_id,
    brand_name: b.brand_name,
    pack_type: b.pack_type,
    override_type: b.override_type,
    subscription_status: b.subscription_status,
    payment_configured: b.payment_configured,
    pack_configured: b.pack_configured,
    trial_end: b.trial_end,
    cycle_start: b.cycle_start,
    cycle_end: b.cycle_end,
    last_payment_failure_at: b.last_payment_failure_at,
    badge_labels: b.badge_labels,
  })),
  total_count: allBrands.length,
};

const trialUsage: UsageSnapshot = {
  brand_id: MOCK_BRAND_ID,
  cycle_start: "2026-04-29",
  cycle_end: "2026-06-30",
  is_trial: true,
  trial_end: "2026-06-30",
  days_remaining: 62,
  image_scans: {
    used: 38,
    limit: 50,
    overage: 0,
    overage_unit_price: 0.8,
    estimated_overage_charge: 0,
  },
  video_minutes: {
    used: 8,
    limit: 20,
    overage: 0,
    overage_unit_price: 3.5,
    estimated_overage_charge: 0,
  },
  estimated_overage_total: 0,
  currency: "EUR",
  updated_at: "2026-04-29T16:00:00Z",
};

const overageUsage: UsageSnapshot = {
  brand_id: "brn_demo_luminary",
  cycle_start: "2026-04-01",
  cycle_end: "2026-04-30",
  is_trial: false,
  days_remaining: 11,
  image_scans: {
    used: 620,
    limit: 500,
    overage: 120,
    overage_unit_price: 0.8,
    estimated_overage_charge: 96,
    alert: "OVERAGE_IMAGE",
  },
  video_minutes: {
    used: 97,
    limit: 120,
    overage: 0,
    overage_unit_price: 3.5,
    estimated_overage_charge: 0,
    alert: "APPROACHING_80_VIDEO",
  },
  estimated_overage_total: 96,
  currency: "EUR",
  updated_at: "2026-04-19T16:00:00Z",
};

const pastDueUsage: UsageSnapshot = {
  brand_id: "brn_demo_nordvik",
  cycle_start: "2026-04-01",
  cycle_end: "2026-04-30",
  is_trial: false,
  days_remaining: 11,
  image_scans: {
    used: 312,
    limit: 500,
    overage: 0,
    overage_unit_price: 0.8,
    estimated_overage_charge: 0,
  },
  video_minutes: {
    used: 44,
    limit: 120,
    overage: 0,
    overage_unit_price: 3.5,
    estimated_overage_charge: 0,
  },
  estimated_overage_total: 0,
  currency: "EUR",
  updated_at: "2026-04-29T16:00:00Z",
};

const paymentStatusByScenario: Record<BillingScenarioId, PaymentStatus> = {
  default: {
    brand_id: MOCK_BRAND_ID,
    payment_configured: false,
    stripe_subscription_id: null,
    subscription_status: "AWAITING_ACTIVATION",
    currency: "EUR",
  },
  "welcome-payment-required": {
    brand_id: MOCK_BRAND_ID,
    payment_configured: false,
    stripe_subscription_id: null,
    subscription_status: "PENDING",
    currency: "EUR",
  },
  "welcome-activate": {
    brand_id: MOCK_BRAND_ID,
    payment_configured: true,
    stripe_subscription_id: null,
    subscription_status: "AWAITING_ACTIVATION",
    card_brand: "Visa",
    card_last4: "4242",
    card_expiry: "09/28",
    next_charge_date: "2026-07-01",
    next_charge_amount: 2400,
    currency: "EUR",
  },
  "trial-active": {
    brand_id: MOCK_BRAND_ID,
    payment_configured: true,
    stripe_subscription_id: "sub_demo_acme",
    subscription_status: "ACTIVE",
    next_charge_date: "2026-07-01",
    next_charge_amount: 2400,
    currency: "EUR",
  },
  "paid-active": {
    brand_id: "brn_demo_luminary",
    payment_configured: true,
    stripe_subscription_id: "sub_demo_luminary",
    subscription_status: "ACTIVE",
    next_charge_date: "2026-05-01",
    next_charge_amount: 1800,
    currency: "EUR",
  },
  "paid-overage": {
    brand_id: "brn_demo_luminary",
    payment_configured: true,
    stripe_subscription_id: "sub_demo_luminary",
    subscription_status: "ACTIVE",
    next_charge_date: "2026-05-01",
    next_charge_amount: 1800,
    currency: "EUR",
  },
  "past-due": {
    brand_id: "brn_demo_nordvik",
    payment_configured: true,
    stripe_subscription_id: "sub_demo_nordvik",
    subscription_status: "PAST_DUE",
    failed_invoice_at: "2026-04-29T08:00:00Z",
    grace_period_ends_at: "2026-05-02T08:00:00Z",
    last_payment_failure_at: "2026-04-29T08:00:00Z",
    currency: "EUR",
  },
  suspended: {
    brand_id: "brn_demo_nordvik",
    payment_configured: true,
    stripe_subscription_id: "sub_demo_nordvik",
    subscription_status: "SUSPENDED",
    failed_invoice_at: "2026-04-29T08:00:00Z",
    last_payment_failure_at: "2026-04-29T08:00:00Z",
    currency: "EUR",
  },
};

const usageByScenario: Record<BillingScenarioId, UsageSnapshot> = {
  default: trialUsage,
  "welcome-payment-required": trialUsage,
  "welcome-activate": trialUsage,
  "trial-active": trialUsage,
  "paid-active": {
    ...overageUsage,
    image_scans: { ...overageUsage.image_scans, used: 312, overage: 0, estimated_overage_charge: 0, alert: undefined },
    estimated_overage_total: 0,
  },
  "paid-overage": overageUsage,
  "past-due": pastDueUsage,
  suspended: pastDueUsage,
};

const activeBrandByScenario: Record<BillingScenarioId, string> = {
  default: MOCK_BRAND_ID,
  "welcome-payment-required": MOCK_BRAND_ID,
  "welcome-activate": MOCK_BRAND_ID,
  "trial-active": MOCK_BRAND_ID,
  "paid-active": "brn_demo_luminary",
  "paid-overage": "brn_demo_luminary",
  "past-due": "brn_demo_nordvik",
  suspended: "brn_demo_nordvik",
};

export interface BillingScenarioFixture {
  brands: BrandDetail[];
  brandList: BrandListResponse;
  paymentStatus: PaymentStatus;
  usage: UsageSnapshot;
  activeBrandId: string;
}

function buildFixture(id: BillingScenarioId): BillingScenarioFixture {
  return {
    brands: allBrands,
    brandList: baseBrandList,
    paymentStatus: paymentStatusByScenario[id],
    usage: usageByScenario[id],
    activeBrandId: activeBrandByScenario[id],
  };
}

export const billingScenarios: Record<BillingScenarioId, BillingScenarioFixture> =
  Object.fromEntries(
    BILLING_SCENARIO_IDS.map((id) => [id, buildFixture(id)]),
  ) as Record<BillingScenarioId, BillingScenarioFixture>;

export function findBrandById(brandId: string): BrandDetail | undefined {
  return allBrands.find((b) => b.brand_id === brandId);
}

export function resolveBillingScenario(
  raw: string | null,
): BillingScenarioId {
  return isBillingScenarioId(raw) ? raw : DEFAULT_BILLING_SCENARIO;
}

export const MOCK_BILLING_BRAND_ID = MOCK_BRAND_ID;
