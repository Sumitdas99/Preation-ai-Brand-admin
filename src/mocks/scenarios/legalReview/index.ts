import type { ApprovalDetail } from "@/api/schemas/approvals";
import type { DisclosureSpec } from "@/api/schemas/disclosure";
import type { PreflightStatusResponse } from "@/api/schemas/preflight";
import {
  MOCK_LEGAL_DISCLOSURE_SPEC_ID,
  MOCK_POLICY_DECISION_ID,
  MOCK_WORKSPACE_ID,
} from "../../constants";

export type LegalReviewScenarioId =
  | "under-review-state-a"
  | "under-review-state-b"
  | "under-review-clean"
  | "post-attestation-success"
  | "hard-block-escalation";

export const DEFAULT_LEGAL_REVIEW_SCENARIO: LegalReviewScenarioId =
  "under-review-state-a";

export type LegalReviewViewVariant =
  | "state-a-items-pending"
  | "state-b-ready-to-attest"
  | "clean-standard-attestation"
  | "post-attestation-success"
  | "hard-block-escalation";

export interface LegalReviewItemSnapshot {
  id: "challenge" | "brand-block" | "provenance-failure";
  resolved: boolean;
  category_key?: string;
}

export interface LegalReviewFixture {
  scenario_id: LegalReviewScenarioId;
  variant: LegalReviewViewVariant;
  preflight_run_id: string;
  asset_id: string;
  approval: ApprovalDetail;
  preflight: PreflightStatusResponse;
  items: LegalReviewItemSnapshot[];
  disclosure?: DisclosureSpec;
}

const BRAND_VIDEO_RUN_ID = "pfr_legal_brand_event";
const BRAND_VIDEO_ASSET_ID = "ast_legal_brand_event_video";
const BRAND_VIDEO_APPROVAL_ID = "apv_3f9b9c9b72";
const BRAND_VIDEO_FILENAME = "brand_event_video.mp4";

const PRODUCT_BANNER_RUN_ID = "pfr_legal_product_banner";
const PRODUCT_BANNER_ASSET_ID = "ast_legal_product_launch_banner";
const PRODUCT_BANNER_APPROVAL_ID = "apv_1c4eea83";
const PRODUCT_BANNER_FILENAME = "product_launch_banner.jpg";
const PRODUCT_BANNER_ATTESTATION_ID = "att_7f2eec91";

const HARD_BLOCK_RUN_ID = "pfr_legal_summer_campaign";
const HARD_BLOCK_ASSET_ID = "ast_legal_summer_campaign_hero";
const HARD_BLOCK_APPROVAL_ID = "apv_9a2eef41";
const HARD_BLOCK_FILENAME = "summer_campaign_hero.mp4";

const brandVideoStateA: PreflightStatusResponse = {
  preflight_run_id: BRAND_VIDEO_RUN_ID,
  asset_id: BRAND_VIDEO_ASSET_ID,
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
    evaluated_at: "2026-04-18T09:18:34Z",
  },
  obligations: [
    {
      obligation_id: "obl_legal_disc",
      type: "DISCLOSURE_REQUIRED",
      severity: "MANDATORY",
      policy_reference: "EU AI Act Article 50(1)",
      explanation:
        "Asset detected as AI-generated (score 0.87). Reviewer has challenged the detection — Legal must resolve.",
      spec_id: MOCK_LEGAL_DISCLOSURE_SPEC_ID,
    },
  ],
  engine_statuses: {
    disclosure: "DISCLOSURE_CHALLENGE_PENDING",
    provenance: "PROVENANCE_EMBED_FAILED",
    brand_suitability: "BRAND_SUITABILITY_BLOCKED",
  },
  detection_scores: {
    synthetic: {
      ai_generated_score: 0.87,
      deepfake_score: 0.62,
      confidence_band: "BLOCK_BAND",
      source_detectors: ["SIGHTENGINE"],
      evaluation_status: "COMPLETE",
    },
    moderation: {
      nudity: { score: 0.02, verdict: "ALLOW" },
      alcohol: { score: 0.74, presence_level: "FEATURED", verdict: "BLOCK" },
      minors: { detected: false, confidence: 0.0, verdict: "ALLOW" },
      violence: { score: 0.61, verdict: "FLAG" },
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
      rpl_detected: false,
      rpl_identities: [],
      human_presence_detected: false,
      estimated_person_count: 0,
      evaluation_status: "COMPLETE",
    },
  },
  started_at: "2026-04-18T09:14:22Z",
  completed_at: "2026-04-18T09:18:34Z",
};

const brandVideoApprovalUnderReview: ApprovalDetail = {
  approval_id: BRAND_VIDEO_APPROVAL_ID,
  state: "UNDER_REVIEW",
  asset_id: BRAND_VIDEO_ASSET_ID,
  preflight_run_id: BRAND_VIDEO_RUN_ID,
  workspace_id: MOCK_WORKSPACE_ID,
  submitted_at: "2026-04-18T12:14:00Z",
  submitted_by: "usr_demo_reviewer",
  submitted_by_name: "J. Martin",
  policy_verdict: "ALLOW_WITH_WARNINGS",
  pack_status: "PENDING",
};

const brandVideoDisclosure: DisclosureSpec = {
  spec_id: MOCK_LEGAL_DISCLOSURE_SPEC_ID,
  asset_id: BRAND_VIDEO_ASSET_ID,
  status: "DISCLOSURE_CHALLENGE_PENDING",
  disclosure_type: "EU_AI_ACT_ART50",
  created_at: "2026-04-18T09:15:10Z",
  challenge: {
    submitted_at: "2026-04-18T19:18:34Z",
    submitted_by: "J. Martin",
    submitted_by_role: "usr_demo_reviewer",
    justification:
      "This asset was produced entirely in-house by our studio team using traditional photography equipment on 12 April 2026. The high AI score is likely attributable to heavy post-production retouching applied by our external agency. I confirm this is human-originated content and believe the detection result is incorrect.",
    declaration_confirmed: true,
    audit_trail_id: "aud_demo_0001",
  },
  updated_at: "2026-04-18T19:18:47Z",
};

const stateAFixture: LegalReviewFixture = {
  scenario_id: "under-review-state-a",
  variant: "state-a-items-pending",
  preflight_run_id: BRAND_VIDEO_RUN_ID,
  asset_id: BRAND_VIDEO_ASSET_ID,
  approval: brandVideoApprovalUnderReview,
  preflight: brandVideoStateA,
  items: [
    { id: "challenge", resolved: false },
    { id: "brand-block", resolved: false, category_key: "alcohol" },
    { id: "provenance-failure", resolved: false },
  ],
  disclosure: brandVideoDisclosure,
};

const brandVideoStateB: PreflightStatusResponse = {
  ...brandVideoStateA,
  obligations: [],
  engine_statuses: {
    disclosure: "DISCLOSURE_NOT_REQUIRED",
    provenance: "PROVENANCE_EMBED_FAILED_ACKNOWLEDGED",
    brand_suitability: "BRAND_SUITABILITY_LEGAL_APPROVED",
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
};

const stateBFixture: LegalReviewFixture = {
  scenario_id: "under-review-state-b",
  variant: "state-b-ready-to-attest",
  preflight_run_id: BRAND_VIDEO_RUN_ID,
  asset_id: BRAND_VIDEO_ASSET_ID,
  approval: brandVideoApprovalUnderReview,
  preflight: brandVideoStateB,
  items: [
    { id: "challenge", resolved: true },
    { id: "brand-block", resolved: true, category_key: "alcohol" },
    { id: "provenance-failure", resolved: true },
  ],
};

const productBannerCleanPreflight: PreflightStatusResponse = {
  preflight_run_id: PRODUCT_BANNER_RUN_ID,
  asset_id: PRODUCT_BANNER_ASSET_ID,
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
    evaluated_at: "2026-04-18T13:46:00Z",
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
  started_at: "2026-04-18T13:45:18Z",
  completed_at: "2026-04-18T13:46:00Z",
};

const productBannerApprovalUnderReview: ApprovalDetail = {
  approval_id: PRODUCT_BANNER_APPROVAL_ID,
  state: "UNDER_REVIEW",
  asset_id: PRODUCT_BANNER_ASSET_ID,
  preflight_run_id: PRODUCT_BANNER_RUN_ID,
  workspace_id: MOCK_WORKSPACE_ID,
  submitted_at: "2026-04-18T13:47:00Z",
  submitted_by: "usr_a_patel",
  submitted_by_name: "A. Patel",
  policy_verdict: "ALLOW",
  pack_status: "PENDING",
};

const cleanFixture: LegalReviewFixture = {
  scenario_id: "under-review-clean",
  variant: "clean-standard-attestation",
  preflight_run_id: PRODUCT_BANNER_RUN_ID,
  asset_id: PRODUCT_BANNER_ASSET_ID,
  approval: productBannerApprovalUnderReview,
  preflight: productBannerCleanPreflight,
  items: [],
};

const productBannerAttestation = {
  attestation_id: PRODUCT_BANNER_ATTESTATION_ID,
  approver_name: "S. Chen",
  approver_role: "Legal / Approver",
  attested_at: "2026-04-18T14:32:08Z",
};

const productBannerAttestedPreflight: PreflightStatusResponse = {
  ...productBannerCleanPreflight,
  legal_attestation: productBannerAttestation,
};

const productBannerApprovalApproved: ApprovalDetail = {
  ...productBannerApprovalUnderReview,
  state: "APPROVED",
  resolved_at: productBannerAttestation.attested_at,
  resolved_by: "usr_demo_legal",
  resolved_by_name: "S. Chen",
  attestation_id: PRODUCT_BANNER_ATTESTATION_ID,
  attestation_type: "HUMAN_GENERATED_ATTESTED",
  pack_status: "GENERATING",
};

const postAttestationFixture: LegalReviewFixture = {
  scenario_id: "post-attestation-success",
  variant: "post-attestation-success",
  preflight_run_id: PRODUCT_BANNER_RUN_ID,
  asset_id: PRODUCT_BANNER_ASSET_ID,
  approval: productBannerApprovalApproved,
  preflight: productBannerAttestedPreflight,
  items: [],
};

const hardBlockPreflight: PreflightStatusResponse = {
  preflight_run_id: HARD_BLOCK_RUN_ID,
  asset_id: HARD_BLOCK_ASSET_ID,
  workspace_id: MOCK_WORKSPACE_ID,
  status: "COMPLETE",
  verdict: "BLOCK_NON_OVERRIDABLE",
  blocking_reason: "RPL_NO_CONSENT_BLOCK",
  policy_decision_id: MOCK_POLICY_DECISION_ID,
  policy_decision: {
    policy_decision_id: MOCK_POLICY_DECISION_ID,
    verdict: "BLOCK_NON_OVERRIDABLE",
    blocking_reason: "RPL_NO_CONSENT_BLOCK",
    obligations: [],
    policy_pack_id: "eu_ai_act",
    policy_pack_version: "1.0",
    evaluated_at: "2026-04-18T09:18:00Z",
  },
  obligations: [],
  engine_statuses: {
    disclosure: "RPL_NO_CONSENT_BLOCK",
    provenance: "PROVENANCE_EMBEDDED",
    brand_suitability: "BRAND_SUITABILITY_CLEAR",
  },
  detection_scores: {
    synthetic: {
      ai_generated_score: 0.87,
      deepfake_score: 0.74,
      confidence_band: "BLOCK_BAND",
      source_detectors: ["HIVE", "SIGHTENGINE"],
      evaluation_status: "COMPLETE",
    },
    moderation: {
      nudity: { score: 0.0, verdict: "ALLOW" },
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
      rpl_detected: true,
      rpl_identities: ["Cristiano Ronaldo"],
      rpl_confidence: 0.73,
      human_presence_detected: true,
      estimated_person_count: 1,
      evaluation_status: "COMPLETE",
    },
  },
  started_at: "2026-04-17T11:55:00Z",
  completed_at: "2026-04-17T12:00:00Z",
};

const hardBlockApproval: ApprovalDetail = {
  approval_id: HARD_BLOCK_APPROVAL_ID,
  state: "UNDER_REVIEW",
  asset_id: HARD_BLOCK_ASSET_ID,
  preflight_run_id: HARD_BLOCK_RUN_ID,
  workspace_id: MOCK_WORKSPACE_ID,
  submitted_at: "2026-04-17T12:00:00Z",
  submitted_by: "usr_demo_reviewer",
  submitted_by_name: "J. Martin",
  policy_verdict: "BLOCK_NON_OVERRIDABLE",
  pack_status: "PENDING",
};

const hardBlockFixture: LegalReviewFixture = {
  scenario_id: "hard-block-escalation",
  variant: "hard-block-escalation",
  preflight_run_id: HARD_BLOCK_RUN_ID,
  asset_id: HARD_BLOCK_ASSET_ID,
  approval: hardBlockApproval,
  preflight: hardBlockPreflight,
  items: [],
};

export const legalReviewScenarios: Record<
  LegalReviewScenarioId,
  LegalReviewFixture
> = {
  "under-review-state-a": stateAFixture,
  "under-review-state-b": stateBFixture,
  "under-review-clean": cleanFixture,
  "post-attestation-success": postAttestationFixture,
  "hard-block-escalation": hardBlockFixture,
};

export function isLegalReviewScenarioId(
  value: unknown,
): value is LegalReviewScenarioId {
  return (
    value === "under-review-state-a" ||
    value === "under-review-state-b" ||
    value === "under-review-clean" ||
    value === "post-attestation-success" ||
    value === "hard-block-escalation"
  );
}

export function findLegalFixtureByRunId(
  runId: string,
): LegalReviewFixture | null {
  return (
    Object.values(legalReviewScenarios).find(
      (f) => f.preflight_run_id === runId,
    ) ?? null
  );
}

export function findLegalFixtureByApprovalId(
  approvalId: string,
): LegalReviewFixture | null {
  return (
    Object.values(legalReviewScenarios).find(
      (f) => f.approval.approval_id === approvalId,
    ) ?? null
  );
}

import type { Asset } from "@/api/schemas/asset";
import { MOCK_WORKSPACE_ID as WS } from "../../constants";

const legalAssetMap: Record<string, Asset> = {
  [BRAND_VIDEO_ASSET_ID]: {
    asset_id: BRAND_VIDEO_ASSET_ID,
    workspace_id: WS,
    file_name: BRAND_VIDEO_FILENAME,
    file_size_bytes: 84_200_000,
    mime_type: "video/mp4",
    modality: "VIDEO",
    duration_seconds: 48,
    thumbnail_url: "/placeholder.svg",
    uploaded_at: "2026-04-18T12:14:00Z",
    uploaded_by: "usr_j_martin",
    versions: [
      { version_id: "v_orig_brand", kind: "ORIGINAL", file_name: BRAND_VIDEO_FILENAME, created_at: "2026-04-18T12:14:00Z" },
      { version_id: "v_c2pa_brand", kind: "C2PA_EMBEDDED", file_name: `brand_event_video_c2pa.mp4`, embed_status: "EMBEDDED", created_at: "2026-04-18T12:14:30Z" },
    ],
  },
  [PRODUCT_BANNER_ASSET_ID]: {
    asset_id: PRODUCT_BANNER_ASSET_ID,
    workspace_id: WS,
    file_name: PRODUCT_BANNER_FILENAME,
    file_size_bytes: 1_842_112,
    mime_type: "image/jpeg",
    modality: "IMAGE",
    thumbnail_url: "/placeholder.svg",
    uploaded_at: "2026-04-18T13:47:00Z",
    uploaded_by: "usr_a_patel",
    versions: [
      { version_id: "v_orig_pb", kind: "ORIGINAL", file_name: PRODUCT_BANNER_FILENAME, created_at: "2026-04-18T13:47:00Z" },
      { version_id: "v_c2pa_pb", kind: "C2PA_EMBEDDED", file_name: "product_launch_banner_c2pa.jpg", embed_status: "EMBEDDED", created_at: "2026-04-18T13:47:30Z" },
    ],
  },
  [HARD_BLOCK_ASSET_ID]: {
    asset_id: HARD_BLOCK_ASSET_ID,
    workspace_id: WS,
    file_name: HARD_BLOCK_FILENAME,
    file_size_bytes: 84_200_000,
    mime_type: "video/mp4",
    modality: "VIDEO",
    duration_seconds: 32,
    thumbnail_url: "/placeholder.svg",
    uploaded_at: "2026-04-18T09:14:00Z",
    uploaded_by: "usr_r_nair",
    versions: [
      { version_id: "v_orig_hb", kind: "ORIGINAL", file_name: HARD_BLOCK_FILENAME, created_at: "2026-04-18T09:14:00Z" },
      { version_id: "v_c2pa_hb", kind: "C2PA_EMBEDDED", file_name: "summer_campaign_hero_c2pa.mp4", embed_status: "EMBEDDED", created_at: "2026-04-18T09:14:45Z" },
    ],
  },
};

export function findLegalAsset(assetId: string): Asset | null {
  return legalAssetMap[assetId] ?? null;
}

export function findLegalDisclosureBySpecId(
  specId: string,
): DisclosureSpec | null {
  for (const fixture of Object.values(legalReviewScenarios)) {
    if (fixture.disclosure?.spec_id === specId) return fixture.disclosure;
  }
  return null;
}
