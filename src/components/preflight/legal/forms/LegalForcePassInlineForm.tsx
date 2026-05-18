import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LEGAL_PREFLIGHT_COPY as COPY } from "@/features/legalReview/adapters/copy";
import {
  forcePassFormDefaults,
  forcePassFormSchema,
  FORCE_PASS_COMMENTARY_MIN_CHARS,
  type ForcePassFormValues,
} from "@/features/legalReview/forms/legalFormSchemas";

interface Props {
  onSubmit: (values: ForcePassFormValues) => void | Promise<void>;
  onCancel: () => void;
  busy: boolean;
  embedded?: boolean;
}

export function LegalForcePassInlineForm({ onSubmit, onCancel, busy, embedded = false }: Props) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ForcePassFormValues>({
    resolver: zodResolver(forcePassFormSchema),
    defaultValues: forcePassFormDefaults,
  });

  const commentary = watch("commentary") ?? "";
  const commentaryLen = commentary.trim().length;
  const commentaryMet = commentaryLen >= FORCE_PASS_COMMENTARY_MIN_CHARS;
  const signatureMet = (watch("typed_signature") ?? "").trim().length > 0;
  const declarationMet = Boolean(watch("declaration_confirmed"));
  const allMet = commentaryMet && signatureMet && declarationMet;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={embedded ? "" : "overflow-hidden rounded-lg border-[1.25px] border-slate-200 shadow-sm [contain:layout_paint]"}>
      <header className="flex items-start gap-3 bg-red-100 px-4 py-3">
        <ShieldAlert className="mt-[3px] h-5 w-5 shrink-0 text-red-700" strokeWidth={2.5} aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-lg font-medium text-red-900">
              Force pass with mandatory commentary
            </h3>
            <span className="hidden shrink-0 text-sm font-bold text-red-900 sm:inline">
              {FORCE_PASS_COMMENTARY_MIN_CHARS} characters minimum
            </span>
          </div>
        </div>
      </header>

      <div className="border-t border-red-300/40" />

      <div className="space-y-3 bg-red-50 px-6 py-5">
        <div className="rounded-r-md border-l-4 border-l-red-600 bg-red-100/70 px-4 py-3">
          <p className="text-sm font-bold text-red-900">
            {COPY.forcePassTitle}
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-foreground/85">
              Override commentary
            </span>
            {!commentaryMet && (
              <span className="text-xs font-bold text-red-600">
                Required
              </span>
            )}
          </div>
          <textarea
            rows={4}
            placeholder="Document why standard attestation is being overridden…"
            {...register("commentary")}
            aria-invalid={Boolean(errors.commentary)}
            className={cn(
              "block min-h-[96px] w-full resize-y rounded-md border border-red-300 bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-900 shadow-sm placeholder:font-medium placeholder:text-slate-400",
              "focus:border-2 focus:border-red-500 focus:outline-none focus:ring-0 focus:placeholder:text-transparent",
              errors.commentary && "border-red-400",
              busy && "cursor-not-allowed opacity-60",
            )}
          />
          <div className="flex justify-end text-xs font-bold text-slate-500">
            {commentaryMet
              ? `${commentaryLen} / ${FORCE_PASS_COMMENTARY_MIN_CHARS} minimum, minimum met`
              : `${commentaryLen} / ${FORCE_PASS_COMMENTARY_MIN_CHARS} minimum, ${Math.max(0, FORCE_PASS_COMMENTARY_MIN_CHARS - commentaryLen)} more character${FORCE_PASS_COMMENTARY_MIN_CHARS - commentaryLen === 1 ? "" : "s"} required`}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground/85">
              Typed signature
            </span>
            {!signatureMet && (
              <span className="text-xs font-bold text-red-600">
                Required
              </span>
            )}
          </div>
          <input
            type="text"
            placeholder="Type your full legal name to confirm override"
            {...register("typed_signature")}
            aria-invalid={Boolean(errors.typed_signature)}
            className={cn(
              "block w-full rounded-md border border-red-300 bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-900 shadow-sm placeholder:font-medium placeholder:text-slate-400",
              "focus:border-2 focus:border-red-500 focus:outline-none focus:ring-0 focus:placeholder:text-transparent",
              errors.typed_signature && "border-red-400",
              busy && "cursor-not-allowed opacity-60",
            )}
          />
          {errors.typed_signature && (
            <p className="text-[11px] font-medium text-red-600">
              {errors.typed_signature.message}
            </p>
          )}
        </div>

        <Controller
          control={control}
          name="declaration_confirmed"
          render={({ field }) => (
            <label
              className={cn(
                "!mt-5 flex cursor-pointer items-start gap-3 rounded-md bg-red-100/70 px-4 py-3",
                errors.declaration_confirmed && "bg-red-50",
                busy && "cursor-not-allowed opacity-60",
              )}
            >
              <input
                ref={field.ref}
                name={field.name}
                type="checkbox"
                checked={Boolean(field.value)}
                onChange={(e) => field.onChange(e.target.checked)}
                onBlur={field.onBlur}
                disabled={busy}
                className="peer sr-only"
              />
              <span
                aria-hidden
                className={cn(
                  "mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-red-300 bg-white text-white transition-colors",
                  "peer-checked:border-red-600 peer-checked:bg-red-600",
                  "peer-disabled:cursor-not-allowed peer-disabled:opacity-60",
                  errors.declaration_confirmed && "border-red-400",
                )}
              >
                {field.value ? (
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
              <span className="select-none text-sm font-semibold leading-relaxed text-foreground">
                {COPY.forcePassDeclaration}
              </span>
            </label>
          )}
        />
        {errors.declaration_confirmed && (
          <p className="text-xs text-red-600">
            {errors.declaration_confirmed.message}
          </p>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            size="default"
            disabled={busy || !allMet}
            className="bg-red-600 font-extrabold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {COPY.forcePassSubmitCta}
          </Button>
        </div>
      </div>
    </form>
  );
}
