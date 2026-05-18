import { z } from "zod";
import { DisclosurePlacementType, DisclosureScope, DisclosureModality } from "./disclosure";

export const ProofMethod = z.union([
  z.literal("FINAL_ASSET"),
  z.literal("SCREENSHOT"),
]);
export type ProofMethod = z.infer<typeof ProofMethod>;

export const ProofStatus = z.union([
  z.literal("APPROVED_PENDING_PROOF"),
  z.literal("DISCLOSURE_PROOF_UPLOADED"),
  z.literal("PROOF_REJECTED"),
  z.string(),
]);
export type ProofStatus = z.infer<typeof ProofStatus>;

export const MetadataValidationCheckId = z.union([
  z.literal("MODALITY_MATCH"),
  z.literal("DURATION_CHECK"),
  z.literal("DIMENSION_CHECK"),
  z.literal("AI_DETECTOR"),
  z.string(),
]);
export type MetadataValidationCheckId = z.infer<typeof MetadataValidationCheckId>;

export const MetadataValidationStatus = z.union([
  z.literal("PASS"),
  z.literal("FAIL"),
  z.literal("PENDING"),
  z.literal("NOT_APPLICABLE"),
]);
export type MetadataValidationStatus = z.infer<typeof MetadataValidationStatus>;

export const MetadataValidationCheck = z
  .object({
    id: MetadataValidationCheckId,
    label: z.string(),
    status: MetadataValidationStatus,
    detail: z.string().optional(),
  })
  .passthrough();
export type MetadataValidationCheck = z.infer<typeof MetadataValidationCheck>;

export const LegalAttestation = z
  .object({
    attestation_id: z.string(),
    approver_name: z.string(),
    approver_role: z.string().optional(),
    attested_at: z.string(),
  })
  .passthrough();
export type LegalAttestation = z.infer<typeof LegalAttestation>;

export const ProofRecord = z
  .object({
    proof_method: ProofMethod,
    filename: z.string(),
    size_bytes: z.number().int().nonnegative(),
    hash: z.string(),
    attestation_confirmed: z.boolean().optional(),
    submitted_at: z.string(),
    submitted_by: z.string().optional(),
    audit_trail_id: z.string().optional(),
  })
  .passthrough();
export type ProofRecord = z.infer<typeof ProofRecord>;

export const ProofSpec = z
  .object({
    spec_id: z.string(),
    asset_id: z.string(),
    preflight_run_id: z.string().optional(),
    workspace_label: z.string().optional(),
    asset_filename: z.string().optional(),
    status: ProofStatus,
    placement_type: DisclosurePlacementType.optional(),
    scope: DisclosureScope.optional(),
    modality: DisclosureModality.optional(),
    legal_attestation: LegalAttestation.optional(),
    validation_checks: z.array(MetadataValidationCheck).default([]),
    submission: ProofRecord.optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
  })
  .passthrough();
export type ProofSpec = z.infer<typeof ProofSpec>;

export const SubmitProofPayloadFinalAsset = z
  .object({
    proof_method: z.literal("FINAL_ASSET"),
    filename: z.string(),
    size_bytes: z.number().int().nonnegative(),
    hash: z.string(),
  })
  .passthrough();
export type SubmitProofPayloadFinalAsset = z.infer<typeof SubmitProofPayloadFinalAsset>;

export const SubmitProofPayloadScreenshot = z
  .object({
    proof_method: z.literal("SCREENSHOT"),
    filename: z.string(),
    size_bytes: z.number().int().nonnegative(),
    hash: z.string().optional(),
    attestation_confirmed: z.literal(true),
  })
  .passthrough();
export type SubmitProofPayloadScreenshot = z.infer<typeof SubmitProofPayloadScreenshot>;

export const SubmitProofPayload = z.discriminatedUnion("proof_method", [
  SubmitProofPayloadFinalAsset,
  SubmitProofPayloadScreenshot,
]);
export type SubmitProofPayload =
  | SubmitProofPayloadFinalAsset
  | SubmitProofPayloadScreenshot;

export const SubmitProofResponse = ProofSpec;
export type SubmitProofResponse = z.infer<typeof SubmitProofResponse>;
