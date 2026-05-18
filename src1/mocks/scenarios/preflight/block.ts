import type { PreflightStatusResponse } from "@/api/schemas/preflight";
import {
  MOCK_ASSET_ID,
  MOCK_CONSENT_SPEC_ID,
  MOCK_DISCLOSURE_SPEC_ID,
  MOCK_POLICY_DECISION_ID,
  MOCK_RUN_ID,
  MOCK_WORKSPACE_ID,
} from "../../constants";

export const block: PreflightStatusResponse = {
  preflight_run_id: MOCK_RUN_ID,
  asset_id: MOCK_ASSET_ID,
  workspace_id: MOCK_WORKSPACE_ID,
  status: "COMPLETE",
  verdict: "BLOCK_UNTIL_REMEDIATED",
  policy_decision_id: MOCK_POLICY_DECISION_ID,
  policy_decision: {
    policy_decision_id: MOCK_POLICY_DECISION_ID,
    verdict: "BLOCK_UNTIL_REMEDIATED",
    obligations: [],
    policy_pack_id: "eu_ai_act",
    policy_pack_version: "1.0",
    evaluated_at: "2026-04-18T09:15:09Z",
  },
  obligations: [
    {
      obligation_id: "obl_1",
      type: "DISCLOSURE_REQUIRED",
      severity: "MANDATORY",
      policy_reference: "EU AI Act Article 50(1)",
      explanation:
        "Asset detected as AI-generated. A clear and visible disclosure label is required before publication under EU AI Act Article 50(1).",
      spec_id: MOCK_DISCLOSURE_SPEC_ID,
    },
    {
      obligation_id: "obl_2",
      type: "ATTESTATION_REQUIRED",
      severity: "MANDATORY",
      policy_reference: "EU AI Act Article 50(1)",
      explanation:
        "C2PA provenance manifest absent. Embedding is currently in progress — no Reviewer action required.",
    },
    {
      obligation_id: "obl_3",
      type: "CONSENT_OR_SYNTHETIC_ATTESTATION_REQUIRED",
      severity: "MANDATORY",
      policy_reference: "EU AI Act Article 50(4)",
      explanation:
        "Human presence detected with potential RPL — Reviewer must attach consent documentation or declare presence before this asset can proceed.",
      spec_id: MOCK_CONSENT_SPEC_ID,
    },
  ],
  engine_statuses: {
    disclosure: "DISCLOSURE_REQUIRED",
    provenance: "PROVENANCE_EMBEDDING",
    brand_suitability: "BRAND_SUITABILITY_CLEAR",
  },
  detection_scores: {
    synthetic: {
      ai_generated_score: 0.87,
      deepfake_score: 0.72,
      confidence_band: "BLOCK_BAND",
      source_detectors: ["HIVE", "SIGHTENGINE"],
      evaluation_status: "COMPLETE",
    },
    moderation: {
      nudity: { score: 0.04, verdict: "ALLOW" },
      alcohol: { score: 0.02, presence_level: "NONE", verdict: "ALLOW" },
      minors: { detected: false, confidence: 0.01, verdict: "ALLOW" },
      violence: { score: 0.02, verdict: "ALLOW" },
      hate_symbols: { score: 0.0, verdict: "ALLOW" },
      weapons: { score: 0.0, verdict: "ALLOW" },
      drugs: { score: 0.0, verdict: "ALLOW" },
      gambling: { score: 0.0, verdict: "ALLOW" },
      tobacco: { score: 0.0, verdict: "ALLOW" },
      evaluation_status: "COMPLETE",
    },
    provenance: {
      manifest_status: "ABSENT",
      strip_detected: false,
      evaluation_status: "COMPLETE",
    },
    consent: {
      rpl_detected: true,
      rpl_identities: ["Recognised Person A", "Recognised Person B"],
      human_presence_detected: true,
      estimated_person_count: 4,
      evaluation_status: "COMPLETE",
    },
  },
  started_at: "2026-04-18T09:14:22Z",
  completed_at: "2026-04-18T09:15:09Z",
};
