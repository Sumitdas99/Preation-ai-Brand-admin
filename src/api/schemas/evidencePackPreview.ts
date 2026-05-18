import { z } from "zod";

const SectionStatus = z.union([
  z.literal("COMPLETE"),
  z.literal("PENDING"),
  z.literal("NOT_APPLICABLE"),
  z.literal("EMBED_FAILED"),
  z.literal("DISCLOSURE_PROOF_UPLOADED"),
  z.literal("LEGAL_APPROVED"),
  z.literal("APPROVED_PENDING_PROOF"),
  z.string(),
]);
export type EvidencePackSectionStatus = z.infer<typeof SectionStatus>;

export const EpAssetDetails = z
  .object({
    status: SectionStatus,
    asset_id: z.string(),
    filename: z.string(),
    modality: z.string().optional(),
    file_size_bytes: z.number().int().nonnegative().optional(),
    file_size_label: z.string().optional(),
    sha256_original: z.string().optional(),
    submitted_at: z.string().optional(),
    workspace_label: z.string().optional(),
    geo_context: z.string().optional(),
  })
  .passthrough();
export type EpAssetDetails = z.infer<typeof EpAssetDetails>;

export const EpDetectorVerdict = z.union([
  z.literal("BLOCK_BAND"),
  z.literal("FLAG_BAND"),
  z.literal("BLOCKED"),
  z.literal("FLAGGED"),
  z.literal("ALLOWED"),
  z.literal("ALLOW"),
  z.literal("NOT_DETECTED"),
  z.literal("NOT_APPLICABLE"),
  z.literal("ALL_CLEAR"),
  z.literal("BELOW_THRESHOLD"),
  z.string(),
]);
export type EpDetectorVerdict = z.infer<typeof EpDetectorVerdict>;

export const EpDetectorRow = z
  .object({
    detector_label: z.string(),
    score: z.number().nullable().optional(),
    threshold: z.number().nullable().optional(),
    threshold_label: z.string().optional(),
    verdict: EpDetectorVerdict,
    verdict_label: z.string().optional(),
    source: z.string().optional(),
    note: z.string().optional(),
  })
  .passthrough();
export type EpDetectorRow = z.infer<typeof EpDetectorRow>;

export const EpDetectionResults = z
  .object({
    status: SectionStatus,
    evaluated_at: z.string().optional(),
    source_summary: z.string().optional(),
    rows: z.array(EpDetectorRow).default([]),
  })
  .passthrough();
export type EpDetectionResults = z.infer<typeof EpDetectionResults>;

export const EpPolicyEngineRecord = z
  .object({
    status: SectionStatus,
    final_verdict: z.string(),
    final_verdict_label: z.string().optional(),
    policy_pack_id: z.string().optional(),
    policy_pack_version: z.string().optional(),
    evaluated_at: z.string().optional(),
    preflight_run_id: z.string().optional(),
    obligations_triggered: z.array(z.string()).default([]),
    obligations_summary: z.string().optional(),
  })
  .passthrough();
export type EpPolicyEngineRecord = z.infer<typeof EpPolicyEngineRecord>;

export const EpProvenanceRecord = z
  .object({
    status: SectionStatus,
    c2pa_embed_status: z.string().optional(),
    embed_status_label: z.string().optional(),
    failure_reason: z.string().optional(),
    not_applicable_rationale: z.string().optional(),
  })
  .passthrough();
export type EpProvenanceRecord = z.infer<typeof EpProvenanceRecord>;

export const EpBrandCategoryVerdict = z.union([
  z.literal("BLOCKED"),
  z.literal("FLAGGED"),
  z.literal("ALLOWED"),
  z.literal("ALL_CLEAR"),
  z.string(),
]);

export const EpBrandCategory = z
  .object({
    category_key: z.string(),
    category_label: z.string(),
    score: z.number().nullable().optional(),
    verdict: EpBrandCategoryVerdict,
    resolution: z.string().optional(),
    commentary: z.string().optional(),
    commentary_by: z.string().optional(),
    commentary_at: z.string().optional(),
  })
  .passthrough();

export const EpBrandSuitabilityRecord = z
  .object({
    status: SectionStatus,
    evaluated_at: z.string().optional(),
    categories: z.array(EpBrandCategory).default([]),
    legal_commentary: z.string().optional(),
    legal_commentary_summary: z.string().optional(),
    override_commentary: z.string().optional(),
    other_categories_count: z.number().int().nonnegative().optional(),
  })
  .passthrough();
export type EpBrandSuitabilityRecord = z.infer<typeof EpBrandSuitabilityRecord>;

export const EpDisclosureRecord = z
  .object({
    status: SectionStatus,
    trigger: z.string().optional(),
    placement: z.string().optional(),
    scope: z.string().optional(),
    disclosure_text: z.string().optional(),
    disclosure_text_locked: z.boolean().optional(),
    proof_type: z.string().optional(),
    proof_filename: z.string().optional(),
    proof_hash: z.string().optional(),
    proof_uploaded_at: z.string().optional(),
  })
  .passthrough();
export type EpDisclosureRecord = z.infer<typeof EpDisclosureRecord>;

export const EpConsentRecord = z
  .object({
    status: SectionStatus,
    applicable: z.boolean().optional(),
    rationale: z.string().optional(),
    rpl_consent_path: z.string().optional(),
    human_presence_declared: z.boolean().optional(),
  })
  .passthrough();
export type EpConsentRecord = z.infer<typeof EpConsentRecord>;

export const EpAttestationPage = z
  .object({
    status: SectionStatus,
    attested_by: z.string(),
    attested_by_role: z.string().optional(),
    attested_at: z.string(),
    approval_id: z.string(),
    attestation_id: z.string(),
    typed_signature: z.string(),
    override_commentary: z.string().optional(),
    declaration_text: z.string().optional(),
    is_force_pass: z.boolean().optional(),
  })
  .passthrough();
export type EpAttestationPage = z.infer<typeof EpAttestationPage>;

export const EvidencePackPreviewStatus = z.union([
  z.literal("COMPLETE"),
  z.literal("GENERATING"),
  z.literal("FAILED"),
  z.string(),
]);

export const EvidencePackPreview = z
  .object({
    evidence_pack_id: z.string(),
    asset_id: z.string(),
    asset_filename: z.string(),
    preflight_run_id: z.string().optional(),
    workspace_label: z.string().optional(),
    status: EvidencePackPreviewStatus,
    storage: z.string().optional(),
    storage_label: z.string().optional(),
    sections_count: z.number().int().nonnegative().optional(),
    sections_complete: z.number().int().nonnegative().optional(),
    generated_at: z.string().optional(),
    pack_sha256: z.string().optional(),
    download_url: z.string().optional(),
    download_url_expires_at: z.string().optional(),
    download_url_ttl_seconds: z.number().int().nonnegative().optional(),
    asset_details: EpAssetDetails,
    detection_results: EpDetectionResults,
    policy_engine_record: EpPolicyEngineRecord,
    provenance_record: EpProvenanceRecord,
    brand_suitability_record: EpBrandSuitabilityRecord,
    disclosure_record: EpDisclosureRecord,
    consent_record: EpConsentRecord,
    attestation_page: EpAttestationPage,
  })
  .passthrough();
export type EvidencePackPreview = z.infer<typeof EvidencePackPreview>;
