import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LEGAL_PREFLIGHT_COPY as COPY } from "@/features/legalReview/adapters/copy";
import {
  rejectFormDefaults,
  rejectFormSchema,
  REJECT_NOTES_MIN_CHARS,
  type RejectFormValues,
  type RejectableEngineId,
} from "@/features/legalReview/forms/legalFormSchemas";

const REJECT_DEFAULTS = { ...rejectFormDefaults, declaration_confirmed: true as const };

interface Props {
  onSubmit: (values: RejectFormValues) => void | Promise<void>;
  onCancel: () => void;
  busy: boolean;
  embedded?: boolean;
}

interface EngineCheckboxOption {
  id: RejectableEngineId | "PROVENANCE_DISABLED";
  label: string;
  subtext: string;
  disabled?: boolean;
  disabledNote?: string;
}

const ENGINE_OPTIONS: EngineCheckboxOption[] = [
  { id: "DISCLOSURE", label: COPY.rejectEngineDisclosureLabel, subtext: COPY.rejectEngineDisclosureSubtext },
  { id: "BRAND_SUITABILITY", label: COPY.rejectEngineBrandLabel, subtext: COPY.rejectEngineBrandSubtext },
  {
    id: "PROVENANCE_DISABLED",
    label: COPY.rejectEngineProvenanceLabel,
    subtext: COPY.rejectEngineProvenanceSubtext,
    disabled: true,
    disabledNote: COPY.rejectEngineProvenanceDisabledNote,
  },
];

export function LegalRejectInlineForm({ onSubmit, onCancel, busy, embedded = false }: Props) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RejectFormValues>({
    resolver: zodResolver(rejectFormSchema),
    defaultValues: REJECT_DEFAULTS,
  });

  const notesLen = (watch("rejection_notes") ?? "").trim().length;
  const notesMet = notesLen >= REJECT_NOTES_MIN_CHARS;
  const enginesMet = (watch("unlock_engines") ?? []).length > 0;
  const signatureMet = (watch("typed_signature") ?? "").trim().length > 0;
  const allMet = notesMet && enginesMet && signatureMet;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={embedded ? "" : "overflow-hidden rounded-lg border-[1.25px] border-slate-200 shadow-sm [contain:layout_paint]"}
    >
      <header className="flex items-start gap-3 bg-red-100 px-4 py-3">
        <XCircle className="mt-[3px] h-5 w-5 shrink-0 text-red-700" strokeWidth={2.5} aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-lg font-medium text-red-900">
              {COPY.rejectFormHeader}
            </h3>
            <span className="hidden shrink-0 text-sm font-bold text-red-900 sm:inline">
              {REJECT_NOTES_MIN_CHARS} characters minimum
            </span>
          </div>
          <p className="text-sm font-medium text-red-800/80">
            {COPY.rejectFormSubheader}
          </p>
        </div>
      </header>

      <div className="border-t border-red-300/40" />

      <div className="space-y-4 bg-red-50 px-6 py-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-foreground/85">
              {COPY.rejectNotesLabel}
            </span>
            {!notesMet && (
              <span className="text-xs font-bold text-red-600">
                {COPY.rejectNotesRequired}
              </span>
            )}
          </div>
          <textarea
            rows={4}
            placeholder={COPY.rejectNotesPlaceholder}
            {...register("rejection_notes")}
            aria-invalid={Boolean(errors.rejection_notes)}
            className={cn(
              "block min-h-[96px] w-full resize-y rounded-md border border-red-300 bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-900 shadow-sm placeholder:font-medium placeholder:text-slate-400",
              "focus:border-2 focus:border-red-500 focus:outline-none focus:ring-0 focus:placeholder:text-transparent",
              errors.rejection_notes && "border-red-400",
              busy && "cursor-not-allowed opacity-60",
            )}
          />
          <div className="flex justify-end text-xs font-bold text-slate-500">
            {notesMet
              ? `${notesLen} / ${REJECT_NOTES_MIN_CHARS} minimum, minimum met`
              : `${notesLen} / ${REJECT_NOTES_MIN_CHARS} minimum, ${Math.max(0, REJECT_NOTES_MIN_CHARS - notesLen)} more character${REJECT_NOTES_MIN_CHARS - notesLen === 1 ? "" : "s"} required`}
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-bold text-foreground/85">
            {COPY.rejectEnginesLabel}
          </span>

          <Controller
            control={control}
            name="unlock_engines"
            render={({ field }) => {
              const value = field.value as RejectableEngineId[];
              const toggle = (id: RejectableEngineId) => {
                const set = new Set(value);
                if (set.has(id)) set.delete(id);
                else set.add(id);
                field.onChange([...set]);
              };
              return (
                <div className="flex flex-wrap gap-2">
                  {ENGINE_OPTIONS.map((opt) => {
                    const isReal =
                      opt.id === "DISCLOSURE" || opt.id === "BRAND_SUITABILITY";
                    const checked = isReal && value.includes(opt.id);
                    return (
                      <EngineCard
                        key={opt.id}
                        label={opt.label}
                        subtext={opt.subtext}
                        checked={checked}
                        disabled={opt.disabled}
                        disabledNote={opt.disabledNote}
                        busy={busy}
                        onChange={() =>
                          isReal && toggle(opt.id as RejectableEngineId)
                        }
                      />
                    );
                  })}
                </div>
              );
            }}
          />
          {errors.unlock_engines && (
            <p className="text-[11px] font-medium text-red-600">
              {errors.unlock_engines.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground/85">
              {COPY.rejectTypedSignatureLabel}
            </span>
            {!signatureMet && (
              <span className="text-xs font-bold text-red-600">
                {COPY.rejectTypedSignatureRequired}
              </span>
            )}
          </div>
          <input
            type="text"
            placeholder={COPY.rejectTypedSignaturePlaceholder}
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

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={busy || !allMet}
            className="bg-red-600 font-extrabold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {COPY.rejectSubmitCta}
          </Button>
        </div>
      </div>
    </form>
  );
}

interface EngineCardProps {
  label: string;
  subtext: string;
  checked: boolean;
  disabled?: boolean;
  disabledNote?: string;
  busy: boolean;
  onChange: () => void;
}

function EngineCard({ label, subtext, checked, disabled, disabledNote, busy, onChange }: EngineCardProps) {
  return (
    <label
      className={cn(
        "flex min-w-[150px] flex-1 cursor-pointer items-start gap-2 rounded-md border px-3 py-2.5",
        disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60"
          : checked
            ? "border-red-400 bg-red-100/50"
            : "border-red-200 bg-white hover:bg-slate-50",
        busy && !disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <input
        type="checkbox"
        disabled={disabled || busy}
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "mt-[4px] flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border bg-white text-white transition-colors",
          disabled
            ? "border-slate-300 bg-slate-100"
            : checked
              ? "border-red-600 bg-red-600"
              : "border-[1.5px] border-red-300",
        )}
      >
        {checked ? (
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
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-1.5">
          <span className={cn("text-[15px] font-semibold", disabled ? "text-slate-400" : "text-foreground")}>
            {label}
          </span>
          {disabledNote && (
            <span className="text-[13px] font-medium text-slate-400">
              ({disabledNote})
            </span>
          )}
        </span>
        <span className={cn("mt-0.5 block text-[13px] font-medium leading-relaxed", disabled ? "text-slate-400" : "text-slate-600")}>
          {subtext}
        </span>
      </span>
    </label>
  );
}
