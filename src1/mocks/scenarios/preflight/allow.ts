import type { PreflightStatusResponse } from "@/api/schemas/preflight";
import {
  MOCK_ASSET_ID,
  MOCK_POLICY_DECISION_ID,
  MOCK_RUN_ID,
  MOCK_WORKSPACE_ID,
} from "../../constants";

export const allow: PreflightStatusResponse = {
  preflight_run_id: MOCK_RUN_ID,
  asset_id: MOCK_ASSET_ID,
  workspace_id: MOCK_WORKSPACE_ID,
  status: "COMPLETE",
  verdict: "ALLOW",
  policy_decision_id: MOCK_POLICY_DECISION_ID,
  policy_decision: {
    policy_decision_id: MOCK_POLICY_DECISION_ID,
    verdict: "ALLOW",
    obligations: [],
    policy_pack_id: "eu_ai_act",
    policy_pack_version: "1.0",
    evaluated_at: "2026-04-18T11:02:00Z",
  },
  obligations: [],
  engine_statuses: {
    disclosure: "DISCLOSURE_NOT_REQUIRED",
    provenance: "PROVENANCE_EMBEDDED",
    brand_suitability: "BRAND_SUITABILITY_CLEAR",
  },
  detection_scores: {
    synthetic: {
      ai_generated_score: 0.08,
      deepfake_score: 0.02,
      confidence_band: "BELOW_THRESHOLD",
      source_detectors: ["HIVE"],
      evaluation_status: "COMPLETE",
    },
    moderation: {
      nudity: { score: 0.01, verdict: "ALLOW" },
      alcohol: { score: 0.0, presence_level: "NONE", verdict: "ALLOW" },
      minors: { detected: false, confidence: 0.0, verdict: "ALLOW" },
      violence: { score: 0.0, verdict: "ALLOW" },
      hate_symbols: { score: 0.0, verdict: "ALLOW" },
      weapons: { score: 0.0, verdict: "ALLOW" },
      drugs: { score: 0.0, verdict: "ALLOW" },
      gambling: { score: 0.0, verdict: "ALLOW" },
      tobacco: { score: 0.0, verdict: "ALLOW" },
      evaluation_status: "COMPLETE",
    },
    provenance: {
      manifest_status: "PRESENT",
      signature_valid: true,
      strip_detected: false,
      evaluation_status: "COMPLETE",
    },
    consent: {
      rpl_detected: false,
      rpl_identities: [],
      human_presence_detected: false,
      estimated_person_count: 0,
      evaluation_status: "COMPLETE",
    },
  },
  started_at: "2026-04-18T10:59:18Z",
  completed_at: "2026-04-18T11:02:00Z",
};
