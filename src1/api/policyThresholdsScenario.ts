import {
  DEFAULT_POLICY_THRESHOLDS_SCENARIO,
  isPolicyThresholdsScenarioId,
  policyThresholdsScenarios,
  type PolicyThresholdsScenarioId,
} from "@/mocks/scenarios/policyThresholds";

const STORAGE_KEY = "praetion.policyThresholdsScenario";

type Listener = (scenario: PolicyThresholdsScenarioId) => void;

function readPersisted(): PolicyThresholdsScenarioId {
  if (typeof window === "undefined") return DEFAULT_POLICY_THRESHOLDS_SCENARIO;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isPolicyThresholdsScenarioId(stored)
      ? stored
      : DEFAULT_POLICY_THRESHOLDS_SCENARIO;
  } catch {
    return DEFAULT_POLICY_THRESHOLDS_SCENARIO;
  }
}

function writePersisted(scenario: PolicyThresholdsScenarioId): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, scenario);
  } catch {
    return;
  }
}

let current: PolicyThresholdsScenarioId = readPersisted();
const listeners = new Set<Listener>();

export function getPolicyThresholdsScenario(): PolicyThresholdsScenarioId {
  return current;
}

export function setPolicyThresholdsScenario(
  scenario: PolicyThresholdsScenarioId,
): void {
  if (scenario === current) return;
  current = scenario;
  writePersisted(scenario);
  listeners.forEach((listener) => listener(scenario));
}

export function subscribePolicyThresholdsScenario(
  listener: Listener,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const POLICY_THRESHOLDS_SCENARIO_IDS = Object.keys(
  policyThresholdsScenarios,
) as readonly PolicyThresholdsScenarioId[];

export type { PolicyThresholdsScenarioId };
