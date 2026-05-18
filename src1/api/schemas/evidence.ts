import { z } from "zod";

export const EvidencePackStatus = z.union([
  z.literal("PENDING"),
  z.literal("GENERATING"),
  z.literal("COMPLETE"),
  z.literal("FAILED"),
  z.string(),
]);
export type EvidencePackStatus = z.infer<typeof EvidencePackStatus>;

export const EvidencePack = z
  .object({
    evidence_pack_id: z.string(),
    asset_id: z.string(),
    preflight_run_id: z.string(),
    workspace_id: z.string().optional(),
    status: EvidencePackStatus,
    download_url: z.string().optional(),
    hash: z.string().optional(),
    generated_at: z.string().optional(),
  })
  .passthrough();
export type EvidencePack = z.infer<typeof EvidencePack>;

export const GenerateEvidencePackRequest = z.object({
  preflight_run_id: z.string(),
  asset_id: z.string(),
  workspace_id: z.string(),
});
export type GenerateEvidencePackRequest = z.infer<
  typeof GenerateEvidencePackRequest
>;

export const GenerateEvidencePackResponse = EvidencePack;
export type GenerateEvidencePackResponse = z.infer<
  typeof GenerateEvidencePackResponse
>;
