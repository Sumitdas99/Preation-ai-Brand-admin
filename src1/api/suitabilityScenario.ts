import {
  DEFAULT_SUITABILITY_SCENARIO,
  isSuitabilityScenarioId,
  suitabilityScenarios,
  type SuitabilityScenarioId,
} from "@/mocks/scenarios/suitability";

const STORAGE_KEY = "praetion.suitabilityScenario";

type Listener = (scenario: SuitabilityScenarioId) => void;

function readPersisted(): SuitabilityScenarioId {
  if (typeof window === "undefined") return DEFAULT_SUITABILITY_SCENARIO;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isSuitabilityScenarioId(stored)
      ? stored
      : DEFAULT_SUITABILITY_SCENARIO;
  } catch {
    return DEFAULT_SUITABILITY_SCENARIO;
  }
}

function writePersisted(scenario: SuitabilityScenarioId): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, scenario);
  } catch {
    return;
  }
}

let current: SuitabilityScenarioId = readPersisted();
const listeners = new Set<Listener>();

export function getSuitabilityScenario(): SuitabilityScenarioId {
  return current;
}

export function setSuitabilityScenario(scenario: SuitabilityScenarioId): void {
  if (scenario === current) return;
  current = scenario;
  writePersisted(scenario);
  listeners.forEach((l) => l(scenario));
}

export function subscribeSuitabilityScenario(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const SUITABILITY_SCENARIO_IDS = Object.keys(
  suitabilityScenarios,
) as readonly SuitabilityScenarioId[];

export type { SuitabilityScenarioId };
