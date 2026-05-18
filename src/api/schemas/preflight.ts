import { z } from "zod";
import { Obligation } from "./obligations";
import { DetectionScores } from "./detection";
import { EvidencePack } from "./evidence";
import {
  BlockingReason,
  PolicyDecision,
  Verdict,
} from "./policy";
import { LegalAttestation } from "./proof";

export const PreflightTerminalState = z.union([
  z.literal("PUBLISH_CLEARED"),
  z.string(),
]);
export type PreflightTerminalState = z.infer<typeof PreflightTerminalState>;

export const PreflightPipelineStatus = z.union([
  z.literal("IN_PROGRESS"),
  z.literal("COMPLETE"),
  z.literal("FAILED"),
]);
export type PreflightPipelineStatus = z.infer<
  typeof PreflightPipelineStatus
>;

export const DisclosureEngineStatus = z.union([
  z.literal("DISCLOSURE_NOT_REQUIRED"),
  z.literal("DISCLOSURE_REQUIRED"),
  z.literal("DISCLOSURE_SPEC_LOCKED"),
  z.literal("DISCLOSURE_CHALLENGE_PENDING"),
  z.literal("APPROVED_PENDING_PROOF"),
  z.literal("DISCLOSURE_PROOF_UPLOADED"),
  z.literal("RPL_CONSENT_ATTACHED"),
  z.literal("HUMAN_PRESENCE_DECLARED"),
  z.string(),
]);

export const ProvenanceEngineStatus = z.union([
  z.literal("PROVENANCE_PENDING"),
  z.literal("PROVENANCE_EMBEDDING"),
  z.literal("PROVENANCE_EMBEDDED"),
  z.literal("PROVENANCE_EMBED_FAILED"),
  z.literal("MANIFEST_TAMPERED_FLAGGED"),
  z.string(),
]);

export const BrandSuitabilityEngineStatus = z.union([
  z.literal("BRAND_SUITABILITY_PENDING"),
  z.literal("BRAND_SUITABILITY_CLEAR"),
  z.literal("BRAND_SUITABILITY_FLAGGED_REVIEWED"),
  z.literal("BRAND_SUITABILITY_BLOCKED"),
  z.literal("BRAND_SUITABILITY_ASSET_WITHDRAWN"),
  z.string(),
]);

export const EngineStatuses = z
  .object({
    disclosure: DisclosureEngineStatus,
    provenance: ProvenanceEngineStatus,
    brand_suitability: BrandSuitabilityEngineStatus,
  })
  .passthrough();
export type EngineStatuses = z.infer<typeof EngineStatuses>;

export const PerModalityProgress = z
  .object({
    image: evaluationProgress(),
    video_frames: evaluationProgress(),
    audio: evaluationProgress(),
  })
  .partial()
  .passthrough();

function evaluationProgress() {
  return z
    .object({
      evaluation_status: z.union([
        z.literal("COMPLETE"),
        z.literal("IN_PROGRESS"),
        z.literal("PENDING"),
        z.literal("NOT_APPLICABLE"),
        z.literal("EVALUATION_FAILED"),
      ]),
      note: z.string().optional(),
    })
    .passthrough();
}

export const PreflightStatusResponse = z
  .object({
    preflight_run_id: z.string(),
    asset_id: z.string(),
    workspace_id: z.string().optional(),
    status: PreflightPipelineStatus,
    verdict: Verdict.optional(),
    blocking_reason: BlockingReason.optional(),
    policy_decision_id: z.string().optional(),
    policy_decision: PolicyDecision.optional(),
    obligations: z.array(Obligation).default([]),
    engine_statuses: EngineStatuses.optional(),
    detection_scores: DetectionScores.optional(),
    per_modality_progress: PerModalityProgress.optional(),
    terminal_state: PreflightTerminalState.optional(),
    proof_spec_id: z.string().optional(),
    legal_attestation: LegalAttestation.optional(),
    evidence_pack: EvidencePack.optional(),
    started_at: z.string().optional(),
    completed_at: z.string().optional(),
    incident_id: z.string().optional(),
  })
  .passthrough();
export type PreflightStatusResponse = z.infer<
  typeof PreflightStatusResponse
>;

export const PreflightEvaluateRequest = z.object({
  asset_id: z.string(),
  workspace_id: z.string(),
  policy_pack_id: z.string().optional(),
});
export type PreflightEvaluateRequest = z.infer<
  typeof PreflightEvaluateRequest
>;

export const PreflightEvaluateResponse = PreflightStatusResponse;
export type PreflightEvaluateResponse = z.infer<
  typeof PreflightEvaluateResponse
>;

export const PreflightRerunRequest = z
  .object({
    reason: z.string().optional(),
  })
  .partial();
export type PreflightRerunRequest = z.infer<typeof PreflightRerunRequest>;

export const PreflightRerunResponse = PreflightStatusResponse;
export type PreflightRerunResponse = z.infer<
  typeof PreflightRerunResponse
>;
