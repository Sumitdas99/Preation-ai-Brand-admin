import { z } from "zod";
import { HumanPresenceConsentTypeOption } from "@/api/schemas/consent";

export const HumanPresenceFormSchema = z
  .object({
    person_count_confirmed: z
      .number({ invalid_type_error: "Enter a whole number." })
      .int("Enter a whole number.")
      .min(1, "Confirmed count must be at least 1."),
    consent_type: HumanPresenceConsentTypeOption,
    notes: z.string().optional().default(""),
    declaration_confirmed: z
      .boolean()
      .refine((v) => v === true, {
        message: "You must confirm the declaration to submit.",
      }),
  })
  .superRefine((value, ctx) => {
    if (value.consent_type === "OTHER") {
      const trimmed = (value.notes ?? "").trim();
      if (trimmed.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["notes"],
          message: "Notes are required when 'Other' is selected.",
        });
      }
    }
  });

export type HumanPresenceFormValues = z.infer<typeof HumanPresenceFormSchema>;
