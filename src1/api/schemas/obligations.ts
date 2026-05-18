import { z } from "zod";

export const ObligationType = z.union([
  z.literal("DISCLOSURE_REQUIRED"),
  z.literal("CONSENT_OR_SYNTHETIC_ATTESTATION_REQUIRED"),
  z.literal("ATTESTATION_REQUIRED"),
  z.literal("BRAND_SUITABILITY_BLOCKED"),
  z.literal("PROVENANCE_REQUIRED"),
  z.string(),
]);
export type ObligationType = z.infer<typeof ObligationType>;

export const ObligationSeverity = z.union([
  z.literal("MANDATORY"),
  z.literal("ADVISORY"),
]);
export type ObligationSeverity = z.infer<typeof ObligationSeverity>;

export const Obligation = z
  .object({
    obligation_id: z.string(),
    type: ObligationType,
    severity: ObligationSeverity,
    policy_reference: z.string().optional(),
    explanation: z.string().optional(),
    spec_id: z.string().optional(),
    met: z.boolean().optional(),
  })
  .passthrough();

export type Obligation = z.infer<typeof Obligation>;
