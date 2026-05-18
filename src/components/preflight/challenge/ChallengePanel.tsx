import { Check, Info, X } from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { usePreFlightActions } from "@/features/preflight/actions/PreFlightActionsContext";
import {
  challengeFormDefaults,
  challengeFormSchema,
  type ChallengeFormDefaults,
  type ChallengeFormValues,
} from "@/features/preflight/forms/challengeFormSchema";
import type { ChallengePanelData } from "../types";
import { DeclarationCheckbox } from "./DeclarationCheckbox";
import { DetectionSummaryReadOnly } from "./DetectionSummaryReadOnly";
import { JustificationField } from "./JustificationField";

interface Props {
  data: ChallengePanelData;
}

export function ChallengePanel({ data }: Props) {
  const {
    challengePanelExpanded,
    setChallengePanelExpanded,
    submitChallenge,
    challengeSubmitting,
  } = usePreFlightActions();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChallengeFormDefaults>({
    resolver: zodResolver(challengeFormSchema) as Resolver<ChallengeFormDefaults>,
    defaultValues: challengeFormDefaults,
    mode: "onTouched",
  });

  if (!data.visible) return null;

  const justification = watch("justification") ?? "";
  const declarationConfirmed = Boolean(watch("declaration_confirmed"));
  const justificationMet =
    justification.trim().length >= data.minJustificationLength;
  const ready = justificationMet && declarationConfirmed;
  const submitEnabled = ready && !challengeSubmitting;

  const justificationField = register("justification");
  const declarationField = register("declaration_confirmed");

  return (
    <form
      onSubmit={handleSubmit((values) =>
        submitChallenge(values as ChallengeFormValues),
      )}
    >
      <header className="@container flex items-center justify-between gap-3 bg-[#E2E0F9] px-4 py-3">
        <span className="flex min-w-0 items-center gap-2 text-base font-bold text-[#3C3489]">
          {ready ? (
            <Check className="h-4 w-4 shrink-0" strokeWidth={3} aria-hidden />
          ) : (
            <Info
              className="h-4 w-4 shrink-0 text-[#534BB7]"
              strokeWidth={2.5}
              aria-hidden
            />
          )}
          <span>Challenge AI detection result</span>
        </span>
        <button
          type="button"
          onClick={() => setChallengePanelExpanded(false)}
          disabled={challengeSubmitting}
          className="hidden shrink-0 items-center gap-1 rounded-sm border border-[#534BB7]/30 bg-white px-2.5 py-1 text-sm font-bold text-[#3C3489]/70 transition-colors hover:bg-[#EEEDFE] hover:text-[#3C3489] disabled:cursor-not-allowed disabled:opacity-60 @[22rem]:inline-flex"
        >
          <X className="h-3 w-3" strokeWidth={3} aria-hidden />
          Collapse
        </button>
      </header>

      <div className="border-t border-[#534BB7]/25" />

      <div className="space-y-5 px-4 py-4">
        <DetectionSummaryReadOnly
          header={data.summaryHeader}
          rows={data.summaryRows}
        />

            <JustificationField
              label={data.justificationLabel}
              placeholder={data.justificationPlaceholder}
              minLength={data.minJustificationLength}
              currentLength={justification.length}
              disabled={challengeSubmitting}
              name={justificationField.name}
              ref={justificationField.ref}
              onBlur={justificationField.onBlur}
              onChange={justificationField.onChange}
            />

        <DeclarationCheckbox
          label={data.declarationLabel}
          checked={declarationConfirmed}
          disabled={challengeSubmitting}
          errorMessage={errors.declaration_confirmed?.message}
          name={declarationField.name}
          ref={declarationField.ref}
          onBlur={declarationField.onBlur}
          onChange={declarationField.onChange}
        />
      </div>

      <div className="border-t border-[#534BB7]/25" />

          <footer className="flex flex-col gap-3 bg-[#E2E0F9] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid flex-1 grid-cols-1 grid-rows-1">
              <p
                aria-hidden
                className="invisible col-start-1 row-start-1 text-sm font-semibold leading-relaxed"
              >
                {data.footerNoteReady}
              </p>
              <p
                aria-hidden
                className="invisible col-start-1 row-start-1 text-sm font-semibold leading-relaxed"
              >
                {data.footerNoteBlocked}
              </p>
              <p className="col-start-1 row-start-1 text-sm font-semibold leading-relaxed text-[#3C3489]/85">
                {ready ? data.footerNoteReady : data.footerNoteBlocked}
              </p>
            </div>
        <button
          type="submit"
          disabled={!submitEnabled}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold transition-colors",
            submitEnabled
              ? "bg-[#534BB7] text-white shadow-sm hover:bg-[#3C3489]"
              : "cursor-not-allowed border border-slate-300 bg-white text-slate-400",
          )}
        >
          {ready && !challengeSubmitting ? (
            <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
          ) : null}
          {challengeSubmitting ? "Submitting…" : data.submitLabel}
        </button>
      </footer>
    </form>
  );
}
