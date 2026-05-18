import { z } from "zod";
import { PackType } from "@/api/schemas/billing";

const optionalNumber = z
  .preprocess((value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    const n = typeof value === "number" ? value : Number(value);
    return Number.isFinite(n) ? n : undefined;
  }, z.number().nonnegative().optional());

const optionalIntNumber = z
  .preprocess((value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    const n = typeof value === "number" ? value : Number(value);
    return Number.isFinite(n) ? Math.floor(n) : undefined;
  }, z.number().int().nonnegative().optional());

export const packConfigFormSchema = z
  .object({
    pack_type: PackType,
    trial_end: z.string().optional(),
    trial_image_limit: optionalIntNumber,
    trial_video_limit: optionalIntNumber,
    monthly_price: optionalNumber,
    override_reason: z.string().trim().max(500).optional().or(z.literal("")),
    custom_image_limit: optionalIntNumber,
    custom_video_limit: optionalIntNumber,
    overage_image_price: optionalNumber,
    overage_video_price: optionalNumber,
  })
  .superRefine((data, ctx) => {
    const requireField = (path: keyof typeof data, message: string) => {
      const value = data[path];
      if (value === undefined || value === null || value === "") {
        ctx.addIssue({ path: [path], code: "custom", message });
      }
    };

    if (data.pack_type === "TRIAL") {
      requireField("trial_end", "Trial expiry date is required");
      requireField("trial_image_limit", "Trial image scan cap is required");
      requireField("trial_video_limit", "Trial video minutes cap is required");
    }

    if (data.pack_type !== "STANDARD") {
      requireField("monthly_price", "Monthly price is required");
      requireField("custom_image_limit", "Image scan limit is required");
      requireField("custom_video_limit", "Video minutes limit is required");
      requireField("overage_image_price", "Overage per image is required");
      requireField("overage_video_price", "Overage per video minute is required");
    }
  });

export type PackConfigFormValues = z.infer<typeof packConfigFormSchema>;

export const packConfigFormDefaults: PackConfigFormValues = {
  pack_type: "TRIAL",
  trial_end: "",
  trial_image_limit: undefined,
  trial_video_limit: undefined,
  monthly_price: undefined,
  override_reason: "",
  custom_image_limit: undefined,
  custom_video_limit: undefined,
  overage_image_price: undefined,
  overage_video_price: undefined,
};
