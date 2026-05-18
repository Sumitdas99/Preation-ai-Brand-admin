import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import type { PackConfigFormValues } from "@/features/billing/forms/packConfigFormSchema";
import { addDaysIso, formatDate } from "@/features/billing/adapters/format";
import { SectionHeading } from "../primitives/SectionHeading";
import { FieldGroup, FormInput } from "../primitives/FieldGroup";
import { DatePicker } from "../primitives/DatePicker";

interface TrialPeriodSectionProps {
  control: Control<PackConfigFormValues>;
  trialEnd?: string;
}

export function TrialPeriodSection({
  control,
  trialEnd,
}: TrialPeriodSectionProps) {
  const firstChargeIso = addDaysIso(trialEnd, 1);
  const firstChargeLabel = firstChargeIso ? formatDate(firstChargeIso) : "—";

  return (
    <section className="overflow-hidden rounded-lg border-[1.25px] border-slate-200 bg-card shadow-sm">
      <SectionHeading
        index={2}
        title="Trial period settings"
        subtitle="Configure the trial window duration and usage caps for this brand."
      />
      <div className="px-6 py-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            control={control}
            name="trial_end"
            render={({ field }) => (
              <FieldGroup
                id="trial_end"
                label="Trial expiry date"
                required
                filled={Boolean(field.value)}
                hint="A reminder is sent automatically 7 days before expiry"
              >
                <DatePicker
                  id="trial_end"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Pick trial end date"
                />
              </FieldGroup>
            )}
          />

          <FieldGroup
            id="first_charge_preview"
            label="Post-trial first charge date"
            hint="Auto-calculated as one day after trial expiry"
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
                filled={Boolean(field.value)}
                hint="Usage alerts fire at 80% and 100% of this cap"
              >
                <FormInput
                  id="trial_image_limit"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="e.g. 50"
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
                filled={Boolean(field.value)}
                hint="Usage alerts fire at 80% and 100% of this cap"
              >
                <FormInput
                  id="trial_video_limit"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="e.g. 20"
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
            )}
          />
        </div>
      </div>
    </section>
  );
}
