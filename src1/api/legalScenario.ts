import {
  DEFAULT_LEGAL_REVIEW_SCENARIO,
  isLegalReviewScenarioId,
  legalReviewScenarios,
  type LegalReviewScenarioId,
} from "@/mocks/scenarios/legalReview";

const STORAGE_KEY = "praetion.legalScenario";

type Listener = (scenario: LegalReviewScenarioId) => void;

function readPersisted(): LegalReviewScenarioId {
  if (typeof window === "undefined") return DEFAULT_LEGAL_REVIEW_SCENARIO;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isLegalReviewScenarioId(stored)
      ? stored
      : DEFAULT_LEGAL_REVIEW_SCENARIO;
  } catch {
    return DEFAULT_LEGAL_REVIEW_SCENARIO;
  }
}

function writePersisted(scenario: LegalReviewScenarioId): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, scenario);
  } catch {
    return;
  }
}

let current: LegalReviewScenarioId = readPersisted();
const listeners = new Set<Listener>();

export function getLegalScenario(): LegalReviewScenarioId {
  return current;
}

export function setLegalScenario(scenario: LegalReviewScenarioId): void {
  if (scenario === current) return;
  current = scenario;
  writePersisted(scenario);
  listeners.forEach((l) => l(scenario));
}

export function subscribeLegalScenario(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const LEGAL_SCENARIO_IDS = Object.keys(
  legalReviewScenarios,
) as readonly LegalReviewScenarioId[];

export type { LegalReviewScenarioId };
