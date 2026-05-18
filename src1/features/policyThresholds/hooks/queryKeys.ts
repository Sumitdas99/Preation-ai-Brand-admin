export const policyThresholdKeys = {
  all: ["policy-thresholds"] as const,
  settings: (workspaceId: string, scenario: string) =>
    ["policy-thresholds", workspaceId, "settings", scenario] as const,
  presets: (scenario: string) =>
    ["policy-thresholds", "presets", scenario] as const,
  provenanceSummary: (workspaceId: string, scenario: string) =>
    ["policy-thresholds", workspaceId, "provenance-summary", scenario] as const,
};
