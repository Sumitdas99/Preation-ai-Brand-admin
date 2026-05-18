export const PROOF_PAGE_COPY = {
  title: "Upload proof of disclosure implementation",
  description:
    "Legal has approved this asset. Upload proof that the AI disclosure label has been applied as specified before the asset is cleared for publish. Choose the proof method that matches your disclosure placement type.",
  selectMethodLabel: "Select proof method",
  selectMethodRequired: "Required",
  placementHintPrefix: "Placement type on file:",
  optionAHeading: "Option A: Final asset with disclosure overlay",
  optionADescription:
    "Upload the final exported asset with the AI disclosure label visually applied.",
  optionAUploadHeading: "Upload final asset",
  optionAUploadCta: "Upload final asset with disclosure applied",
  optionAUploadHint:
    "Must match the original media type. Video duration within ±2 seconds; image dimensions match the original or fall within standard crop tolerance.",
  optionBHeading: "Option B: Platform screenshot",
  optionBDescription:
    "Upload a screenshot of the post or content showing the disclosure in context.",
  optionBUploadHeading: "Upload platform screenshot",
  optionBUploadCta: "Upload screenshot showing the disclosure in context",
  optionBUploadHint:
    "PNG or JPG image, captured from the published or to-be-published post",
  optionBAttestationLabel: (assetId: string) =>
    `I confirm this screenshot represents the final published or to-be-published state of asset ${assetId}.`,
  metadataValidationHeader: "Metadata validation runs automatically on upload",
  hashHeader: "SHA-256 hash",
  hashHint: "Computed on upload and saved to the audit log.",
  backCta: "Back to Pre-Flight",
  submitCta: "Confirm & submit proof",
} as const;

export const PROOF_METHOD_LABELS: Record<"FINAL_ASSET" | "SCREENSHOT", string> = {
  FINAL_ASSET: "Final asset with disclosure overlay",
  SCREENSHOT: "Platform screenshot",
};
