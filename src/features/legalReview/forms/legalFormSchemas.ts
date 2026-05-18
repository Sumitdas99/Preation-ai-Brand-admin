import { z } from "zod";
import { AttestationType, RoutingEngine } from "@/api/schemas/approvals";

export const APPROVE_TYPED_SIGNATURE_MIN = 2;
export const REJECT_NOTES_MIN_CHARS = 20;
export const FORCE_PASS_COMMENTARY_MIN_CHARS = 50;

export const approveAttestFormSchema = z.object({
  attestation_type: AttestationType,
  typed_signature: z
    .string()
    .trim()
    .min(APPROVE_TYPED_SIGNATURE_MIN, {
      message: "Typed signature is required.",
    }),
  declaration_confirmed: z.literal(true, {
    errorMap: () => ({
      message:
        "Confirm the attestation declaration before submitting the approval.",
    }),
  }),
  notes: z.string().optional(),
});
export type ApproveAttestFormValues = z.infer<typeof approveAttestFormSchema>;

export const approveAttestFormDefaults = {
  attestation_type: "HUMAN_GENERATED_ATTESTED" as const,
  typed_signature: "",
  declaration_confirmed: false as boolean,
  notes: "",
};

const RejectableEngine = z.enum(["DISCLOSURE", "BRAND_SUITABILITY"]);
export type RejectableEngineId = z.infer<typeof RejectableEngine>;

export const rejectFormSchema = z
  .object({
    rejection_notes: z
      .string()
      .trim()
      .min(REJECT_NOTES_MIN_CHARS, {
        message: `Rejection notes must be at least ${REJECT_NOTES_MIN_CHARS} characters.`,
      }),
    unlock_engines: z
      .array(RejectableEngine)
      .min(1, {
        message: "Select at least one engine to unlock for the Reviewer.",
      }),
    typed_signature: z.string().trim().min(APPROVE_TYPED_SIGNATURE_MIN, {
      message: "Typed signature is required.",
    }),
    declaration_confirmed: z.literal(true, {
      errorMap: () => ({
        message: "Confirm the rejection declaration before submitting.",
      }),
    }),
  })
  .refine(
    (data) => data.unlock_engines.length > 0,
    {
      message: "Select at least one engine to unlock for the Reviewer.",
      path: ["unlock_engines"],
    },
  );
export type RejectFormValues = z.infer<typeof rejectFormSchema>;

export const rejectFormDefaults = {
  rejection_notes: "",
  unlock_engines: [] as RejectableEngineId[],
  typed_signature: "",
  declaration_confirmed: false as boolean,
};

export const forcePassFormSchema = z.object({
  commentary: z
    .string()
    .trim()
    .min(FORCE_PASS_COMMENTARY_MIN_CHARS, {
      message: `Commentary must be at least ${FORCE_PASS_COMMENTARY_MIN_CHARS} characters.`,
    }),
  typed_signature: z.string().trim().min(APPROVE_TYPED_SIGNATURE_MIN, {
    message: "Typed signature is required.",
  }),
  declaration_confirmed: z.literal(true, {
    errorMap: () => ({
      message:
        "Confirm the force-pass attestation declaration before submitting.",
    }),
  }),
});
export type ForcePassFormValues = z.infer<typeof forcePassFormSchema>;

export const forcePassFormDefaults = {
  commentary: "",
  typed_signature: "",
  declaration_confirmed: false as boolean,
};

export function toRoutingInstructions(
  engines: RejectableEngineId[],
): Array<{ engine: z.infer<typeof RoutingEngine>; action: string }> {
  return engines.map((engine) => {
    if (engine === "DISCLOSURE") {
      return { engine, action: "UNLOCK_SPEC" as const };
    }
    return { engine, action: "UNLOCK" as const };
  });
}
