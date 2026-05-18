import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PathCFormSchema,
  type PathCFormValues,
} from "@/features/consent/forms/rplFormSchemas";
import type { RplSubmissionPathC } from "@/api/schemas/consent";
import { AuditFooter } from "../primitives/AuditFooter";
import type { RplSectionVM } from "../types";

interface Props {
  copy: RplSectionVM["pathCCopy"];
  organisationName: string;
  disabled: boolean;
  submitting: boolean;
  onSubmit: (body: RplSubmissionPathC) => void;
}

export function PathCForm({
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
  } = useForm<PathCFormValues>({
    resolver: zodResolver(PathCFormSchema),
    defaultValues: {
      consent_path: "C",
      reason: "",
      declaration_confirmed: false,
    },
    mode: "onSubmit",
  });

  const reason = watch("reason") ?? "";
  const declarationConfirmed = watch("declaration_confirmed");
  const criteriaMet =
    reason.trim().length >= copy.minChars && Boolean(declarationConfirmed);

  const declarationCopy = copy.declarationText.replace(
    "[Organisation]",
    organisationName,
  );
  const orgHighlighted = declarationCopy
    .split(organisationName)
    .reduce<React.ReactNode[]>((acc, chunk, idx, arr) => {
      acc.push(<span key={`txt-${idx}`}>{chunk}</span>);
      if (idx < arr.length - 1) {
        acc.push(
          <strong key={`org-${idx}`} className="font-bold text-slate-900">
            {organisationName}
          </strong>,
        );
      }
      return acc;
    }, []);

  return (
    <form
      onSubmit={handleSubmit((values) => {
        const body: RplSubmissionPathC = {
          consent_path: "C",
          reason: values.reason,
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

      <section className="space-y-4 rounded-lg border border-rose-300/70 bg-rose-50/40 p-4">
        <div className="rounded-md bg-rose-100/60 px-3 py-3 text-rose-900">
          <div className="flex items-start gap-2">
            <AlertTriangle
              className="mt-[3px] h-4 w-4 shrink-0 text-rose-700"
              strokeWidth={2.5}
              aria-hidden
            />
            <div className="flex-1 space-y-2">
              <p className="text-sm font-bold leading-snug">
                {copy.warningTitle}
              </p>
              <p className="text-xs font-semibold leading-relaxed">
                {copy.warningBody}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <FieldLabel label={copy.reasonLabel.toUpperCase()} />
          <textarea
            rows={6}
            disabled={disabled}
            placeholder={copy.reasonPlaceholder}
            {...register("reason")}
            className={cn(
              "min-h-[9rem] w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400",
              "focus:border-rose-500 focus:outline-none focus:placeholder:text-transparent",
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
          />
          <p className="text-[11px] font-bold text-muted-foreground">
            {copy.reasonHelper}
          </p>
          {errors.reason ? (
            <p className="text-xs font-medium text-rose-700">
              {String(errors.reason.message)}
            </p>
          ) : null}
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 text-sm font-semibold leading-relaxed text-slate-700">
          <input
            type="checkbox"
            disabled={disabled}
            {...register("declaration_confirmed")}
            className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-rose-600 focus:ring-rose-300"
          />
          <span>{orgHighlighted}</span>
        </label>
        {errors.declaration_confirmed ? (
          <p className="mt-1 text-xs font-medium text-rose-700">
            {String(errors.declaration_confirmed.message)}
          </p>
        ) : null}
      </section>

      <AuditFooter
        tone="rose"
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
