import { z } from "zod";

export const AssetModality = z.union([
  z.literal("IMAGE"),
  z.literal("VIDEO"),
  z.literal("AUDIO"),
  z.string(),
]);
export type AssetModality = z.infer<typeof AssetModality>;

export const AssetVersionKind = z.union([
  z.literal("ORIGINAL"),
  z.literal("C2PA_EMBEDDED"),
  z.string(),
]);

export const AssetVersion = z
  .object({
    version_id: z.string(),
    kind: AssetVersionKind,
    file_name: z.string(),
    download_url: z.string().optional(),
    embed_status: z
      .union([
        z.literal("NOT_APPLICABLE"),
        z.literal("EMBEDDING"),
        z.literal("EMBEDDED"),
        z.literal("EMBED_FAILED"),
      ])
      .optional(),
    created_at: z.string().optional(),
  })
  .passthrough();
export type AssetVersion = z.infer<typeof AssetVersion>;

export const Asset = z
  .object({
    asset_id: z.string(),
    workspace_id: z.string().optional(),
    file_name: z.string(),
    file_size_bytes: z.number().int().nonnegative(),
    mime_type: z.string().optional(),
    modality: AssetModality,
    duration_seconds: z.number().nonnegative().optional(),
    thumbnail_url: z.string().optional(),
    uploaded_at: z.string(),
    uploaded_by: z.string().optional(),
    versions: z.array(AssetVersion).default([]),
  })
  .passthrough();
export type Asset = z.infer<typeof Asset>;
