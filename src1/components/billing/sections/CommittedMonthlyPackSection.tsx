import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import type {
  Currency,
  PackType,
} from "@/api/schemas/billing";
import type { PackConfigFormValues } from "@/features/billing/forms/packConfigFormSchema";
import {
  SECTION_3_HEADER,
} from "@/features/billing/adapters/copy";
import { addDaysIso, currencySymbol, formatDate } from "@/features/billing/adapters/format";
import { SectionHeading } from "../primitives/SectionHeading";
import { FieldGroup, FormInput } from "../primitives/FieldGroup";

export interface UsageCrossRef {
  imageUsed?: number;
  imageOverage?: number;
  videoUsed?: number;
  videoOverage?: number;
}

interface CommittedMonthlyPackSectionProps {
  packType: PackType;
  currency: Currency;
  control: Control<PackConfigFormValues>;
  trialEnd?: string;
  subscriptionActive?: boolean;
  usageCrossRef?: UsageCrossRef;
  sectionIndex?: number;
}

function buildSubtitle(
  packType: PackType,
  trialEnd?: string,
  subscriptionActive?: boolean,
): string {
  if (packType === "TRIAL") {
    const firstChargeDate = addDaysIso(trialEnd, 1);
    const formattedDate = firstChargeDate ? formatDate(firstChargeDate) : undefined;
    return formattedDate
      ? `Applies from trial end date onwards (${formattedDate}).`
      : "Applies from trial end date onwards.";
  }
  if (packType === "ENTERPRISE") {
    return subscriptionActive
      ? "Charges on activation. Subscription is currently active."
      : "Charges immediately on activation.";
  }
  return "Optional overrides on top of the standard plan defaults.";
}

export function CommittedMonthlyPackSection({
  packType,
  currency,
  control,
  trialEnd,
  subscriptionActive,
  usageCrossRef,
  sectionIndex = 3,
}: CommittedMonthlyPackSectionProps) {
  const symbol = currencySymbol(currency);
  const subtitle = buildSubtitle(packType, trialEnd, subscriptionActive);
  const required = packType !== "STANDARD";

  return (
    <section className="overflow-hidden rounded-lg border-[1.25px] border-white/10 bg-[#0A1F44] text-white shadow-sm">
      <SectionHeading
        index={sectionIndex}
        title={SECTION_3_HEADER[packType]}
        subtitle={subtitle}
        variant="dark"
      />

      <div className="px-6 py-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/50">
          Pricing
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            control={control}
            name="monthly_price"
            render={({ field }) => (
              <FieldGroup
                id="monthly_price"
                label={`Monthly price (${currency})`}
                required={required}
                filled={Boolean(field.value)}
                variant="dark"
                hint="Billed at the start of each cycle"
              >
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-white/50">
                    {symbol}
                  </span>
                  <FormInput
                    id="monthly_price"
                    variant="dark"
                    type="number"
                    min={0}
                    step="0.01"
                    inputMode="decimal"
                    placeholder="0.00"
                    className="no-spinner pl-7"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                </div>
              </FieldGroup>
            )}
          />

          <Controller
            control={control}
            name="override_reason"
            render={({ field }) => (
              <FieldGroup
                id="override_reason"
                label="Override reason"
                variant="dark"
                hint="Optional, for internal reference only"
              >
                <FormInput
                  id="override_reason"
                  variant="dark"
                  placeholder="e.g. Q2 2026 pilot — agreed with CEO 14 Apr"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                />
              </FieldGroup>
            )}
          />
        </div>

        <div className="mt-5 pt-1">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/50">
            Per-cycle scan limits
          </p>
          <div className="grid gap-4 md:grid-cols-2">
          <Controller
            control={control}
            name="custom_image_limit"
            render={({ field }) => {
              const crossRef = usageCrossRef;
              const usageHint =
                crossRef?.imageUsed !== undefined
                  ? crossRef.imageOverage
                    ? `${crossRef.imageUsed.toLocaleString()} images scanned this cycle, ${crossRef.imageOverage.toLocaleString()} in overage`
                    : `${crossRef.imageUsed.toLocaleString()} images scanned this cycle`
                  : undefined;
              return (
                <FieldGroup
                  id="custom_image_limit"
                  label="Image scan limit"
                  required={required}
                  filled={Boolean(field.value)}
                  variant="dark"
                  hint={
                    usageHint
                      ? usageHint
                      : "Overage is billed at the rate below"
                  }
                >
                  <FormInput
                    id="custom_image_limit"
                    variant="dark"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="e.g. 500"
                    className="no-spinner"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9]/g, "");
                      field.onChange(v);
                    }}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                </FieldGroup>
              );
            }}
          />

          <Controller
            control={control}
            name="custom_video_limit"
            render={({ field }) => {
              const crossRef = usageCrossRef;
              const usageHint =
                crossRef?.videoUsed !== undefined
                  ? crossRef.videoOverage
                    ? `${crossRef.videoUsed.toLocaleString()} video minutes used this cycle, ${crossRef.videoOverage.toLocaleString()} in overage`
                    : `${crossRef.videoUsed.toLocaleString()} video minutes used this cycle`
                  : undefined;
              return (
                <FieldGroup
                  id="custom_video_limit"
                  label="Video minutes limit"
                  required={required}
                  filled={Boolean(field.value)}
                  variant="dark"
                  hint={
                    usageHint
                      ? usageHint
                      : "Overage is billed at the rate below"
                  }
                >
                  <FormInput
                    id="custom_video_limit"
                    variant="dark"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="e.g. 120"
                    className="no-spinner"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9]/g, "");
                      field.onChange(v);
                    }}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                </FieldGroup>
              );
            }}
          />
          </div>
        </div>

        <div className="mt-5 pt-1">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/50">
            Overage rates
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              control={control}
              name="overage_image_price"
              render={({ field }) => (
                <FieldGroup
                  id="overage_image_price"
                  label={`Overage per image (${currency})`}
                  required={required}
                  filled={Boolean(field.value)}
                  variant="dark"
                  hint="Charged per image that exceeds the committed scan limit"
                >
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-white/50">
                      {symbol}
                    </span>
                    <FormInput
                      id="overage_image_price"
                      variant="dark"
                      type="number"
                      min={0}
                      step="0.01"
                      inputMode="decimal"
                      placeholder="0.80"
                      className="no-spinner pl-7"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                  </div>
                </FieldGroup>
              )}
            />

            <Controller
              control={control}
              name="overage_video_price"
              render={({ field }) => (
                <FieldGroup
                  id="overage_video_price"
                  label={`Overage per video minute (${currency})`}
                  required={required}
                  filled={Boolean(field.value)}
                  variant="dark"
                  hint="Charged per video minute that exceeds the committed limit"
                >
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-white/50">
                      {symbol}
                    </span>
                    <FormInput
                      id="overage_video_price"
                      variant="dark"
                      type="number"
                      min={0}
                      step="0.01"
                      inputMode="decimal"
                      placeholder="3.50"
                      className="no-spinner pl-7"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                  </div>
                </FieldGroup>
              )}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
