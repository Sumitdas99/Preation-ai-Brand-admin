import {
  consentScenarios,
  DEFAULT_CONSENT_SCENARIO,
  type ConsentScenarioId,
} from "@/mocks/scenarios/consent";

const STORAGE_KEY = "praetion.consentScenario";

type Listener = (scenario: ConsentScenarioId) => void;

function isScenario(value: unknown): value is ConsentScenarioId {
  return typeof value === "string" && value in consentScenarios;
}

function readPersisted(): ConsentScenarioId {
  if (typeof window === "undefined") return DEFAULT_CONSENT_SCENARIO;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isScenario(stored) ? stored : DEFAULT_CONSENT_SCENARIO;
  } catch {
    return DEFAULT_CONSENT_SCENARIO;
  }
}

function writePersisted(scenario: ConsentScenarioId): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, scenario);
  } catch {
    return;
  }
}

let current: ConsentScenarioId = readPersisted();
const listeners = new Set<Listener>();

export function getConsentScenario(): ConsentScenarioId {
  return current;
}

export function setConsentScenario(scenario: ConsentScenarioId): void {
  if (scenario === current) return;
  current = scenario;
  writePersisted(scenario);
  listeners.forEach((l) => l(scenario));
}

export function subscribeConsentScenario(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export type { ConsentScenarioId };
