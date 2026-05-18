import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LEGAL_PREFLIGHT_COPY as COPY } from "@/features/legalReview/adapters/copy";
import {
  approveAttestFormDefaults,
  approveAttestFormSchema,
  type ApproveAttestFormValues,
} from "@/features/legalReview/forms/legalFormSchemas";
import type { LegalApprovePreview } from "../../types";

interface Props {
  preview: LegalApprovePreview;
  locked: boolean;
  pendingItemsCount?: number;
  cleanCase?: boolean;
  embedded?: boolean;
  onSubmit: (values: ApproveAttestFormValues) => void | Promise<void>;
  busy: boolean;
}

export function LegalApproveAttestForm({
  preview,
  locked,
  pendingItemsCount = 0,
  cleanCase = false,
  embedded = false,
  onSubmit,
  busy,
}: Props) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ApproveAttestFormValues>({
    resolver: zodResolver(approveAttestFormSchema),
    defaultValues: approveAttestFormDefaults,
  });

  const signatureMet = (watch("typed_signature") ?? "").trim().length > 0;
  const declarationMet = Boolean(watch("declaration_confirmed"));
  const allMet = signatureMet && declarationMet;

  if (locked) {
    return (
      <section className="rounded-md border border-slate-200 bg-slate-50/60 p-5">
        <header className="mb-1.5 flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" aria-hidden />
          <h3 className="text-[13px] font-bold text-muted-foreground">
            {COPY.approveLockedTitle(pendingItemsCount)}
          </h3>
        </header>
        <p className="mb-4 text-[12.5px] leading-relaxed text-muted-foreground">
          {COPY.approveLockedDescription(pendingItemsCount)}
        </p>
        <div className="flex justify-end">
          <Button
            type="button"
            size="default"
            disabled
            className="bg-slate-200 text-slate-500 hover:bg-slate-200"
          >
            {COPY.approveSubmitCta}
          </Button>
        </div>
      </section>
    );
  }

  const activeTitle = cleanCase
    ? COPY.approveActiveTitleClean
    : COPY.approveActiveTitleResolved;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={embedded ? "" : "overflow-hidden rounded-lg border-[1.25px] border-slate-200 shadow-sm [contain:layout_paint]"}>
      <header className="flex items-start gap-3 bg-emerald-100 px-4 py-3">
        <CheckCircle2 className="mt-[3px] h-5 w-5 shrink-0 text-emerald-700" strokeWidth={2.5} aria-hidden />
        <h3 className="text-lg font-medium text-emerald-900">
          {activeTitle}
        </h3>
      </header>

      <div className="border-t border-emerald-300/40" />

      <div className="space-y-3 bg-emerald-50 px-6 py-5">
        <div className="grid gap-3 rounded-md border border-emerald-200 bg-white px-4 py-3 sm:grid-cols-2">
          <PreviewField label={COPY.approveAssetLabel} value={preview.asset} />
          <PreviewField
            label={COPY.approveApprovalIdLabel}
            value={preview.approvalId}
            mono
          />
          <PreviewField label={COPY.approveWorkspaceLabel} value={preview.workspace} />
          <PreviewField
            label={COPY.approveAttestationTimestampLabel}
            value={COPY.approveAttestationTimestampValue}
            muted
          />
        </div>

        <div className="space-y-1.5 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground/85">
              {COPY.approveTypedSignatureLabel}
            </span>
            {!signatureMet && (
              <span className="text-xs font-bold text-red-600">
                {COPY.approveTypedSignatureRequired}
              </span>
            )}
          </div>
          <input
            type="text"
            placeholder={COPY.approveTypedSignaturePlaceholder}
            {...register("typed_signature")}
            aria-invalid={Boolean(errors.typed_signature)}
            className={cn(
              "block w-full rounded-md border border-emerald-300 bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-900 shadow-sm placeholder:font-medium placeholder:text-slate-400",
              "focus:border-2 focus:border-emerald-500 focus:outline-none focus:ring-0 focus:placeholder:text-transparent",
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

        <div className="space-y-1.5 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground/85">
              {COPY.approveOverrideCommentaryLabel}
            </span>
            <span className="text-xs font-bold text-slate-500">
              {COPY.approveOverrideCommentaryHint}
            </span>
          </div>
          <textarea
            rows={3}
            placeholder={COPY.approveOverrideCommentaryPlaceholder}
            {...register("notes")}
            className={cn(
              "block min-h-[72px] w-full resize-y rounded-md border border-emerald-300 bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-900 shadow-sm placeholder:font-medium placeholder:text-slate-400",
              "focus:border-2 focus:border-emerald-500 focus:outline-none focus:ring-0 focus:placeholder:text-transparent",
              busy && "cursor-not-allowed opacity-60",
            )}
          />
        </div>

        <Controller
          control={control}
          name="declaration_confirmed"
          render={({ field }) => (
            <label
              className={cn(
                "!mt-5 flex cursor-pointer items-start gap-3 rounded-md bg-emerald-100/70 px-4 py-3",
                errors.declaration_confirmed && "bg-emerald-50",
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
                  "mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-emerald-300 bg-white text-white transition-colors",
                  "peer-checked:border-emerald-600 peer-checked:bg-emerald-600",
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
                {COPY.approveDeclaration}
              </span>
            </label>
          )}
        />
        {errors.declaration_confirmed && (
          <p className="text-xs text-red-600">
            {errors.declaration_confirmed.message}
          </p>
        )}

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-stretch">
          <div className="min-w-0 flex-1 rounded-md bg-emerald-100/70 px-4 py-3">
            <p className="text-sm font-bold text-emerald-900">
              {COPY.approveSubmitFooter}
            </p>
          </div>
          <Button
            type="submit"
            disabled={busy || !allMet}
            className="h-auto gap-1.5 bg-emerald-600 px-5 py-3 text-[15px] font-extrabold text-white hover:bg-emerald-700 disabled:opacity-50 sm:self-stretch"
          >
            <CheckCircle2 className="h-5 w-5" strokeWidth={2.5} aria-hidden />
            {COPY.approveSubmitCta}
          </Button>
        </div>
      </div>
    </form>
  );
}

function PreviewField({
  label,
  value,
  muted,
  mono,
}: {
  label: string;
  value: string;
  muted?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
        {label}
      </p>
      <p
        className={cn(
          "truncate text-sm font-bold text-foreground",
          mono && "font-mono",
          muted && "font-bold text-foreground",
        )}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}
