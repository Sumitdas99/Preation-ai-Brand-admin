import { useEffect, useId, useMemo, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  CommittedMonthlyPackSection,
  InlineNotice,
  PackSummary,
  PackTypeSection,
  TrialPeriodSection,
  type UsageCrossRef,
} from "@/components/billing";
import type { Currency } from "@/api/schemas/billing";
import {
  packConfigFormDefaults,
  packConfigFormSchema,
  type PackConfigFormValues,
} from "../forms/packConfigFormSchema";
import { COPY } from "../adapters/copy";
import { toPackSummary } from "../adapters/toPackSummary";

type ActionVariant =
  | "default"
  | "outline"
  | "secondary"
  | "ghost"
  | "destructive";

export interface PackConfigurationFormProps {
  brandName: string;
  defaultValues?: PackConfigFormValues;
  currency?: Currency;
  isSubmitting?: boolean;
  topSlot?: ReactNode;
  trialExpiredNotice?: boolean;
  trialEnd?: string;
  subscriptionActive?: boolean;
  usageCrossRef?: UsageCrossRef;

  primaryLabel: string;
  primaryVariant?: ActionVariant;
  onPrimarySubmit: (values: PackConfigFormValues) => void | Promise<void>;
  primaryDisabled?: boolean;

  secondaryLabel?: string;
  secondaryVariant?: ActionVariant;
  onSecondarySubmit?: (values: PackConfigFormValues) => void | Promise<void>;
  secondaryDisabled?: boolean;

  ghostLabel?: string;
  onGhost?: () => void;

  resetKey?: number;
}

export function PackConfigurationForm({
  brandName,
  defaultValues,
  currency = "EUR",
  isSubmitting,
  topSlot,
  trialExpiredNotice,
  primaryLabel,
  primaryVariant = "default",
  onPrimarySubmit,
  primaryDisabled,
  secondaryLabel,
  secondaryVariant = "outline",
  onSecondarySubmit,
  secondaryDisabled,
  ghostLabel,
  onGhost,
  resetKey,
  trialEnd: trialEndProp,
  subscriptionActive,
  usageCrossRef,
}: PackConfigurationFormProps) {
  const formId = useId();
  const initial = useMemo(
    () => defaultValues ?? packConfigFormDefaults,
    [defaultValues],
  );

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty, isSubmitting: rhfSubmitting },
    reset,
  } = useForm<PackConfigFormValues>({
    resolver: zodResolver(packConfigFormSchema),
    defaultValues: initial,
    mode: "onBlur",
  });

  useEffect(() => {
    reset(initial);
  }, [initial, reset, resetKey]);

  const values = watch();
  const summary = useMemo(
    () => toPackSummary(values, currency),
    [values, currency],
  );

  const submitting = Boolean(isSubmitting) || rhfSubmitting;

  const triggerSubmit =
    (handler: (values: PackConfigFormValues) => void | Promise<void>) =>
    handleSubmit(async (validated) => {
      await handler(validated);
    });

  return (
    <form
      id={formId}
      onSubmit={triggerSubmit(onPrimarySubmit)}
      className="space-y-5"
    >
      {topSlot}

      {trialExpiredNotice ? (
        <InlineNotice tone="danger" title={COPY.trialExpiredNoticeTitle}>
          {COPY.trialExpiredNoticeBody} Override_type can be updated by selecting{" "}
          <em>Enterprise</em> below and saving.
        </InlineNotice>
      ) : null}

      <PackTypeSection
        value={values.pack_type}
        onChange={(v) => setValue("pack_type", v, { shouldDirty: true })}
      />

      {values.pack_type === "TRIAL" ? (
        <TrialPeriodSection
          control={control}
          errors={errors}
          trialEnd={values.trial_end}
        />
      ) : (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
          Trial period settings (Section 2) — hidden · not applicable for{" "}
          {values.pack_type === "ENTERPRISE" ? "Enterprise" : "Standard"} pack type.
        </p>
      )}

      <CommittedMonthlyPackSection
        packType={values.pack_type}
        currency={currency}
        control={control}
        errors={errors}
        trialEnd={values.pack_type === "TRIAL" ? (values.trial_end || trialEndProp) : undefined}
        subscriptionActive={subscriptionActive}
        usageCrossRef={usageCrossRef}
      />

      <PackSummary brandName={brandName} summary={summary} />

      <footer className="sticky bottom-0 -mx-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white/95 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          {ghostLabel ? (
            <Button
              type="button"
              variant="ghost"
              onClick={onGhost}
              disabled={submitting}
            >
              {ghostLabel}
            </Button>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {secondaryLabel && onSecondarySubmit ? (
            <Button
              type="button"
              variant={secondaryVariant}
              onClick={triggerSubmit(onSecondarySubmit)}
              disabled={submitting || secondaryDisabled}
            >
              {secondaryLabel}
            </Button>
          ) : null}
          <Button
            type="submit"
            form={formId}
            variant={primaryVariant}
            disabled={submitting || primaryDisabled}
            data-pristine={!isDirty}
            className="bg-[#0A1F44] text-white hover:bg-[#0A1F44]/90"
          >
            {submitting ? "Saving…" : primaryLabel}
          </Button>
        </div>
      </footer>
    </form>
  );
}
