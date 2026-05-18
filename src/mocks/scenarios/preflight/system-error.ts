import type { PreflightStatusResponse } from "@/api/schemas/preflight";
import {
  MOCK_ASSET_ID,
  MOCK_INCIDENT_ID,
  MOCK_POLICY_DECISION_ID,
  MOCK_RUN_ID,
  MOCK_WORKSPACE_ID,
} from "../../constants";

export const systemError: PreflightStatusResponse = {
  preflight_run_id: MOCK_RUN_ID,
  asset_id: MOCK_ASSET_ID,
  workspace_id: MOCK_WORKSPACE_ID,
  status: "COMPLETE",
  verdict: "BLOCK_UNTIL_REMEDIATED",
  blocking_reason: "SYSTEM_ERROR_POLICY_UNAVAILABLE",
  policy_decision_id: MOCK_POLICY_DECISION_ID,
  policy_decision: {
    policy_decision_id: MOCK_POLICY_DECISION_ID,
    verdict: "BLOCK_UNTIL_REMEDIATED",
    blocking_reason: "SYSTEM_ERROR_POLICY_UNAVAILABLE",
    obligations: [],
    incident_id: MOCK_INCIDENT_ID,
    evaluated_at: "2026-04-18T09:15:09Z",
  },
  obligations: [],
  engine_statuses: {
    disclosure: "DISCLOSURE_NOT_REQUIRED",
    provenance: "PROVENANCE_PENDING",
    brand_suitability: "BRAND_SUITABILITY_PENDING",
  },
  incident_id: MOCK_INCIDENT_ID,
  started_at: "2026-04-18T09:14:22Z",
  completed_at: "2026-04-18T09:15:09Z",
};
