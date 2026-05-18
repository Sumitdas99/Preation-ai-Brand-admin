import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PathBFormSchema,
  type PathBFormValues,
} from "@/features/consent/forms/rplFormSchemas";
import type { RplSubmissionPathB } from "@/api/schemas/consent";
import { AuditFooter } from "../primitives/AuditFooter";
import type { RplSectionVM } from "../types";

interface Props {
  copy: RplSectionVM["pathBCopy"];
  organisationName: string;
  disabled: boolean;
  submitting: boolean;
  onSubmit: (body: RplSubmissionPathB) => void;
}

export function PathBForm({
  copy,
  organisationName,
  disabled,
  submitting,
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PathBFormValues>({
    resolver: zodResolver(PathBFormSchema),
    defaultValues: {
      consent_path: "B",
      timeline_note: "",
      declaration_confirmed: false,
    },
    mode: "onSubmit",
  });

  const note = watch("timeline_note") ?? "";
  const declarationConfirmed = watch("declaration_confirmed");
  const criteriaMet =
    note.trim().length >= copy.minChars && Boolean(declarationConfirmed);

  const declarationCopy = copy.declarationText.replace(
    "[Organisation]",
    organisationName,
  );

  return (
    <form
      onSubmit={handleSubmit((values) => {
        const body: RplSubmissionPathB = {
          consent_path: "B",
          timeline_note: values.timeline_note,
          declaration_confirmed: true,
        };
        onSubmit(body);
      })}
      className="space-y-4"
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {copy.step2Heading}
        </h2>
        {!criteriaMet ? (
          <span className="text-[11px] font-bold leading-none text-rose-700">
            Required
          </span>
        ) : null}
      </div>

      <section className="space-y-4 rounded-lg border border-amber-200/80 bg-amber-50/30 p-4">
        <div className="flex items-start gap-2 rounded-md bg-amber-100/60 px-3 py-2 text-xs leading-relaxed text-amber-900">
          <Info
            className="mt-[3px] h-3.5 w-3.5 shrink-0 text-amber-700"
            strokeWidth={2.5}
            aria-hidden
          />
          <span className="font-semibold">{copy.holdNotice}</span>
        </div>

        <div className="space-y-1.5">
          <FieldLabel label={copy.timelineLabel.toUpperCase()} />
          <textarea
            rows={5}
            disabled={disabled}
            placeholder={copy.timelinePlaceholder}
            {...register("timeline_note")}
            className={cn(
              "min-h-[7.5rem] w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400",
              "focus:border-amber-500 focus:outline-none focus:placeholder:text-transparent",
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
          />
          <p className="text-[11px] font-bold text-muted-foreground">
            {copy.timelineHelper}
          </p>
          {errors.timeline_note ? (
            <p className="text-xs font-medium text-rose-700">
              {String(errors.timeline_note.message)}
            </p>
          ) : null}
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 text-sm font-semibold leading-relaxed text-slate-700">
          <input
            type="checkbox"
            disabled={disabled}
            {...register("declaration_confirmed")}
            className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-amber-600 focus:ring-amber-300"
          />
          <span>{declarationCopy}</span>
        </label>
        {errors.declaration_confirmed ? (
          <p className="mt-1 text-xs font-medium text-rose-700">
            {String(errors.declaration_confirmed.message)}
          </p>
        ) : null}
      </section>

      <AuditFooter
        tone="amber"
        pendingHeading={copy.pendingHeading}
        pendingBody={copy.pendingBody}
        readyHeading={copy.readyHeading}
        readyBody={copy.readyBody}
        submitLabel={copy.submitLabel}
        submitting={submitting}
        submitDisabled={disabled || !criteriaMet}
      />
    </form>
  );
}

function FieldLabel({ label }: { label: string }) {
  return (
    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
      {label}
    </span>
  );
}
