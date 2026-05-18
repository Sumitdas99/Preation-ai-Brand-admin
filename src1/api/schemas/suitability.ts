import { z } from "zod";

export const SuitabilityCategoryVerdict = z.union([
  z.literal("BLOCKED"),
  z.literal("FLAGGED"),
  z.literal("ALLOWED"),
]);
export type SuitabilityCategoryVerdict = z.infer<
  typeof SuitabilityCategoryVerdict
>;

export const SuitabilityFrameVerdict = z.union([
  z.literal("BLOCKED"),
  z.literal("FLAGGED"),
  z.literal("ALLOWED"),
  z.string(),
]);
export type SuitabilityFrameVerdict = z.infer<typeof SuitabilityFrameVerdict>;

export const ThresholdSource = z.union([
  z.literal("SYSTEM_DEFAULT"),
  z.literal("GEO_PRESET"),
  z.literal("WORKSPACE_OVERRIDE"),
]);
export type ThresholdSource = z.infer<typeof ThresholdSource>;

export const SuitabilityOverallStatus = z.union([
  z.literal("BRAND_SUITABILITY_PENDING"),
  z.literal("BRAND_SUITABILITY_CLEAR"),
  z.literal("BRAND_SUITABILITY_FLAGGED_REVIEWED"),
  z.literal("BRAND_SUITABILITY_BLOCKED"),
  z.literal("BRAND_SUITABILITY_ASSET_WITHDRAWN"),
  z.string(),
]);
export type SuitabilityOverallStatus = z.infer<
  typeof SuitabilityOverallStatus
>;

export const SuitabilityModality = z.union([
  z.literal("IMAGE"),
  z.literal("VIDEO"),
  z.literal("AUDIO"),
  z.string(),
]);
export type SuitabilityModality = z.infer<typeof SuitabilityModality>;

export const AppliedThreshold = z
  .object({
    source: ThresholdSource,
    preset_id: z.string().optional(),
    workspace_label: z.string().optional(),
    advisory_only: z.boolean().optional(),
  })
  .passthrough();
export type AppliedThreshold = z.infer<typeof AppliedThreshold>;

export const FrameContribution = z
  .object({
    frame_index: z.number().int().nonnegative().optional(),
    timecode_ms: z.number().int().nonnegative(),
    timecode_label: z.string(),
    score: z.number().min(0).max(1),
    verdict: SuitabilityFrameVerdict,
    sub_field: z.string().optional(),
    sub_field_label: z.string().optional(),
    is_peak: z.boolean().optional(),
    thumbnail_url: z.string().optional(),
  })
  .passthrough();
export type FrameContribution = z.infer<typeof FrameContribution>;

export const CategorySubField = z
  .object({
    key: z.string(),
    label: z.string(),
    score: z.number().min(0).max(1),
    flag_threshold: z.number().min(0).max(1),
    block_threshold: z.number().min(0).max(1).optional(),
    verdict: SuitabilityCategoryVerdict,
  })
  .passthrough();
export type CategorySubField = z.infer<typeof CategorySubField>;

export const FlaggedFrameSample = z
  .object({
    timecode_ms: z.number().int().nonnegative(),
    timecode_label: z.string(),
    thumbnail_url: z.string().optional(),
  })
  .passthrough();
export type FlaggedFrameSample = z.infer<typeof FlaggedFrameSample>;

export const SuitabilityCategoryResult = z
  .object({
    category_key: z.string(),
    category_label: z.string(),

    verdict: SuitabilityCategoryVerdict,
    score: z.number().min(0).max(1),
    flag_threshold: z.number().min(0).max(1),
    block_threshold: z.number().min(0).max(1).optional(),
    applied_threshold: AppliedThreshold,

    rule_id: z.string(),
    policy_pack_id: z.string().optional(),
    policy_pack_version: z.string().optional(),

    score_source_path: z.string().optional(),

    peak_frame_ms: z.number().int().nonnegative().optional(),
    peak_frame_thumbnail_url: z.string().optional(),

    flagged_frames: z.array(FlaggedFrameSample).default([]),

    frame_contributions: z.array(FrameContribution).default([]),

    sub_fields: z.array(CategorySubField).default([]),

    routing_message: z.string().optional(),

    evidence_pack_section_ref: z.string().optional(),
  })
  .passthrough();
export type SuitabilityCategoryResult = z.infer<
  typeof SuitabilityCategoryResult
>;

export const SuitabilityCounts = z
  .object({
    blocked: z.number().int().nonnegative(),
    flagged: z.number().int().nonnegative(),
    allowed: z.number().int().nonnegative(),
  })
  .passthrough();
export type SuitabilityCounts = z.infer<typeof SuitabilityCounts>;

export const AllowedSummary = z
  .object({
    categories: z.array(z.string()).default([]),
    note: z.string().optional(),
  })
  .passthrough();
export type AllowedSummary = z.infer<typeof AllowedSummary>;

export const FlaggedAcceptanceRecord = z
  .object({
    accepted_at: z.string(),
    accepted_by: z.string(),
    accepted_by_role: z.string().optional(),
    notes: z.string().optional(),
    declaration_confirmed: z.literal(true),
    audit_trail_id: z.string().optional(),
  })
  .passthrough();
export type FlaggedAcceptanceRecord = z.infer<typeof FlaggedAcceptanceRecord>;

export const WithdrawalRecord = z
  .object({
    withdrawn_at: z.string(),
    withdrawn_by: z.string(),
    withdrawn_by_role: z.string().optional(),
    reason: z.string().optional(),
    audit_trail_id: z.string().optional(),
  })
  .passthrough();
export type WithdrawalRecord = z.infer<typeof WithdrawalRecord>;

export const SuitabilityResults = z
  .object({
    preflight_run_id: z.string(),
    asset_id: z.string(),
    asset_filename: z.string().optional(),
    modality: SuitabilityModality.optional(),
    asset_duration_ms: z.number().int().nonnegative().optional(),

    geo_context: z.array(z.string()).default([]),
    active_geo_preset: z.string().optional(),
    workspace_label: z.string().optional(),

    policy_pack_id: z.string().optional(),
    policy_pack_version: z.string().optional(),
    evaluated_at: z.string().optional(),

    status: SuitabilityOverallStatus,
    routed_to_legal: z.boolean().default(false),

    counts: SuitabilityCounts,
    category_results: z.array(SuitabilityCategoryResult).default([]),
    allowed_summary: AllowedSummary.optional(),

    acceptance: FlaggedAcceptanceRecord.optional(),
    withdrawal: WithdrawalRecord.optional(),

    created_at: z.string().optional(),
    updated_at: z.string().optional(),
  })
  .passthrough();
export type SuitabilityResults = z.infer<typeof SuitabilityResults>;

export const AcceptFlaggedRequest = z.object({
  declaration_confirmed: z.literal(true),
  notes: z.string().optional(),
});
export type AcceptFlaggedRequest = z.infer<typeof AcceptFlaggedRequest>;

export const AcceptFlaggedResponse = SuitabilityResults;
export type AcceptFlaggedResponse = z.infer<typeof AcceptFlaggedResponse>;

export const WithdrawRequest = z.object({
  reason: z.string().optional(),
});
export type WithdrawRequest = z.infer<typeof WithdrawRequest>;

export const WithdrawResponse = SuitabilityResults;
export type WithdrawResponse = z.infer<typeof WithdrawResponse>;
