import type { BrandDetail, BrandPack } from "@/api/schemas/billing";
import {
  packConfigFormDefaults,
  type PackConfigFormValues,
} from "../forms/packConfigFormSchema";

export function toPackFormValues(
  brand: BrandDetail | undefined,
): PackConfigFormValues {
  const pack = brand?.pack;
  if (!pack) return packConfigFormDefaults;
  return {
    pack_type: pack.pack_type ?? "TRIAL",
    trial_end: pack.trial_end ?? "",
    trial_image_limit: pack.trial_image_limit,
    trial_video_limit: pack.trial_video_limit,
    monthly_price: pack.monthly_price ?? pack.custom_price,
    override_reason: pack.override_reason ?? "",
    custom_image_limit: pack.custom_image_limit ?? pack.image_scan_limit,
    custom_video_limit: pack.custom_video_limit ?? pack.video_minutes_limit,
    overage_image_price: pack.overage_image_price,
    overage_video_price: pack.overage_video_price,
  };
}

export function fromPackFormValues(
  values: PackConfigFormValues,
): Partial<BrandPack> {
  const isTrial = values.pack_type === "TRIAL";
  return {
    pack_type: values.pack_type,
    monthly_price: values.monthly_price,
    custom_price: values.monthly_price,
    override_reason: values.override_reason || undefined,
    custom_image_limit: values.custom_image_limit,
    custom_video_limit: values.custom_video_limit,
    image_scan_limit: values.custom_image_limit,
    video_minutes_limit: values.custom_video_limit,
    overage_image_price: values.overage_image_price,
    overage_video_price: values.overage_video_price,
    trial_end: isTrial ? values.trial_end || undefined : undefined,
    trial_image_limit: isTrial ? values.trial_image_limit : undefined,
    trial_video_limit: isTrial ? values.trial_video_limit : undefined,
  };
}
