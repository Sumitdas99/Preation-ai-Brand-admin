import { z } from "zod";

export const DisclosureStatus = z.union([
  z.literal("DISCLOSURE_NOT_REQUIRED"),
  z.literal("DISCLOSURE_REQUIRED"),
  z.literal("DISCLOSURE_IN_PROGRESS"),
  z.literal("DISCLOSURE_SPEC_LOCKED"),
  z.literal("DISCLOSURE_CHALLENGE_PENDING"),
  z.literal("DISCLOSURE_PROOF_UPLOADED"),
  z.literal("RPL_CONSENT_ATTACHED"),
  z.literal("HUMAN_PRESENCE_DECLARED"),
  z.string(),
]);
export type DisclosureStatus = z.infer<typeof DisclosureStatus>;

export const DisclosureTriggerType = z.union([
  z.literal("TRIGGER_AI_ORIGIN"),
  z.literal("TRIGGER_SPONSORED_CONTENT"),
  z.literal("TRIGGER_RPL_CONSENT_REQUIRED"),
  z.literal("TRIGGER_RPL_DEEPFAKE"),
  z.string(),
]);
export type DisclosureTriggerType = z.infer<typeof DisclosureTriggerType>;

export const DisclosureSeverity = z.union([
  z.literal("MANDATORY"),
  z.literal("ADVISORY"),
]);
export type DisclosureSeverity = z.infer<typeof DisclosureSeverity>;

export const RiskIndicator = z.union([
  z.literal("LOW"),
  z.literal("MEDIUM"),
  z.literal("HIGH"),
  z.string(),
]);
export type RiskIndicator = z.infer<typeof RiskIndicator>;

export const DisclosurePlacementType = z.union([
  z.literal("ON_ASSET"),
  z.literal("CAPTION_ONLY"),
  z.literal("BOTH"),
  z.literal("EXTERNAL_IMPLEMENTATION"),
]);
export type DisclosurePlacementType = z.infer<typeof DisclosurePlacementType>;

export const DisclosureScope = z.union([
  z.literal("FULL"),
  z.literal("PARTIAL"),
]);
export type DisclosureScope = z.infer<typeof DisclosureScope>;

export const DisclosureModality = z.union([
  z.literal("IMAGE"),
  z.literal("VIDEO"),
  z.literal("AUDIO"),
  z.string(),
]);
export type DisclosureModality = z.infer<typeof DisclosureModality>;

export const PlacementLocation = z.union([
  z.literal("BOTTOM_LEFT"),
  z.literal("BOTTOM_RIGHT"),
  z.literal("TOP_LEFT"),
  z.literal("TOP_RIGHT"),
  z.literal("CENTER_BOTTOM"),
  z.string(),
]);
export type PlacementLocation = z.infer<typeof PlacementLocation>;

export const DetectionBand = z.union([
  z.literal("BELOW_THRESHOLD"),
  z.literal("FLAG_BAND"),
  z.literal("BLOCK_BAND"),
  z.literal("HIGH_CONFIDENCE"),
  z.literal("MEDIUM_CONFIDENCE"),
  z.literal("LOW_CONFIDENCE"),
  z.string(),
]);
export type DetectionBand = z.infer<typeof DetectionBand>;

export const DetectionSummaryRow = z
  .object({
    key: z.string(),
    label: z.string(),
    value: z.string().optional(),
    score: z.number().optional(),
    band: DetectionBand.optional(),
    note: z.string().optional(),
  })
  .passthrough();
export type DetectionSummaryRow = z.infer<typeof DetectionSummaryRow>;

export const DisclosureRequirement = z
  .object({
    trigger_type: DisclosureTriggerType,
    disclosure_level: DisclosureSeverity,
    policy_basis: z.string(),
    policy_reference_url: z.string().optional(),
    geo_context: z.array(z.string()).default([]),
    channel_platform: z.array(z.string()).default([]),
    risk_indicator: RiskIndicator,
    modality: DisclosureModality,
    detection_summary: z.array(DetectionSummaryRow).default([]),
  })
  .passthrough();
export type DisclosureRequirement = z.infer<typeof DisclosureRequirement>;

export const DisclosureTemplate = z
  .object({
    template_id: z.string(),
    trigger_type: DisclosureTriggerType,
    modality: DisclosureModality,
    scope: DisclosureScope,
    language: z.string(),
    text: z.string(),
    key: z.string().optional(),
    label: z.string().optional(),
    source: z.string().optional(),
  })
  .passthrough();
export type DisclosureTemplate = z.infer<typeof DisclosureTemplate>;

export const ValidationCheckStatus = z.union([
  z.literal("PASS"),
  z.literal("PENDING"),
  z.literal("FAIL"),
  z.literal("NOT_APPLICABLE"),
]);
export type ValidationCheckStatus = z.infer<typeof ValidationCheckStatus>;

export const ValidationCheckId = z.union([
  z.literal("DISCLOSURE_TEXT_PRESENT"),
  z.literal("PLACEMENT_TYPE_SELECTED"),
  z.literal("REQUIRED_FIELDS_COMPLETE"),
  z.literal("TIME_RANGE_VALID"),
  z.literal("CAPTION_FIRST_LINE_CONFIRMED"),
  z.literal("EXTERNAL_ACKNOWLEDGED"),
  z.string(),
]);
export type ValidationCheckId = z.infer<typeof ValidationCheckId>;

export const ValidationCheck = z
  .object({
    id: ValidationCheckId,
    label: z.string(),
    status: ValidationCheckStatus,
    detail: z.string().optional(),
    spec_reference: z.string().optional(),
  })
  .passthrough();
export type ValidationCheck = z.infer<typeof ValidationCheck>;

export const DisclosureFormState = z
  .object({
    final_text: z.string().default(""),
    language: z.string().default("en"),
    template_id: z.string().optional(),
    placement_type: DisclosurePlacementType.optional(),
    location: PlacementLocation.optional(),
    scope: DisclosureScope.optional(),
    full_duration_confirmed: z.boolean().default(false),
    start_ms: z.number().int().nonnegative().optional(),
    end_ms: z.number().int().nonnegative().optional(),
    caption_text: z.string().optional(),
    caption_first_line_confirmed: z.boolean().optional(),
    external_justification: z.string().optional(),
    external_acknowledged: z.boolean().optional(),
  })
  .passthrough();
export type DisclosureFormState = z.infer<typeof DisclosureFormState>;

export const DisclosureChallenge = z
  .object({
    submitted_at: z.string(),
    submitted_by: z.string(),
    submitted_by_role: z.string().optional(),
    justification: z.string(),
    declaration_confirmed: z.boolean(),
    audit_trail_id: z.string().optional(),
  })
  .passthrough();
export type DisclosureChallenge = z.infer<typeof DisclosureChallenge>;

export const DisclosureSpec = z
  .object({
    spec_id: z.string(),
    asset_id: z.string(),
    status: DisclosureStatus,
    disclosure_type: z.string().optional(),
    requirement: DisclosureRequirement.optional(),
    template: DisclosureTemplate.optional(),
    form: DisclosureFormState.optional(),
    validation_checks: z.array(ValidationCheck).default([]),
    asset_duration_ms: z.number().int().nonnegative().optional(),
    locked_at: z.string().optional(),
    locked_hash: z.string().optional(),
    challenge: DisclosureChallenge.optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
  })
  .passthrough();
export type DisclosureSpec = z.infer<typeof DisclosureSpec>;

export const UpdateDisclosureSpecRequest = z
  .object({
    final_text: z.string().optional(),
    language: z.string().optional(),
    template_id: z.string().optional(),
    placement_type: DisclosurePlacementType.optional(),
    location: PlacementLocation.optional(),
    scope: DisclosureScope.optional(),
    full_duration_confirmed: z.boolean().optional(),
    start_ms: z.number().int().nonnegative().optional(),
    end_ms: z.number().int().nonnegative().optional(),
    caption_text: z.string().optional(),
    caption_first_line_confirmed: z.boolean().optional(),
    external_justification: z.string().optional(),
    external_acknowledged: z.boolean().optional(),
  })
  .passthrough();
export type UpdateDisclosureSpecRequest = z.infer<
  typeof UpdateDisclosureSpecRequest
>;

export const UpdateDisclosureSpecResponse = DisclosureSpec;
export type UpdateDisclosureSpecResponse = z.infer<
  typeof UpdateDisclosureSpecResponse
>;

export const LockDisclosureRequest = z.object({}).passthrough();
export type LockDisclosureRequest = z.infer<typeof LockDisclosureRequest>;

export const LockDisclosureResponse = DisclosureSpec;
export type LockDisclosureResponse = z.infer<typeof LockDisclosureResponse>;

export const ListDisclosureTemplatesResponse = z
  .object({
    items: z.array(DisclosureTemplate).default([]),
  })
  .passthrough();
export type ListDisclosureTemplatesResponse = z.infer<
  typeof ListDisclosureTemplatesResponse
>;

export interface DisclosureTemplateQuery {
  trigger?: DisclosureTriggerType;
  modality?: DisclosureModality;
  scope?: DisclosureScope;
  channel?: string;
  geo?: string;
  lang?: string;
}

export const DisclosureChallengeRequest = z.object({
  justification: z.string().min(50),
  declaration_confirmed: z.literal(true),
});
export type DisclosureChallengeRequest = z.infer<
  typeof DisclosureChallengeRequest
>;

export const DisclosureChallengeResponse = DisclosureSpec;
export type DisclosureChallengeResponse = z.infer<
  typeof DisclosureChallengeResponse
>;

export const DisclosureAcknowledgeChallengeRequest = z.object({
  decision: z.union([z.literal("ACCEPTED"), z.literal("REJECTED")]),
  response_notes: z.string().min(1),
  typed_signature: z.string().min(1),
});
export type DisclosureAcknowledgeChallengeRequest = z.infer<
  typeof DisclosureAcknowledgeChallengeRequest
>;

export const DisclosureAcknowledgeChallengeResponse = DisclosureSpec;
export type DisclosureAcknowledgeChallengeResponse = z.infer<
  typeof DisclosureAcknowledgeChallengeResponse
>;
