import type {
  PolicyPreset,
  ProvenanceSummary,
  WorkspaceSettings,
} from "@/api/schemas/policyThresholds";
import { MOCK_WORKSPACE_ID } from "@/mocks/constants";

export type PolicyThresholdsScenarioId =
  | "default"
  | "de-strict-active"
  | "provenance-disabled"
  | "reviewer-forbidden";

export const DEFAULT_POLICY_THRESHOLDS_SCENARIO: PolicyThresholdsScenarioId =
  "default";

export function isPolicyThresholdsScenarioId(
  value: string | null,
): value is PolicyThresholdsScenarioId {
  return (
    value === "default" ||
    value === "de-strict-active" ||
    value === "provenance-disabled" ||
    value === "reviewer-forbidden"
  );
}

const commonThresholdRows: WorkspaceSettings["threshold_rows"] = [
  {
    category_key: "ai_generated_block",
    label: "AI-generated block threshold",
    description:
      "Content at or above this score is treated as AI-generated and requires the appropriate disclosure. This limit can only be made stricter.",
    kind: "synthetic_block",
    api_field: "detection_scores.synthetic.ai_generated_score",
    system_default: 0.8,
    geo_preset_baseline: 0.8,
    workspace_override: null,
    locked: false,
    can_only_be_lowered: true,
    badge: "Disclosure required",
    regulatory_note: "EU AI Act Article 50(1).",
    display_as: "numeric",
  },
  {
    category_key: "nudity_sexual_display_block",
    label: "Nudity sexual/display block",
    description:
      "Blocks explicit nudity and sexual display when confidence reaches the selected limit.",
    kind: "brand_block",
    api_field: "detection_scores.moderation.nudity.sexual_display.block_threshold",
    system_default: 0.7,
    geo_preset_baseline: 0.7,
    workspace_override: null,
    locked: false,
    can_only_be_lowered: true,
    display_as: "numeric",
  },
  {
    category_key: "nudity_erotica_block",
    label: "Nudity erotica block",
    description:
      "Blocks erotic content at a stricter default than explicit sexual content.",
    kind: "brand_block",
    api_field: "detection_scores.moderation.nudity.erotica.block_threshold",
    system_default: 0.6,
    geo_preset_baseline: 0.6,
    workspace_override: null,
    locked: false,
    can_only_be_lowered: true,
    display_as: "numeric",
  },
  {
    category_key: "violence_block",
    label: "Violence block",
    description:
      "Blocks violent content once confidence reaches the selected limit. High-risk threats are handled by system protections.",
    kind: "brand_block",
    api_field: "detection_scores.moderation.violence.block_threshold",
    system_default: 0.8,
    geo_preset_baseline: 0.8,
    workspace_override: null,
    locked: false,
    can_only_be_lowered: true,
    display_as: "numeric",
  },
  {
    category_key: "weapons_block",
    label: "Weapons block",
    description: "Blocks firearm and weapon content at the selected confidence limit.",
    kind: "brand_block",
    api_field: "detection_scores.moderation.weapon.firearm.block_threshold",
    system_default: 0.7,
    geo_preset_baseline: 0.7,
    workspace_override: null,
    locked: false,
    can_only_be_lowered: true,
    display_as: "numeric",
  },
  {
    category_key: "alcohol_block",
    label: "Alcohol block",
    description:
      "Blocks alcohol-related content using the baseline from the active geo preset.",
    kind: "brand_block",
    api_field: "detection_scores.moderation.alcohol.block_threshold",
    system_default: 0.7,
    geo_preset_baseline: 0.7,
    workspace_override: null,
    locked: false,
    can_only_be_lowered: true,
    display_as: "numeric",
  },
  {
    category_key: "drugs_block",
    label: "Drugs block",
    description: "Blocks drug-related content at the selected confidence limit.",
    kind: "brand_block",
    api_field: "detection_scores.moderation.drugs.block_threshold",
    system_default: 0.6,
    geo_preset_baseline: 0.6,
    workspace_override: null,
    locked: false,
    can_only_be_lowered: true,
    display_as: "numeric",
  },
  {
    category_key: "gore_block",
    label: "Gore block",
    description:
      "Blocks graphic injury or gore content at the selected confidence limit.",
    kind: "brand_block",
    api_field: "detection_scores.moderation.gore.block_threshold",
    system_default: 0.7,
    geo_preset_baseline: 0.7,
    workspace_override: null,
    locked: false,
    can_only_be_lowered: true,
    display_as: "numeric",
  },
  {
    category_key: "gambling_block",
    label: "Gambling block",
    description:
      "Blocks gambling-related content at the selected confidence limit.",
    kind: "brand_block",
    api_field: "detection_scores.moderation.gambling.block_threshold",
    system_default: 0.7,
    geo_preset_baseline: 0.7,
    workspace_override: null,
    locked: false,
    can_only_be_lowered: true,
    display_as: "numeric",
  },
  {
    category_key: "hate_symbols_block",
    label: "Hate symbols block",
    description:
      "This protection is managed at the system level and cannot be changed for a workspace.",
    kind: "system_locked_block",
    api_field: "detection_scores.moderation.hate_symbols.block_threshold",
    system_default: 0.3,
    geo_preset_baseline: 0.3,
    workspace_override: null,
    locked: true,
    can_only_be_lowered: false,
    regulatory_note: "System-locked protection.",
    display_as: "numeric",
  },
  {
    category_key: "minor_detected_block",
    label: "Minor detected block",
    description:
      "Blocks content when a minor is detected. This rule is read-only and does not use a confidence slider.",
    kind: "system_locked_block",
    api_field: "detection_scores.faces.minor_detected",
    workspace_override: null,
    locked: true,
    can_only_be_lowered: false,
    regulatory_note: "Read-only system protection.",
    display_as: "boolean",
  },
];

export const policyThresholdsScenarios: Record<
  PolicyThresholdsScenarioId,
  WorkspaceSettings
> = {
  default: {
    workspace_id: MOCK_WORKSPACE_ID,
    workspace_name: "Acme EU",
    viewer_role: "Brand Admin",
    geo_preset: "EU_DEFAULT",
    provenance_embed_on_human_generated: true,
    threshold_rows: commonThresholdRows,
    updated_at: "2026-05-03T00:00:00.000Z",
  },
  "de-strict-active": {
    workspace_id: MOCK_WORKSPACE_ID,
    workspace_name: "Acme EU",
    viewer_role: "Brand Admin",
    geo_preset: "DE_STRICT",
    provenance_embed_on_human_generated: true,
    threshold_rows: commonThresholdRows.map((row) =>
      row.category_key === "nudity_sexual_display_block"
        ? { ...row, geo_preset_baseline: 0.4 }
        : row,
    ),
    updated_at: "2026-05-03T00:00:00.000Z",
  },
  "provenance-disabled": {
    workspace_id: MOCK_WORKSPACE_ID,
    workspace_name: "Acme EU",
    viewer_role: "Brand Admin",
    geo_preset: "EU_DEFAULT",
    provenance_embed_on_human_generated: false,
    threshold_rows: commonThresholdRows,
    updated_at: "2026-05-03T00:00:00.000Z",
  },
  "reviewer-forbidden": {
    workspace_id: MOCK_WORKSPACE_ID,
    workspace_name: "Acme EU",
    viewer_role: "Reviewer",
    geo_preset: "EU_DEFAULT",
    provenance_embed_on_human_generated: true,
    threshold_rows: commonThresholdRows,
    updated_at: "2026-05-03T00:00:00.000Z",
  },
};

export const policyPresetItems: PolicyPreset[] = [
  {
    preset_id: "EU_DEFAULT",
    label: "EU_DEFAULT",
    description:
      "Baseline EU thresholds. Applies to all EU markets unless a country-specific preset is selected.",
    threshold_baselines: {
      alcohol_flag: 0.5,
      alcohol_block: 0.8,
      nudity_suggestive_flag: 0.45,
      gambling_flag: 0.5,
      hate_symbols_flag: 0.4,
      hate_symbols_block: 0.6,
      minor_detected_block: 0.5,
    },
  },
  {
    preset_id: "DE_STRICT",
    label: "DE_STRICT",
    description:
      "German market. Stricter alcohol, nudity and tobacco thresholds. Adds a control for detected minors.",
    threshold_baselines: {
      alcohol_flag: 0.35,
      alcohol_block: 0.6,
      nudity_suggestive_flag: 0.3,
      tobacco_flag: 0.4,
      hate_symbols_block: 0.6,
      minor_detected_block: 0.5,
    },
  },
  {
    preset_id: "FR_STRICT",
    label: "FR_STRICT",
    description:
      "French market. Stricter alcohol and gambling thresholds. Hate symbol threshold lowered.",
    threshold_baselines: {
      alcohol_flag: 0.4,
      alcohol_block: 0.7,
      gambling_flag: 0.35,
      hate_symbols_flag: 0.3,
      hate_symbols_block: 0.6,
      minor_detected_block: 0.5,
    },
  },
  {
    preset_id: "IT_STANDARD",
    label: "IT_STANDARD",
    description:
      "Italian market. Standard EU thresholds with minor adjustments to tobacco and gambling.",
    threshold_baselines: {
      tobacco_flag: 0.5,
      hate_symbols_block: 0.6,
      minor_detected_block: 0.5,
    },
  },
  {
    preset_id: "ES_STANDARD",
    label: "ES_STANDARD",
    description:
      "Spanish market. Standard EU thresholds with gambling flag threshold lowered for LOTBA compliance.",
    threshold_baselines: {
      gambling_flag: 0.4,
      hate_symbols_block: 0.6,
      minor_detected_block: 0.5,
    },
  },
];

export const provenanceSummary: ProvenanceSummary = {
  workspace_id: MOCK_WORKSPACE_ID,
  window_label: "Last 30 days",
  assets_with_c2pa_embedded_percent: 94,
  embedding_failures_count: 3,
  evidence_packs_with_provenance_record_percent: 100,
  updated_at: "2026-05-03T00:00:00.000Z",
};
