import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import type { PackConfigFormValues } from "@/features/billing/forms/packConfigFormSchema";
import { COPY } from "@/features/billing/adapters/copy";
import { addDaysIso, formatDate } from "@/features/billing/adapters/format";
import { SectionHeading } from "../primitives/SectionHeading";
import { InlineNotice } from "../primitives/InlineNotice";
import { FieldGroup, FormInput } from "../primitives/FieldGroup";

interface TrialPeriodSectionProps {
  control: Control<PackConfigFormValues>;
  errors: FieldErrors<PackConfigFormValues>;
  trialEnd?: string;
  showExpiryAlert?: boolean;
}

function computeAlertDate(trialEnd: string | undefined): string | null {
  if (!trialEnd) return null;
  const d = new Date(trialEnd);
  if (Number.isNaN(d.getTime())) return null;
  d.setDate(d.getDate() - 7);
  return formatDate(d.toISOString().slice(0, 10));
}

export function TrialPeriodSection({
  control,
  errors,
  trialEnd,
  showExpiryAlert = true,
}: TrialPeriodSectionProps) {
  const firstChargeIso = addDaysIso(trialEnd, 1);
  const firstChargeLabel = firstChargeIso ? formatDate(firstChargeIso) : "—";
  const alertDateLabel = computeAlertDate(trialEnd);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <SectionHeading
        index={2}
        title="Trial period settings"
        subtitle="Trial-specific usage caps and expiry date. Hidden when Enterprise or Standard is selected."
      />
      <div className="mt-4 space-y-4">
        {showExpiryAlert && alertDateLabel ? (
          <InlineNotice tone="amber" title="7-day expiry alert configured">
            Fires automatically to Super Admin on {alertDateLabel}.
          </InlineNotice>
        ) : null}

        <InlineNotice tone="amber" title={COPY.trialAlertTitle}>
          {COPY.trialAlertBody}
        </InlineNotice>

        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            control={control}
            name="trial_end"
            render={({ field }) => (
              <FieldGroup
                id="trial_end"
                label="Trial expiry date"
                required
                hint="Stripe trial_end. Past billing alerts fire on expiry + 1 day. 7-day Super Admin alert fires automatically before expiry."
                error={errors.trial_end?.message}
              >
                <FormInput
                  id="trial_end"
                  type="date"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  hasError={Boolean(errors.trial_end)}
                />
              </FieldGroup>
            )}
          />

          <FieldGroup
            id="first_charge_preview"
            label="Post-trial first charge date"
            readOnly
            hint="Auto-calculated · trial expiry + 1 day · Read-only. Stripe charges this date on activation — no manual action."
          >
            <FormInput
              id="first_charge_preview"
              value={firstChargeLabel}
              readOnly
              tabIndex={-1}
              className="bg-slate-50 text-slate-700"
            />
          </FieldGroup>

          <Controller
            control={control}
            name="trial_image_limit"
            render={({ field }) => (
              <FieldGroup
                id="trial_image_limit"
                label="Trial image scan cap"
                required
                hint="Max images during trial period only. Writes to trial_image_limit. Scans are never blocked — 80%/100% alerts fire as per standard metering."
                error={errors.trial_image_limit?.message}
              >
                <FormInput
                  id="trial_image_limit"
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  placeholder="e.g. 50"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  hasError={Boolean(errors.trial_image_limit)}
                />
              </FieldGroup>
            )}
          />

          <Controller
            control={control}
            name="trial_video_limit"
            render={({ field }) => (
              <FieldGroup
                id="trial_video_limit"
                label="Trial video minutes cap"
                required
                hint="Max video minutes during trial period only. Writes to trial_video_limit. Same alert logic applies."
                error={errors.trial_video_limit?.message}
              >
                <FormInput
                  id="trial_video_limit"
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  placeholder="e.g. 20"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  hasError={Boolean(errors.trial_video_limit)}
                />
              </FieldGroup>
            )}
          />
        </div>

        <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-[11px] leading-relaxed text-sky-900">
          <strong>Limit switching:</strong> While trial active → metering uses{" "}
          <code className="font-mono text-[10px]">trial_image_limit</code> /{" "}
          <code className="font-mono text-[10px]">trial_video_limit</code>. After
          trial ends → metering switches automatically to{" "}
          <code className="font-mono text-[10px]">custom_image_limit</code> /{" "}
          <code className="font-mono text-[10px]">custom_video_limit</code>{" "}
          (Section 3). No manual action required.
        </div>
      </div>
    </section>
  );
}
