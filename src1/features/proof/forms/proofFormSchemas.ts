import { z } from "zod";

export const PROOF_MAX_FILE_BYTES = 250 * 1024 * 1024;

export const finalAssetFormSchema = z.object({
  proof_method: z.literal("FINAL_ASSET"),
  file: z
    .custom<File>((value) => value instanceof File, {
      message: "Upload the final asset with the disclosure overlay applied.",
    })
    .refine((file) => file.size <= PROOF_MAX_FILE_BYTES, {
      message: "File exceeds the 250 MB upload limit.",
    }),
});
export type FinalAssetFormValues = z.infer<typeof finalAssetFormSchema>;

export const screenshotFormSchema = z.object({
  proof_method: z.literal("SCREENSHOT"),
  file: z
    .custom<File>((value) => value instanceof File, {
      message: "Upload a screenshot of the published or to-be-published asset.",
    })
    .refine(
      (file) => file.type.startsWith("image/"),
      { message: "Screenshot must be an image file." },
    ),
  attestation_confirmed: z.literal(true, {
    errorMap: () => ({
      message:
        "Confirm the attestation before submitting the screenshot proof.",
    }),
  }),
});
export type ScreenshotFormValues = z.infer<typeof screenshotFormSchema>;

export const proofFormSchema = z.discriminatedUnion("proof_method", [
  finalAssetFormSchema,
  screenshotFormSchema,
]);
export type ProofFormValues = z.infer<typeof proofFormSchema>;

export const proofFormDefaults = {
  proof_method: "FINAL_ASSET" as const,
};
