import { z } from "zod";

export const GeoPresetId = z.union([
  z.literal("EU_DEFAULT"),
  z.literal("DE_STRICT"),
  z.literal("FR_STRICT"),
  z.literal("IT_STANDARD"),
  z.literal("ES_STANDARD"),
]);
export type GeoPresetId = z.infer<typeof GeoPresetId>;

export const WorkspaceRole = z.union([
  z.literal("Brand Admin"),
  z.literal("Reviewer"),
  z.literal("Contributor"),
  z.literal("Legal"),
  z.string(),
]);
export type WorkspaceRole = z.infer<typeof WorkspaceRole>;

export const ThresholdKind = z.union([
  z.literal("synthetic_block"),
  z.literal("brand_block"),
  z.literal("system_locked_block"),
]);
export type ThresholdKind = z.infer<typeof ThresholdKind>;

export const ThresholdOverride = z
  .object({
    category_key: z.string(),
    value: z.number().min(0).max(1),
  })
  .passthrough();
export type ThresholdOverride = z.infer<typeof ThresholdOverride>;

export const ThresholdRow = z
  .object({
    category_key: z.string(),
    label: z.string(),
    description: z.string().optional(),
    kind: ThresholdKind,
    api_field: z.string(),
    system_default: z.number().min(0).max(1).optional(),
    geo_preset_baseline: z.number().min(0).max(1).optional(),
    workspace_override: z.number().min(0).max(1).nullable().optional(),
    locked: z.boolean().default(false),
    can_only_be_lowered: z.boolean().default(true),
    regulatory_note: z.string().optional(),
    badge: z.string().optional(),
    display_as: z.union([z.literal("numeric"), z.literal("boolean")]).optional(),
  })
  .passthrough();
export type ThresholdRow = z.infer<typeof ThresholdRow>;

export const WorkspaceSettings = z
  .object({
    workspace_id: z.string(),
    workspace_name: z.string(),
    viewer_role: WorkspaceRole,
    geo_preset: GeoPresetId,
    provenance_embed_on_human_generated: z.boolean().optional(),
    threshold_rows: z.array(ThresholdRow).default([]),
    updated_at: z.string().optional(),
  })
  .passthrough();
export type WorkspaceSettings = z.infer<typeof WorkspaceSettings>;

export const PolicyPreset = z
  .object({
    preset_id: GeoPresetId,
    label: z.string(),
    description: z.string(),
    threshold_baselines: z.record(z.string(), z.number().min(0).max(1)),
  })
  .passthrough();
export type PolicyPreset = z.infer<typeof PolicyPreset>;

export const PolicyPresetsResponse = z
  .object({
    items: z.array(PolicyPreset),
  })
  .passthrough();
export type PolicyPresetsResponse = z.infer<typeof PolicyPresetsResponse>;

export const PatchWorkspaceSettingsRequest = z
  .object({
    geo_preset: GeoPresetId.optional(),
    provenance_embed_on_human_generated: z.boolean().optional(),
    threshold_overrides: z.array(ThresholdOverride).optional(),
  })
  .strict();
export type PatchWorkspaceSettingsRequest = z.infer<
  typeof PatchWorkspaceSettingsRequest
>;

export const ProvenanceSummary = z
  .object({
    workspace_id: z.string(),
    window_label: z.string(),
    assets_with_c2pa_embedded_percent: z.number().min(0).max(100),
    embedding_failures_count: z.number().int().nonnegative(),
    evidence_packs_with_provenance_record_percent: z.number().min(0).max(100),
    updated_at: z.string().optional(),
  })
  .passthrough();
export type ProvenanceSummary = z.infer<typeof ProvenanceSummary>;
