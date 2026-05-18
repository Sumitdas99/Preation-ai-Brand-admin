import { z } from "zod";

export const CHALLENGE_JUSTIFICATION_MIN_LENGTH = 50;

export const challengeFormSchema = z.object({
  justification: z
    .string()
    .trim()
    .min(
      CHALLENGE_JUSTIFICATION_MIN_LENGTH,
      `Justification must be at least ${CHALLENGE_JUSTIFICATION_MIN_LENGTH} characters.`,
    ),
  declaration_confirmed: z.literal(true, {
    errorMap: () => ({ message: "Declaration must be confirmed before submitting." }),
  }),
});

export type ChallengeFormValues = z.infer<typeof challengeFormSchema>;
export type ChallengeFormDefaults = {
  justification: string;
  declaration_confirmed: boolean;
};

export const challengeFormDefaults: ChallengeFormDefaults = {
  justification: "",
  declaration_confirmed: false,
};
