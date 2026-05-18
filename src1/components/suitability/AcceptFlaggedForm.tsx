import { forwardRef, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  acceptFlaggedFormDefaults,
  acceptFlaggedFormSchema,
  type AcceptFlaggedFormDefaults,
  type AcceptFlaggedFormValues,
} from "@/features/suitability/forms/suitabilityFormSchemas";
import { cn } from "@/lib/utils";

interface Props {
  formId: string;
  heading: string;
  notesPlaceholder: string;
  declarationLabel: string;
  systemCaption: string;
  disabled: boolean;
  onSubmit: (values: AcceptFlaggedFormValues) => void;
  onDeclarationChange?: (confirmed: boolean) => void;
  acceptanceRecord?: {
    acceptedAtLabel: string;
    acceptedBy: string;
    notes?: string;
  };
}

export const AcceptFlaggedForm = forwardRef<HTMLFormElement, Props>(
  function AcceptFlaggedForm(
    {
      formId,
      heading,
      notesPlaceholder,
      declarationLabel,
      systemCaption,
      disabled,
      onSubmit,
      onDeclarationChange,
      acceptanceRecord,
    },
    ref,
  ) {
    const {
      register,
      handleSubmit,
      watch,
      formState: { errors },
    } = useForm<AcceptFlaggedFormDefaults>({
      resolver: zodResolver(
        acceptFlaggedFormSchema,
      ) as Resolver<AcceptFlaggedFormDefaults>,
      defaultValues: acceptFlaggedFormDefaults,
      mode: "onTouched",
    });

    const declarationConfirmed = watch("declaration_confirmed") ?? false;

    useEffect(() => {
      onDeclarationChange?.(declarationConfirmed);
    }, [declarationConfirmed, onDeclarationChange]);

    if (acceptanceRecord) {
      return (
        <section className="rounded-md bg-emerald-50/60 p-4">
          <h4 className="text-[14px] font-extrabold uppercase tracking-wider text-emerald-800">
            {heading}
          </h4>
          <p className="mt-2 text-sm font-semibold text-emerald-900">
            <span className="font-bold">{acceptanceRecord.acceptedBy}</span>
            <span className="font-semibold text-emerald-900/75">
              , {acceptanceRecord.acceptedAtLabel}
            </span>
          </p>
          {acceptanceRecord.notes ? (
            <p className="mt-2 whitespace-pre-line text-sm font-semibold text-emerald-900/90">
              {acceptanceRecord.notes}
            </p>
          ) : (
            <p className="mt-2 text-sm font-semibold italic text-emerald-900/70">
              No reviewer notes recorded.
            </p>
          )}
        </section>
      );
    }

    const notesField = register("notes");
    const declarationField = register("declaration_confirmed");
    const declarationInputId = `${formId}-declaration`;

    return (
      <form
        ref={ref}
        id={formId}
        onSubmit={handleSubmit((values) => {
          onSubmit(values as AcceptFlaggedFormValues);
        })}
        className="space-y-4"
      >
        <div>
          <h4 className="text-[14px] font-extrabold uppercase tracking-wider text-foreground/80">
            {heading}
          </h4>
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${formId}-notes`} className="sr-only">
            Reviewer notes
          </label>
          <textarea
            id={`${formId}-notes`}
            {...notesField}
            placeholder={notesPlaceholder}
            disabled={disabled}
            rows={4}
            className={cn(
              "block min-h-[96px] w-full resize-y rounded-md border-2 border-slate-300 bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-900 placeholder:font-medium placeholder:text-slate-400",
              "focus:border-blue-500 focus:outline-none focus:ring-0 focus:ring-offset-0 focus:placeholder:text-transparent",
              errors.notes && "border-red-400",
              disabled && "cursor-not-allowed opacity-60",
            )}
          />
          {errors.notes ? (
            <p className="text-[11px] font-medium text-red-600">
              {errors.notes.message}
            </p>
          ) : null}
        </div>

        <label
          htmlFor={declarationInputId}
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-md bg-muted/30 px-4 py-3",
            errors.declaration_confirmed && "bg-red-50",
            disabled && "cursor-not-allowed opacity-60",
          )}
        >
          <input
            id={declarationInputId}
            type="checkbox"
            {...declarationField}
            disabled={disabled}
            className="peer sr-only"
            aria-describedby={`${formId}-declaration-error`}
          />
          <span
            aria-hidden
            className={cn(
              "mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-slate-400 bg-white text-white transition-colors",
              "peer-checked:border-[#0f1d3b] peer-checked:bg-[#0f1d3b]",
              "peer-disabled:cursor-not-allowed peer-disabled:opacity-60",
              errors.declaration_confirmed && "border-red-400",
            )}
          >
            {declarationConfirmed ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3 w-3"
              >
                <path d="M4 13.5l5 5L21 5" />
              </svg>
            ) : null}
          </span>
          <span className="text-sm font-semibold leading-relaxed text-foreground">
            {declarationLabel}
          </span>
        </label>
        {errors.declaration_confirmed ? (
          <p
            id={`${formId}-declaration-error`}
            className="text-xs text-red-600"
          >
            {errors.declaration_confirmed.message}
          </p>
        ) : null}

        {systemCaption ? (
          <p className="rounded-md bg-muted/40 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
            {systemCaption}
          </p>
        ) : null}
      </form>
    );
  },
);
