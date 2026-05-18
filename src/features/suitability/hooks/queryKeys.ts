export const suitabilityKeys = {
  all: ["suitability"] as const,
  results: (runId: string) => ["suitability", runId, "results"] as const,
  resultsByScenario: (runId: string, scenario: string) =>
    ["suitability", runId, "results", scenario] as const,
};
