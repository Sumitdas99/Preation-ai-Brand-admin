import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AcceptFlaggedForm } from "./AcceptFlaggedForm";
import { BlockedNoteCallout } from "./BlockedNoteCallout";
import { SectionHeader } from "./SectionHeader";
import type { ReviewerActionsView, WithdrawalRecordView } from "./types";
import type { AcceptFlaggedFormValues } from "@/features/suitability/forms/suitabilityFormSchemas";

interface Props {
  data: ReviewerActionsView;
  copy: {
    headerLabel: string;
    notesPlaceholder: string;
    declarationLabel: string;
    backCta: string;
    withdrawCta: string;
    withdrawCtaSubmitting: string;
    acceptCta: string;
    acceptCtaSubmitting: string;
  };
  acceptFormId: string;
  onSubmitAccept: (values: AcceptFlaggedFormValues) => void;
  onWithdraw: () => void;
  onBack: () => void;
  acceptSubmitting: boolean;
  withdrawSubmitting: boolean;
  withdrawalRecord?: WithdrawalRecordView;
}

export function ReviewerActionsPanel({
  data,
  copy,
  acceptFormId,
  onSubmitAccept,
  onWithdraw,
  onBack,
  acceptSubmitting,
  withdrawSubmitting,
  withdrawalRecord,
}: Props) {
  const [declarationConfirmed, setDeclarationConfirmed] = useState(false);

  if (!data.visible && withdrawalRecord) {
    return (
      <section className="rounded-md border bg-card">
        <div className="border-b px-4 py-2">
          <SectionHeader title={copy.headerLabel} tone="flagged" />
        </div>
        <div className="space-y-4 p-4">
          <WithdrawalRecordCard record={withdrawalRecord} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className="gap-1 bg-slate-200 pl-2.5 pr-3.5 font-semibold text-slate-700 hover:bg-slate-300 hover:text-slate-900"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2.5} aria-hidden />
              {copy.backCta}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const acceptDisabled =
    !data.canAcceptFlagged ||
    acceptSubmitting ||
    data.alreadyAccepted ||
    !declarationConfirmed;
  const withdrawDisabled = !data.canWithdraw || withdrawSubmitting;

  const acceptDisabledTooltip = data.alreadyAccepted
    ? data.acceptDisabledReason
    : !data.canAcceptFlagged
      ? data.acceptDisabledReason
      : !declarationConfirmed
        ? "Confirm the reviewer declaration to proceed."
        : undefined;

  return (
    <section className="rounded-md border bg-card">
      <div className="border-b px-4 py-2">
        <SectionHeader title={copy.headerLabel} tone="flagged" />
      </div>
      <div className="space-y-4 p-4">
        {data.blockedNote ? <BlockedNoteCallout data={data.blockedNote} /> : null}

        <AcceptFlaggedForm
          formId={acceptFormId}
          heading={data.acceptHeading}
          notesPlaceholder={copy.notesPlaceholder}
          declarationLabel={copy.declarationLabel}
          systemCaption={data.acceptanceSystemCaption}
          disabled={acceptSubmitting || data.alreadyAccepted}
          onSubmit={onSubmitAccept}
          onDeclarationChange={setDeclarationConfirmed}
          acceptanceRecord={data.acceptanceRecord}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            disabled={acceptSubmitting || withdrawSubmitting}
            className="gap-1 bg-slate-200 pl-2.5 pr-3.5 font-semibold text-slate-700 hover:bg-slate-300 hover:text-slate-900"
          >
            <ChevronLeft
              className="h-4 w-4"
              strokeWidth={2.5}
              aria-hidden
            />
            {copy.backCta}
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onWithdraw}
              disabled={withdrawDisabled}
              className={cn(
                "font-bold",
                data.canWithdraw &&
                  "border-[#e63535] bg-[#e63535] text-white hover:border-[#cc2c2c] hover:bg-[#cc2c2c] hover:text-white",
              )}
              title={
                data.alreadyWithdrawn
                  ? "Asset has already been withdrawn."
                  : undefined
              }
            >
              {withdrawSubmitting ? copy.withdrawCtaSubmitting : copy.withdrawCta}
            </Button>
            <Button
              type="submit"
              form={acceptFormId}
              disabled={acceptDisabled}
              title={acceptDisabledTooltip}
              className="px-6 font-bold shadow-sm"
            >
              {acceptSubmitting ? copy.acceptCtaSubmitting : copy.acceptCta}
            </Button>
          </div>
        </div>
        {data.withdrawalSystemCaption ? (
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {data.withdrawalSystemCaption}
          </p>
        ) : null}
      </div>
    </section>
  );
}

interface WithdrawalRecordCardProps {
  record: WithdrawalRecordView;
  className?: string;
}

function WithdrawalRecordCard({ record, className }: WithdrawalRecordCardProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-slate-50 px-3.5 py-3 text-sm",
        className,
      )}
    >
      <p className="font-semibold text-slate-900">
        Withdrawn by{" "}
        <span className="font-bold">{record.withdrawnBy}</span>
        <span className="font-semibold text-slate-600">
          , {record.withdrawnAtLabel}
        </span>
      </p>
      {record.reason ? (
        <p className="mt-2 whitespace-pre-line font-semibold text-slate-800">
          {record.reason}
        </p>
      ) : (
        <p className="mt-2 font-semibold italic text-slate-600">
          No reason recorded.
        </p>
      )}
    </div>
  );
}
