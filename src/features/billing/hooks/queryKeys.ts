import type { BillingScenarioId } from "@/api/billingScenario";

export const billingKeys = {
  all: ["billing"] as const,
  brandList: (scenario: BillingScenarioId) =>
    ["billing", "brands", scenario] as const,
  brand: (brandId: string, scenario: BillingScenarioId) =>
    ["billing", "brand", brandId, scenario] as const,
  brandPack: (brandId: string, scenario: BillingScenarioId) =>
    ["billing", "brand", brandId, "pack", scenario] as const,
  overagePreview: (brandId: string, scenario: BillingScenarioId) =>
    ["billing", "brand", brandId, "overage-preview", scenario] as const,
  usage: (brandId: string, scenario: BillingScenarioId) =>
    ["billing", "usage", brandId, scenario] as const,
  paymentStatus: (brandId: string, scenario: BillingScenarioId) =>
    ["billing", "payment-status", brandId, scenario] as const,
};
