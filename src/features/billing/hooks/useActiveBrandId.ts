import { useEffect, useState } from "react";
import {
  getBillingScenario,
  subscribeBillingScenario,
  type BillingScenarioId,
} from "@/api/billingScenario";
import { billingScenarios } from "@/mocks/scenarios/billing";

export function useActiveBrandId(): string {
  const [scenario, setScenario] = useState<BillingScenarioId>(() =>
    getBillingScenario(),
  );
  useEffect(() => subscribeBillingScenario(setScenario), []);
  return billingScenarios[scenario].activeBrandId;
}
