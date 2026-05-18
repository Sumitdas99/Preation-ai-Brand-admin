import { useEffect, useId, useMemo, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  CommittedMonthlyPackSection,
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
    formState: { isDirty, isSubmitting: rhfSubmitting },
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


      <PackTypeSection
        value={values.pack_type}
        onChange={(v) => setValue("pack_type", v, { shouldDirty: true })}
      />

      {values.pack_type === "TRIAL" ? (
        <TrialPeriodSection
          control={control}
          trialEnd={values.trial_end}
        />
      ) : null}

      <CommittedMonthlyPackSection
        sectionIndex={values.pack_type === "TRIAL" ? 3 : 2}
        packType={values.pack_type}
        currency={currency}
        control={control}
        trialEnd={values.pack_type === "TRIAL" ? (values.trial_end || trialEndProp) : undefined}
        subscriptionActive={subscriptionActive}
        usageCrossRef={usageCrossRef}
      />

      <PackSummary brandName={brandName} summary={summary} />

      <footer className="flex flex-col-reverse items-stretch gap-3 rounded-md border border-border bg-card px-6 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {ghostLabel ? (
            <Button
              type="button"
              variant="ghost"
              onClick={onGhost}
              disabled={submitting}
              className="h-11 shrink-0 border-0 bg-slate-100 font-semibold text-slate-800 hover:bg-slate-200"
            >
              {ghostLabel}
            </Button>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {secondaryLabel && onSecondarySubmit ? (
            <Button
              type="button"
              variant="ghost"
              onClick={triggerSubmit(onSecondarySubmit)}
              disabled={submitting || secondaryDisabled}
              className="h-11 shrink-0 border-0 bg-slate-100 font-semibold text-slate-800 hover:bg-slate-200"
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
            className="h-11 shrink-0 bg-[#0f1d3b] text-sm font-bold text-white hover:bg-[#1a2c52] focus-visible:ring-[#0f1d3b]"
          >
            {submitting ? "Saving…" : primaryLabel}
          </Button>
        </div>
      </footer>
    </form>
  );
}
