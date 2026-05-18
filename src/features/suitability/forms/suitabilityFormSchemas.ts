import { z } from "zod";

export const acceptFlaggedFormSchema = z.object({
  declaration_confirmed: z.literal(true, {
    errorMap: () => ({
      message:
        "Confirm the reviewer declaration before accepting flagged categories.",
    }),
  }),
  notes: z.string().optional(),
});
export type AcceptFlaggedFormValues = z.infer<typeof acceptFlaggedFormSchema>;

export interface AcceptFlaggedFormDefaults {
  declaration_confirmed: boolean;
  notes: string;
}

export const acceptFlaggedFormDefaults: AcceptFlaggedFormDefaults = {
  declaration_confirmed: false,
  notes: "",
};

export const WITHDRAW_REASON_MAX = 500;

export const withdrawFormSchema = z.object({
  reason: z
    .string()
    .max(WITHDRAW_REASON_MAX, {
      message: `Reason must be ${WITHDRAW_REASON_MAX} characters or fewer.`,
    })
    .optional(),
});
export type WithdrawFormValues = z.infer<typeof withdrawFormSchema>;

export const withdrawFormDefaults: WithdrawFormValues = {
  reason: "",
};
