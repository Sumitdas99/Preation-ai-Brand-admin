import type { PreflightStatusResponse } from "@/api/schemas/preflight";
import {
  MOCK_ASSET_ID,
  MOCK_POLICY_DECISION_ID,
  MOCK_RUN_ID,
  MOCK_WORKSPACE_ID,
} from "../../constants";

export const allowWithWarnings: PreflightStatusResponse = {
  preflight_run_id: MOCK_RUN_ID,
  asset_id: MOCK_ASSET_ID,
  workspace_id: MOCK_WORKSPACE_ID,
  status: "COMPLETE",
  verdict: "ALLOW_WITH_WARNINGS",
  policy_decision_id: MOCK_POLICY_DECISION_ID,
  policy_decision: {
    policy_decision_id: MOCK_POLICY_DECISION_ID,
    verdict: "ALLOW_WITH_WARNINGS",
    obligations: [],
    policy_pack_id: "eu_ai_act",
    policy_pack_version: "1.0",
    evaluated_at: "2026-04-18T09:15:09Z",
  },
  obligations: [
    {
      obligation_id: "obl_advisory_1",
      type: "BRAND_SUITABILITY_BLOCKED",
      severity: "ADVISORY",
      policy_reference: "EU AI Act — Germany overlay",
      explanation:
        "German market geo overlay recommends Legal approval before publishing AI-influenced content.",
    },
    {
      obligation_id: "obl_advisory_2",
      type: "BRAND_SUITABILITY_BLOCKED",
      severity: "ADVISORY",
      policy_reference: "Workspace brand policy",
      explanation:
        "Alcohol-related content detected at 0.41 (advisory threshold). Flagged for Legal awareness.",
    },
  ],
  engine_statuses: {
    disclosure: "DISCLOSURE_SPEC_LOCKED",
    provenance: "PROVENANCE_EMBEDDED",
    brand_suitability: "BRAND_SUITABILITY_FLAGGED_REVIEWED",
  },
  detection_scores: {
    synthetic: {
      ai_generated_score: 0.34,
      deepfake_score: 0.12,
      confidence_band: "FLAG_BAND",
      source_detectors: ["HIVE"],
      evaluation_status: "COMPLETE",
    },
    moderation: {
      nudity: { score: 0.04, verdict: "ALLOW" },
      alcohol: { score: 0.41, presence_level: "FEATURED", verdict: "FLAG" },
      minors: { detected: false, confidence: 0.0, verdict: "ALLOW" },
      violence: { score: 0.02, verdict: "ALLOW" },
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
  started_at: "2026-04-18T09:14:22Z",
  completed_at: "2026-04-18T09:15:09Z",
};
