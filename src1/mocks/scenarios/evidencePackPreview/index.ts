import type { EvidencePackPreview } from "@/api/schemas/evidencePackPreview";
import { MOCK_WORKSPACE_ID, MOCK_EVIDENCE_PACK_ID, MOCK_ASSET_ID, MOCK_RUN_ID } from "../../constants";

const PACK_ID = "ep_legal_brand_event_video";
const ASSET_ID = "ast_legal_brand_event_video";
const RUN_ID = "pfr_legal_brand_event";

const samplePack: EvidencePackPreview = {
  evidence_pack_id: PACK_ID,
  asset_id: ASSET_ID,
  asset_filename: "brand_event_video.mp4",
  preflight_run_id: RUN_ID,
  workspace_label: "Acme EU",
  status: "COMPLETE",
  storage: "WORM",
  storage_label: "WORM · 8 immutable sections",
  sections_count: 8,
  sections_complete: 8,
  generated_at: "2026-04-18T14:46:00Z",
  pack_sha256: "sha256:f3a8c92d4e7b1f2a8d5c6e9f0a1b2c3d",
  download_url: "/placeholder.svg",
  download_url_ttl_seconds: 15 * 60,
  download_url_expires_at: "2026-04-18T15:01:00Z",

  asset_details: {
    status: "COMPLETE",
    asset_id: ASSET_ID,
    filename: "brand_event_video.mp4",
    modality: "VIDEO",
    file_size_bytes: 17_842_112,
    file_size_label: "17.0 MB",
    sha256_original: "sha256:a3f29e1c8b4d7c6b5a4d3c2b1a09f8e7",
    submitted_at: "2026-04-18T12:14:00Z",
    workspace_label: "Acme EU",
    geo_context: "EU · DE",
  },

  detection_results: {
    status: "COMPLETE",
    evaluated_at: "2026-04-18T09:15:00Z",
    source_summary: "SightEngine v2.1",
    rows: [
      {
        detector_label: "AI-generated",
        score: 0.87,
        threshold: 0.80,
        threshold_label: "0.80 (block)",
        verdict: "BLOCK_BAND",
        verdict_label: "BLOCK BAND",
        source: "SightEngine",
      },
      {
        detector_label: "Human presence",
        score: null,
        threshold: null,
        verdict: "NOT_DETECTED",
        verdict_label: "NOT DETECTED",
        source: "SightEngine",
      },
      {
        detector_label: "RPL / celebrity",
        score: null,
        threshold: null,
        verdict: "NOT_DETECTED",
        verdict_label: "NOT DETECTED",
        source: "SightEngine",
      },
      {
        detector_label: "Brand suitability — alcohol",
        score: 0.74,
        threshold: 0.60,
        threshold_label: "0.60 (DE_STRICT block)",
        verdict: "BLOCKED",
        verdict_label: "BLOCKED",
        source: "SightEngine",
      },
      {
        detector_label: "Brand suitability — violence",
        score: 0.61,
        threshold: 0.50,
        threshold_label: "0.50 flag / 0.80 block",
        verdict: "FLAGGED",
        verdict_label: "FLAGGED",
        source: "SightEngine",
      },
      {
        detector_label: "Brand suitability — all other",
        score: null,
        threshold: null,
        verdict: "ALL_CLEAR",
        verdict_label: "ALL CLEAR",
        source: "SightEngine",
      },
    ],
  },

  policy_engine_record: {
    status: "COMPLETE",
    final_verdict: "ALLOW_WITH_WARNINGS",
    final_verdict_label: "Allow with warnings",
    policy_pack_id: "eu_ai_act_pack",
    policy_pack_version: "1.0",
    evaluated_at: "2026-04-18T09:15:00Z",
    preflight_run_id: RUN_ID,
    obligations_triggered: [],
    obligations_summary: undefined,
  },

  provenance_record: {
    status: "EMBED_FAILED",
    c2pa_embed_status: "PROVENANCE_EMBED_FAILED",
    embed_status_label: "PROVENANCE_EMBED_FAILED",
    failure_reason: "System error, auto-proceeded per spec",
  },

  brand_suitability_record: {
    status: "LEGAL_APPROVED",
    evaluated_at: "2026-04-18T09:18:34Z",
    other_categories_count: 0,
    categories: [
      {
        category_key: "alcohol",
        category_label: "Alcohol",
        score: 0.74,
        verdict: "BLOCKED",
        resolution: "BRAND_SUITABILITY_LEGAL_APPROVED · S. Chen · 18 Apr 14:31",
      },
      {
        category_key: "violence",
        category_label: "Violence",
        score: 0.61,
        verdict: "FLAGGED",
        resolution: "Accepted by Reviewer J. Martin · 18 Apr 11:44",
      },
      {
        category_key: "all_other",
        category_label: "All other categories (12)",
        score: null,
        verdict: "ALL_CLEAR",
        resolution: "Below threshold · no action required",
      },
    ],
  },

  disclosure_record: {
    status: "DISCLOSURE_PROOF_UPLOADED",
    trigger: "TRIGGER_AI_ORIGIN",
    placement: "ON_ASSET · FULL scope · Bottom left",
    disclosure_text: "This video contains AI-generated content.",
    disclosure_text_locked: true,
    proof_type: "FINAL_ASSET",
    proof_filename: "brand_event_video_with_disclosure.mp4",
    proof_hash: "sha256:a839f1c8b4d7c6b5a4d3c2b1a09f8e7d",
    proof_uploaded_at: "2026-04-18T14:46:00Z",
  },

  consent_record: {
    status: "NOT_APPLICABLE",
    applicable: false,
  },

  attestation_page: {
    status: "LEGAL_APPROVED",
    attested_by: "S. Chen",
    attested_by_role: "Legal / Approver",
    attested_at: "2026-04-18T14:31:47Z",
    approval_id: "apv_3f9_b72",
    attestation_id: "att_7f2_c91",
    typed_signature: "Sanya Chen",
    declaration_text:
      "I confirm I have reviewed all compliance results for this asset and attest that it meets the applicable regulatory requirements for publication. This attestation is stored permanently in the WORM audit trail.",
    is_force_pass: false,
  },
};

export const evidencePackPreviewFixtures: Record<string, EvidencePackPreview> =
  {
    [PACK_ID]: samplePack,
    ep_legal_product_banner: {
      ...samplePack,
      evidence_pack_id: "ep_legal_product_banner",
      asset_id: "ast_legal_product_launch_banner",
      asset_filename: "product_launch_banner.jpg",
      asset_details: {
        ...samplePack.asset_details,
        asset_id: "ast_legal_product_launch_banner",
        filename: "product_launch_banner.jpg",
        modality: "IMAGE",
        file_size_bytes: 1_842_112,
        file_size_label: "1.8 MB",
      },
    },
    [MOCK_EVIDENCE_PACK_ID]: {
      ...samplePack,
      evidence_pack_id: MOCK_EVIDENCE_PACK_ID,
      asset_id: MOCK_ASSET_ID,
      asset_filename: "summer_campaign_hero.mp4",
      preflight_run_id: MOCK_RUN_ID,
      asset_details: {
        ...samplePack.asset_details,
        asset_id: MOCK_ASSET_ID,
        filename: "summer_campaign_hero.mp4",
      },
    },
    ep_legal_q2_brand_story: {
      ...samplePack,
      evidence_pack_id: "ep_legal_q2_brand_story",
      asset_id: "ast_legal_q2_brand_story",
      asset_filename: "q2_brand_story.mp4",
      asset_details: {
        ...samplePack.asset_details,
        asset_id: "ast_legal_q2_brand_story",
        filename: "q2_brand_story.mp4",
        modality: "VIDEO",
      },
      attestation_page: {
        ...samplePack.attestation_page,
        approval_id: "apv_7a1bdc29",
        attestation_id: "att_q2bs_force_pass",
        is_force_pass: true,
        override_commentary:
          "Provenance pipeline failure acknowledged. Asset is human-generated and routed via known studio. Risk accepted to meet campaign deadline.",
      },
    },
  };

export function getEvidencePackPreviewFixture(
  packId: string,
): EvidencePackPreview | undefined {
  return evidencePackPreviewFixtures[packId];
}

export const DEFAULT_EVIDENCE_PACK_PREVIEW_ID = PACK_ID;
export { MOCK_WORKSPACE_ID };
