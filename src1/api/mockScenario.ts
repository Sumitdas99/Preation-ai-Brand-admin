export type MockScenario =
  | "in-progress"
  | "block"
  | "challenge-pending"
  | "system-error"
  | "allow-with-warnings"
  | "allow"
  | "approved-pending-proof"
  | "publish-cleared";

const DEFAULT_SCENARIO: MockScenario = "in-progress";
const STORAGE_KEY = "praetion.mockScenario";

type Listener = (scenario: MockScenario) => void;

function isScenario(value: unknown): value is MockScenario {
  return (
    value === "in-progress" ||
    value === "block" ||
    value === "challenge-pending" ||
    value === "system-error" ||
    value === "allow-with-warnings" ||
    value === "allow" ||
    value === "approved-pending-proof" ||
    value === "publish-cleared"
  );
}

function readPersisted(): MockScenario {
  if (typeof window === "undefined") return DEFAULT_SCENARIO;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isScenario(stored) ? stored : DEFAULT_SCENARIO;
  } catch {
    return DEFAULT_SCENARIO;
  }
}

function writePersisted(scenario: MockScenario): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, scenario);
  } catch {
    return;
  }
}

let currentScenario: MockScenario = readPersisted();
const listeners = new Set<Listener>();

export function getMockScenario(): MockScenario {
  return currentScenario;
}

export function setMockScenario(scenario: MockScenario): void {
  if (scenario === currentScenario) return;
  currentScenario = scenario;
  writePersisted(scenario);
  listeners.forEach((l) => l(scenario));
}

export function subscribeMockScenario(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
