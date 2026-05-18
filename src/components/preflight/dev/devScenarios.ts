import type { MockScenario } from "@/api/mockScenario";

export interface ScenarioOption {
  id: MockScenario;
  label: string;
}

export const DEV_SCENARIOS: ScenarioOption[] = [
  { id: "in-progress", label: "State 0 — In Progress" },
  { id: "block", label: "State A — Block" },
  { id: "challenge-pending", label: "State A — Challenge Pending" },
  { id: "system-error", label: "System Error" },
  { id: "allow-with-warnings", label: "State B — Allow w/ Warnings" },
  { id: "allow", label: "State C — Allow" },
  { id: "approved-pending-proof", label: "Sub-state — Approved · Pending Proof" },
  { id: "publish-cleared", label: "Terminal — Publish Cleared" },
];
