import type { Currency } from "@/api/schemas/billing";
import type { PackConfigFormValues } from "../forms/packConfigFormSchema";
import { addDaysIso, formatDate, formatInteger, formatMoney } from "./format";

export interface PackSummaryRow {
  label: string;
  value: string;
}

export interface PackSummary {
  trialRows: PackSummaryRow[];
  committedRows: PackSummaryRow[];
  showTrial: boolean;
}

export function toPackSummary(
  values: PackConfigFormValues,
  currency: Currency = "EUR",
): PackSummary {
  const trialRows: PackSummaryRow[] = [
    { label: "Trial expiry", value: formatDate(values.trial_end) },
    {
      label: "Post-trial first charge",
      value: formatDate(addDaysIso(values.trial_end, 1)),
    },
    {
      label: "Trial image cap",
      value: values.trial_image_limit !== undefined
        ? `${formatInteger(values.trial_image_limit)} images`
        : "—",
    },
    {
      label: "Trial video cap",
      value: values.trial_video_limit !== undefined
        ? `${formatInteger(values.trial_video_limit)} minutes`
        : "—",
    },
  ];

  const committedRows: PackSummaryRow[] = [
    {
      label: "Monthly price",
      value: formatMoney(values.monthly_price, currency),
    },
    {
      label: "Image limit / cycle",
      value: values.custom_image_limit !== undefined
        ? `${formatInteger(values.custom_image_limit)} images`
        : "—",
    },
    {
      label: "Video limit / cycle",
      value: values.custom_video_limit !== undefined
        ? `${formatInteger(values.custom_video_limit)} minutes`
        : "—",
    },
    {
      label: "Overage — image",
      value: values.overage_image_price !== undefined
        ? `${formatMoney(values.overage_image_price, currency)} / image`
        : "—",
    },
    {
      label: "Overage — video / min",
      value: values.overage_video_price !== undefined
        ? `${formatMoney(values.overage_video_price, currency)} / min`
        : "—",
    },
  ];

  return {
    trialRows,
    committedRows,
    showTrial: values.pack_type === "TRIAL",
  };
}
