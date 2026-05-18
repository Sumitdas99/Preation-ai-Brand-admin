import { useBillingScenario } from "@/api/billingScenario";
import { billingScenarios } from "@/mocks/scenarios/billing";

export function useActiveBrandId(): string {
  const scenario = useBillingScenario();
  return billingScenarios[scenario].activeBrandId;
}
