import { Controller, useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  HumanPresenceFormSchema,
  type HumanPresenceFormValues,
} from "@/features/consent/forms/humanPresenceFormSchema";
import type { HumanPresenceSubmission } from "@/api/schemas/consent";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuditFooter } from "../primitives/AuditFooter";
import type { HumanPresenceSectionVM } from "../types";

interface Props {
  data: HumanPresenceSectionVM;
  organisationName: string;
  disabled: boolean;
  submitting: boolean;
  onSubmit: (body: HumanPresenceSubmission) => void;
}

export function HumanPresenceForm({
  data,
  organisationName,
  disabled,
  submitting,
  onSubmit,
}: Props) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<HumanPresenceFormValues>({
    resolver: zodResolver(HumanPresenceFormSchema),
    defaultValues: {
      person_count_confirmed: data.estimatedPersonCount || 1,
      notes: "",
      declaration_confirmed: false,
    },
  });

  const consentType = watch("consent_type");
  const notes = watch("notes");
  const declarationConfirmed = watch("declaration_confirmed");
  const selectedOption = data.consentTypeOptions.find(
    (o) => o.value === consentType,
  );
  const showUgcNotice = Boolean(selectedOption?.triggersUgcNotice);
  const notesRequired = Boolean(selectedOption?.requiresNotes);
  const consentTypeMissing = !consentType;
  const notesMissing = notesRequired && !notes?.trim();

  const declarationCopy = data.declarationText.replace(
    "[Organisation Name]",
    organisationName,
  );
  const orgHighlighted = declarationCopy
    .split(organisationName)
    .reduce<React.ReactNode[]>((acc, chunk, idx, arr) => {
      acc.push(<span key={`txt-${idx}`}>{chunk}</span>);
      if (idx < arr.length - 1) {
        acc.push(
          <strong key={`org-${idx}`} className="font-semibold text-slate-900">
            {organisationName}
          </strong>,
        );
      }
      return acc;
    }, []);

  return (
    <form
      onSubmit={handleSubmit((values) =>
        onSubmit({
          person_count_confirmed: values.person_count_confirmed,
          consent_type: values.consent_type,
          notes: values.notes?.trim() ? values.notes : undefined,
          declaration_confirmed: true,
        }),
      )}
      className="space-y-4"
    >
      <PresenceAlert title={data.alertTitle} body={data.alertBody} />

      <PersonCountField
        estimated={data.estimatedPersonCount}
        correctionNote={data.countCorrectionNote}
        disabled={disabled}
        register={register("person_count_confirmed", { valueAsNumber: true })}
        error={errors.person_count_confirmed?.message}
      />

      <div className="space-y-1.5">
        <FieldLabel
          label={data.consentTypeLabel.toUpperCase()}
          required={consentTypeMissing}
        />
        <Controller
          control={control}
          name="consent_type"
          render={({ field }) => (
            <Select
              disabled={disabled}
              value={field.value ?? ""}
              onValueChange={field.onChange}
            >
              <SelectTrigger
                ref={field.ref}
                onBlur={field.onBlur}
                className={cn(
                  "h-10 w-full rounded-md border-slate-300 bg-white text-sm font-semibold text-slate-900",
                  "focus:border-amber-500 focus:outline-none focus:ring-0 focus:ring-offset-0",
                  "data-[placeholder]:font-semibold data-[placeholder]:text-slate-500",
                )}
              >
                <SelectValue placeholder="Select consent type…" />
              </SelectTrigger>
              <SelectContent className="rounded-md">
                {data.consentTypeOptions.map((o) => (
                  <SelectItem
                    key={o.value}
                    value={o.value}
                    className="font-semibold text-slate-900 focus:text-slate-900"
                  >
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.consent_type ? (
          <p className="text-xs font-medium text-rose-700">
            {String(errors.consent_type.message)}
          </p>
        ) : null}
      </div>

      {showUgcNotice ? <UgcNotice text={data.ugcNotice} /> : null}

      <div className="space-y-1.5">
        <FieldLabel
          label={data.notesLabel.toUpperCase()}
          required={notesMissing}
        />
        <textarea
          rows={3}
          disabled={disabled}
          placeholder={
            notesRequired
              ? data.notesPlaceholder
              : `${data.notesPlaceholder.replace(/\.$/, "")} (optional).`
          }
          {...register("notes")}
          className={cn(
            "min-h-[88px] w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400",
            "focus:border-amber-500 focus:outline-none focus:placeholder:text-transparent",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        />
        {errors.notes ? (
          <p className="text-xs font-medium text-rose-700">
            {String(errors.notes.message)}
          </p>
        ) : null}
      </div>

      <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-md bg-slate-50/40 px-3 py-2.5 text-sm font-semibold leading-relaxed text-slate-700">
        <input
          type="checkbox"
          disabled={disabled}
          {...register("declaration_confirmed")}
          className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-amber-600 focus:ring-amber-300"
        />
        <span>{orgHighlighted}</span>
      </label>
      {errors.declaration_confirmed ? (
        <p className="mt-1 text-xs font-medium text-rose-700">
          {String(errors.declaration_confirmed.message)}
        </p>
      ) : null}

      <AuditFooter
        tone="amber"
        pendingHeading={data.pendingHeading}
        pendingBody={data.pendingBody}
        readyHeading={data.readyHeading}
        readyBody={data.readyBody}
        submitLabel={data.submitLabel}
        submitting={submitting}
        submitDisabled={disabled || !declarationConfirmed}
      />
    </form>
  );
}

function PresenceAlert({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex gap-3 rounded-lg border border-amber-300/80 bg-amber-50/70 px-4 py-3">
      <AlertTriangle
        className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
        strokeWidth={2.5}
        aria-hidden
      />
      <p className="text-sm font-semibold leading-relaxed text-amber-900/85">
        <strong className="font-bold text-amber-950">{title}</strong> {body}
      </p>
    </div>
  );
}

interface PersonCountFieldProps {
  estimated: number;
  correctionNote: string;
  disabled: boolean;
  register: UseFormRegisterReturn;
  error?: string;
}

function PersonCountField({
  estimated,
  correctionNote,
  disabled,
  register,
  error,
}: PersonCountFieldProps) {
  const unit = estimated === 1 ? "individual" : "individuals";
  return (
    <div className="space-y-1.5">
      <div className="flex items-stretch gap-3 rounded-lg border border-amber-200/80 bg-amber-50/40 px-4 py-3">
        <p className="flex-1 text-sm font-semibold leading-relaxed text-amber-900/85">
          Our system detected approximately{" "}
          <strong className="font-bold text-amber-950">
            {estimated} unique {unit}
          </strong>{" "}
          in this asset. {correctionNote}
        </p>
        <label className="flex shrink-0 items-center">
          <span className="sr-only">Confirmed person count</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            disabled={disabled}
            {...register}
            className={cn(
              "h-12 w-16 rounded-md border border-amber-300 bg-white text-center text-base font-semibold text-amber-950 caret-transparent",
              "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
              "focus:outline-none focus:ring-2 focus:ring-amber-400",
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
          />
        </label>
      </div>
      {error ? (
        <p className="text-xs font-medium text-rose-700">{String(error)}</p>
      ) : null}
    </div>
  );
}

function UgcNotice({ text }: { text: string }) {
  return (
    <div className="rounded-r-md border-l-4 border-l-amber-600 bg-amber-50 p-4">
      <p className="text-sm font-semibold leading-relaxed text-amber-900/85">
        <strong className="font-bold text-amber-950">Note:</strong> {text}
      </p>
    </div>
  );
}

function FieldLabel({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
        {label}
      </span>
      {required ? (
        <span className="text-[11px] font-bold leading-none text-rose-700">
          Required
        </span>
      ) : null}
    </div>
  );
}
