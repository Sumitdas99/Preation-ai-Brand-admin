import {
  billingScenarios,
  DEFAULT_BILLING_SCENARIO,
  isBillingScenarioId,
  type BillingScenarioId,
} from "@/mocks/scenarios/billing";

const STORAGE_KEY = "praetion.billingScenario";

type Listener = (scenario: BillingScenarioId) => void;

function readPersisted(): BillingScenarioId {
  if (typeof window === "undefined") return DEFAULT_BILLING_SCENARIO;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isBillingScenarioId(stored) ? stored : DEFAULT_BILLING_SCENARIO;
  } catch {
    return DEFAULT_BILLING_SCENARIO;
  }
}

function writePersisted(scenario: BillingScenarioId): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, scenario);
  } catch {
    return;
  }
}

let current: BillingScenarioId = readPersisted();
const listeners = new Set<Listener>();

export function getBillingScenario(): BillingScenarioId {
  return current;
}

export function setBillingScenario(scenario: BillingScenarioId): void {
  if (scenario === current) return;
  current = scenario;
  writePersisted(scenario);
  listeners.forEach((listener) => listener(scenario));
}

export function subscribeBillingScenario(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const BILLING_SCENARIO_IDS = Object.keys(
  billingScenarios,
) as readonly BillingScenarioId[];

export type { BillingScenarioId };
