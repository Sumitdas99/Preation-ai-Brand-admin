import { z } from "zod";

export const ApprovalState = z.union([
  z.literal("PENDING_SUBMISSION"),
  z.literal("SUBMITTED_FOR_APPROVAL"),
  z.literal("PENDING_REVIEW"),
  z.literal("UNDER_REVIEW"),
  z.literal("APPROVED"),
  z.literal("APPROVED_PENDING_PROOF"),
  z.literal("REJECTED_BACK_TO_REVIEWER"),
  z.literal("REJECTED"),
  z.literal("OVERRIDE_APPROVED"),
  z.literal("FORCE_PASSED"),
  z.string(),
]);
export type ApprovalState = z.infer<typeof ApprovalState>;

export const ApprovalPriority = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.number().int().min(1).max(5),
]);
export type ApprovalPriority = z.infer<typeof ApprovalPriority>;

export const ApprovalQueueModality = z.union([
  z.literal("IMAGE"),
  z.literal("VIDEO"),
  z.literal("AUDIO"),
  z.string(),
]);
export type ApprovalQueueModality = z.infer<typeof ApprovalQueueModality>;

export const ApprovalPolicyVerdict = z.union([
  z.literal("ALLOW"),
  z.literal("ALLOW_WITH_WARNINGS"),
  z.literal("BLOCK_UNTIL_REMEDIATED"),
  z.literal("BLOCK_NON_OVERRIDABLE"),
  z.string(),
]);
export type ApprovalPolicyVerdict = z.infer<typeof ApprovalPolicyVerdict>;

export const ApprovalPackStatus = z.union([
  z.literal("PENDING"),
  z.literal("GENERATING"),
  z.literal("COMPLETE"),
  z.literal("FAILED"),
  z.literal("NOT_APPLICABLE"),
  z.string(),
]);
export type ApprovalPackStatus = z.infer<typeof ApprovalPackStatus>;

export const AttestationType = z.union([
  z.literal("NO_SYNTHETIC_MEDIA"),
  z.literal("SYNTHETIC_DISCLOSED"),
  z.literal("HUMAN_GENERATED_ATTESTED"),
]);
export type AttestationType = z.infer<typeof AttestationType>;

export const SubmitApprovalRequest = z.object({
  asset_id: z.string(),
  workspace_id: z.string(),
  preflight_run_id: z.string(),
  evidence_pack_id: z.string().optional(),
  submitted_by: z.string(),
});
export type SubmitApprovalRequest = z.infer<typeof SubmitApprovalRequest>;

export const SubmitApprovalResponse = z
  .object({
    approval_id: z.string(),
    state: ApprovalState,
    asset_id: z.string(),
    preflight_run_id: z.string(),
    evidence_pack_id: z.string().optional(),
    submitted_at: z.string().optional(),
  })
  .passthrough();
export type SubmitApprovalResponse = z.infer<typeof SubmitApprovalResponse>;

export const ApproveRequest = z.object({
  attestation_type: AttestationType,
  typed_signature: z.string().min(1),
  declaration_confirmed: z.literal(true),
  override_commentary: z.string().optional(),
  notes: z.string().optional(),
});
export type ApproveRequest = z.infer<typeof ApproveRequest>;

export const ForcePassRequest = z.object({
  commentary: z.string().min(50),
  declaration_confirmed: z.literal(true),
  typed_signature: z.string().min(1),
});
export type ForcePassRequest = z.infer<typeof ForcePassRequest>;

export const RoutingEngine = z.union([
  z.literal("DISCLOSURE"),
  z.literal("BRAND_SUITABILITY"),
  z.literal("PROVENANCE"),
  z.string(),
]);
export type RoutingEngine = z.infer<typeof RoutingEngine>;

export const RoutingAction = z.union([
  z.literal("UNLOCK_SPEC"),
  z.literal("UNLOCK"),
  z.literal("RE_EVALUATE"),
  z.string(),
]);
export type RoutingAction = z.infer<typeof RoutingAction>;

export const RoutingInstruction = z.object({
  engine: RoutingEngine,
  action: RoutingAction,
});
export type RoutingInstruction = z.infer<typeof RoutingInstruction>;

export const RejectRequest = z.object({
  rejection_notes: z.string().min(20),
  routing_instructions: z.array(RoutingInstruction).min(1),
  typed_signature: z.string().min(1),
});
export type RejectRequest = z.infer<typeof RejectRequest>;

export const ApprovalDetail = z
  .object({
    approval_id: z.string(),
    state: ApprovalState,
    asset_id: z.string(),
    preflight_run_id: z.string(),
    workspace_id: z.string().optional(),
    evidence_pack_id: z.string().optional(),
    submitted_at: z.string().optional(),
    submitted_by: z.string().optional(),
    submitted_by_name: z.string().optional(),
    resolved_at: z.string().optional(),
    resolved_by: z.string().optional(),
    resolved_by_name: z.string().optional(),
    attestation_type: AttestationType.optional(),
    attestation_id: z.string().optional(),
    commentary: z.string().optional(),
    rejection_notes: z.string().optional(),
    routing_instructions: z.array(RoutingInstruction).optional(),
    policy_verdict: ApprovalPolicyVerdict.optional(),
    pack_status: ApprovalPackStatus.optional(),
    pack_download_url: z.string().optional(),
    is_force_pass: z.boolean().optional(),
  })
  .passthrough();
export type ApprovalDetail = z.infer<typeof ApprovalDetail>;

export const ApprovalQueueItem = z
  .object({
    approval_id: z.string(),
    state: ApprovalState,
    asset_id: z.string(),
    preflight_run_id: z.string(),
    workspace_id: z.string().optional(),
    asset_filename: z.string().optional(),
    asset_name: z.string().optional(),
    modality: ApprovalQueueModality.optional(),
    thumbnail_url: z.string().optional(),
    submitted_by: z.string().optional(),
    submitted_by_name: z.string().optional(),
    submitted_at: z.string().optional(),
    age_minutes: z.number().int().nonnegative().optional(),
    priority: ApprovalPriority.optional(),
    action_summary: z.string().optional(),
    policy_verdict: ApprovalPolicyVerdict.optional(),
    resolved_at: z.string().optional(),
    resolved_by_name: z.string().optional(),
    pack_status: ApprovalPackStatus.optional(),
    pack_download_url: z.string().optional(),
    evidence_pack_id: z.string().optional(),
    is_force_pass: z.boolean().optional(),
    rejection_notes: z.string().optional(),
    rejected_engines: z.array(RoutingEngine).optional(),
  })
  .passthrough();
export type ApprovalQueueItem = z.infer<typeof ApprovalQueueItem>;

export const ApprovalQueueCounts = z
  .object({
    pending_review: z.number().int().nonnegative().optional(),
    waiting_over_8h: z.number().int().nonnegative().optional(),
    waiting_over_24h: z.number().int().nonnegative().optional(),
    reviewed_today: z.number().int().nonnegative().optional(),
  })
  .partial()
  .passthrough();
export type ApprovalQueueCounts = z.infer<typeof ApprovalQueueCounts>;

export const ApprovalQueueResponse = z
  .object({
    items: z.array(ApprovalQueueItem).default([]),
    total_count: z.number().int().nonnegative().optional(),
    counts: ApprovalQueueCounts.optional(),
  })
  .passthrough();
export type ApprovalQueueResponse = z.infer<typeof ApprovalQueueResponse>;
