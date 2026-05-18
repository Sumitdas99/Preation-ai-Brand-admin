import { z } from "zod";
import { RplConsentTypeOption } from "@/api/schemas/consent";

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const declarationConfirmed = z
  .boolean()
  .refine((v) => v === true, {
    message: "You must confirm the declaration to submit.",
  });

export const PathAFormSchema = z.object({
  consent_path: z.literal("A"),
  document: z
    .instanceof(File, { message: "Upload a consent document." })
    .refine(
      (f) => f.size <= MAX_FILE_BYTES,
      "Document must be 25 MB or smaller.",
    )
    .refine(
      (f) => ACCEPTED_FILE_TYPES.includes(f.type) || /\.(pdf|docx)$/i.test(f.name),
      "Only PDF or DOCX files are accepted.",
    ),
  consent_type: RplConsentTypeOption,
  document_description: z
    .string()
    .min(1, "Provide a short description of the document."),
  declaration_confirmed: declarationConfirmed,
});
export type PathAFormValues = z.infer<typeof PathAFormSchema>;

export const PathBFormSchema = z.object({
  consent_path: z.literal("B"),
  timeline_note: z
    .string()
    .min(20, "Timeline note must be at least 20 characters."),
  declaration_confirmed: declarationConfirmed,
});
export type PathBFormValues = z.infer<typeof PathBFormSchema>;

export const PathCFormSchema = z.object({
  consent_path: z.literal("C"),
  reason: z.string().min(30, "Reason must be at least 30 characters."),
  declaration_confirmed: declarationConfirmed,
});
export type PathCFormValues = z.infer<typeof PathCFormSchema>;
