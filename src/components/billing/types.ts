import type {
  PackConfigStatus,
  PackType,
  SubscriptionStatus,
} from "@/api/schemas/billing";

export type DashboardTone =
  | "welcome-payment-required"
  | "welcome-activate"
  | "trial-active"
  | "paid-active"
  | "paid-overage"
  | "past-due"
  | "suspended";

export type BadgeTone = "neutral" | "warning" | "success" | "danger" | "info";

export interface SubscriptionBadge {
  label: string;
  tone: BadgeTone;
}

export interface BrandSummaryRow {
  brandId: string;
  brandName: string;
  packType?: PackType;
  packLabel: string;
  subscriptionStatus?: SubscriptionStatus;
  badges: SubscriptionBadge[];
  trialExpiresLabel?: string;
}

export interface UsageMeterVM {
  label: string;
  used: number;
  limit: number;
  percent: number;
  overage: number;
  estimatedOverageCharge: number;
  isOverage: boolean;
  alertText?: string;
  remainingLabel: string;
}

export interface BillingDashboardVM {
  tone: DashboardTone;
  cycleLabel?: string;
  daysRemainingLabel?: string;
  packStatus: PackConfigStatus;
}
