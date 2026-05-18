import type { OveragePreviewResponse, UsageMetric } from "@/api/schemas/billing";
import { formatCycleRange, formatMoney } from "./format";

export interface OverageMeterVM {
  label: string;
  used: number;
  limit: number;
  overage: number;
  percent: number;
  isOverage: boolean;
  remainingLabel: string;
  unit: string;
}

export interface OveragePreviewVM {
  cycleLabel: string;
  daysRemainingLabel: string;
  estimatedTotalLabel: string;
  imagesOverageLabel: string;
  imagesUnitPriceLabel?: string;
  videoOverageLabel: string;
  videoUnitPriceLabel?: string;
  imagesMeter: OverageMeterVM;
  videoMeter: OverageMeterVM;
  calculationNote?: string;
  currency: string;
}

function meter(
  label: string,
  metric: UsageMetric,
  unit: string,
): OverageMeterVM {
  const limit = Math.max(metric.limit, 0);
  const used = Math.max(metric.used, 0);
  const overage = Math.max(metric.overage, 0);
  const percent = limit === 0 ? 0 : Math.min(100, Math.round((used / limit) * 100));
  return {
    label,
    used,
    limit,
    overage,
    percent,
    isOverage: overage > 0,
    remainingLabel:
      overage > 0
        ? `+${overage.toLocaleString()} ${unit} overage`
        : `${Math.max(limit - used, 0).toLocaleString()} ${unit} remaining`,
    unit,
  };
}

export function toOveragePreviewData(
  preview: OveragePreviewResponse,
): OveragePreviewVM {
  const cycleLabel =
    formatCycleRange(preview.cycle_start, preview.cycle_end) ?? "—";
  const days = preview.days_remaining ?? 0;
  const daysRemainingLabel =
    days === 1 ? "1 day remaining" : `${days} days remaining`;

  const imagesMeter = meter("Images", preview.image_scans, "images");
  const videoMeter = meter("Video minutes", preview.video_minutes, "minutes");

  const calc = (() => {
    const overageImg = preview.image_scans.overage;
    const priceImg = preview.image_scans.overage_unit_price;
    if (!overageImg || !priceImg) return undefined;
    const total = overageImg * priceImg;
    return `MAX(0, images_used − ${preview.image_scans.limit}) × ${formatMoney(
      priceImg,
      preview.currency,
    )} = ${overageImg.toLocaleString()} × ${formatMoney(
      priceImg,
      preview.currency,
    )} = ${formatMoney(total, preview.currency)}`;
  })();

  return {
    cycleLabel,
    daysRemainingLabel,
    estimatedTotalLabel: formatMoney(
      preview.estimated_overage_total,
      preview.currency,
    ),
    imagesOverageLabel: imagesMeter.isOverage
      ? `${imagesMeter.overage.toLocaleString()} images`
      : "0 images",
    imagesUnitPriceLabel: preview.image_scans.overage_unit_price
      ? `Above ${imagesMeter.limit} limit @ ${formatMoney(
          preview.image_scans.overage_unit_price,
          preview.currency,
        )}/image`
      : undefined,
    videoOverageLabel: videoMeter.isOverage
      ? `${videoMeter.overage.toLocaleString()} minutes`
      : "0 minutes",
    videoUnitPriceLabel: preview.video_minutes.overage_unit_price
      ? videoMeter.isOverage
        ? `Above ${videoMeter.limit} limit @ ${formatMoney(
            preview.video_minutes.overage_unit_price,
            preview.currency,
          )}/min`
        : `Within ${videoMeter.limit} min limit`
      : undefined,
    imagesMeter,
    videoMeter,
    calculationNote: calc,
    currency: preview.currency,
  };
}
