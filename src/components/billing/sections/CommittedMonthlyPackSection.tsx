import type { Control, FieldErrors } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
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
  errors: FieldErrors<PackConfigFormValues>;
  trialEnd?: string;
  subscriptionActive?: boolean;
  usageCrossRef?: UsageCrossRef;
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
      ? `Applies from trial end date onwards (${formattedDate}) · writes to custom_* columns`
      : "Applies from trial end date onwards · writes to custom_* columns";
  }
  if (packType === "ENTERPRISE") {
    return subscriptionActive
      ? "Charges on activation · currently active"
      : "Charges immediately on activation · writes to custom_* columns";
  }
  return "Optional overrides on top of the standard plan_version defaults";
}

export function CommittedMonthlyPackSection({
  packType,
  currency,
  control,
  errors,
  trialEnd,
  subscriptionActive,
  usageCrossRef,
}: CommittedMonthlyPackSectionProps) {
  const symbol = currencySymbol(currency);
  const subtitle = buildSubtitle(packType, trialEnd, subscriptionActive);
  const required = packType !== "STANDARD";

  return (
    <section className="rounded-xl border border-white/10 bg-[#0A1F44] p-5 text-white shadow-sm">
      <SectionHeading
        index={3}
        title={SECTION_3_HEADER[packType]}
        subtitle={subtitle}
        variant="dark"
      />

      <div className="mt-5 space-y-5">
        <SubBlock title="Pricing & limits — committed agreement">
          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              control={control}
              name="monthly_price"
              render={({ field }) => (
                <FieldGroup
                  id="monthly_price"
                  label={`Monthly price (${currency})`}
                  required={required}
                  variant="dark"
                  hint="Fixed monthly fee at cycle start. Writes to custom_price."
                  error={errors.monthly_price?.message}
                >
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/60">
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
                      className="pl-7"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      hasError={Boolean(errors.monthly_price)}
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
                  hint="Internal note · Not shown to Brand Admin."
                  error={errors.override_reason?.message}
                >
                  <Textarea
                    id="override_reason"
                    rows={2}
                    placeholder="e.g. Q2 2026 pilot — agreed with CEO 14 Apr"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    className="min-h-[64px] resize-none border-white/15 bg-white/5 text-sm text-white placeholder:text-white/40 focus-visible:border-amber-300/50 focus-visible:ring-amber-300/50"
                  />
                </FieldGroup>
              )}
            />
          </div>

          <p className="mt-2 text-[11px] uppercase tracking-wider text-white/50">
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
                      ? `Current cycle: ${crossRef.imageUsed.toLocaleString()} used (${crossRef.imageOverage.toLocaleString()} in overage above).`
                      : `Current cycle: ${crossRef.imageUsed.toLocaleString()} used.`
                    : undefined;
                return (
                  <FieldGroup
                    id="custom_image_limit"
                    label="Image scan limit"
                    required={required}
                    variant="dark"
                    hint={
                      usageHint
                        ? `Writes to custom_image_limit. ${usageHint}`
                        : "Max images per billing cycle post-trial. Writes to custom_image_limit."
                    }
                    error={errors.custom_image_limit?.message}
                  >
                    <FormInput
                      id="custom_image_limit"
                      variant="dark"
                      type="number"
                      min={0}
                      step={1}
                      inputMode="numeric"
                      placeholder="e.g. 500"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      hasError={Boolean(errors.custom_image_limit)}
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
                      ? `Current cycle: ${crossRef.videoUsed.toLocaleString()} used (${crossRef.videoOverage.toLocaleString()} in overage above).`
                      : `Current cycle: ${crossRef.videoUsed.toLocaleString()} used.`
                    : undefined;
                return (
                  <FieldGroup
                    id="custom_video_limit"
                    label="Video minutes limit"
                    required={required}
                    variant="dark"
                    hint={
                      usageHint
                        ? `Writes to custom_video_limit. ${usageHint}`
                        : "Max video minutes per cycle post-trial. Writes to custom_video_limit."
                    }
                    error={errors.custom_video_limit?.message}
                  >
                    <FormInput
                      id="custom_video_limit"
                      variant="dark"
                      type="number"
                      min={0}
                      step={1}
                      inputMode="numeric"
                      placeholder="e.g. 120"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      hasError={Boolean(errors.custom_video_limit)}
                    />
                  </FieldGroup>
                );
              }}
            />
          </div>
        </SubBlock>

        <SubBlock title="Overage rates — billed at cycle close for usage above limit">
          <div className="grid gap-4 md:grid-cols-2">
            <Controller
              control={control}
              name="overage_image_price"
              render={({ field }) => (
                <FieldGroup
                  id="overage_image_price"
                  label={`Overage — per image (${currency})`}
                  required={required}
                  variant="dark"
                  hint="Per image above limit. Writes to overage_image_price."
                  error={errors.overage_image_price?.message}
                >
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/60">
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
                      className="pl-7"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      hasError={Boolean(errors.overage_image_price)}
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
                  label={`Overage — per video minute (${currency})`}
                  required={required}
                  variant="dark"
                  hint="Per video minute above limit. Writes to overage_video_price."
                  error={errors.overage_video_price?.message}
                >
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/60">
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
                      className="pl-7"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      hasError={Boolean(errors.overage_video_price)}
                    />
                  </div>
                </FieldGroup>
              )}
            />
          </div>
        </SubBlock>
      </div>
    </section>
  );
}

interface SubBlockProps {
  title: string;
  children: React.ReactNode;
}

function SubBlock({ title, children }: SubBlockProps) {
  return (
    <div className="space-y-3 rounded-lg bg-white/[0.04] p-4 ring-1 ring-white/5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
        {title}
      </p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
