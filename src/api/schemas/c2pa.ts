import { z } from "zod";

export const C2paEmbedRequest = z.object({
  asset_id: z.string(),
  manifest_intent: z
    .union([z.literal("RE_EMBED"), z.literal("FORCE_REPLACE")])
    .default("RE_EMBED")
    .optional(),
});
export type C2paEmbedRequest = z.infer<typeof C2paEmbedRequest>;

export const C2paEmbedResponse = z
  .object({
    asset_id: z.string(),
    embed_status: z.union([
      z.literal("EMBEDDING"),
      z.literal("EMBEDDED"),
      z.literal("EMBED_FAILED"),
    ]),
    version_id: z.string().optional(),
    started_at: z.string().optional(),
  })
  .passthrough();
export type C2paEmbedResponse = z.infer<typeof C2paEmbedResponse>;
