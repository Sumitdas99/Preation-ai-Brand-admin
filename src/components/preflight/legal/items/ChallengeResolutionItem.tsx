import { cn } from "@/lib/utils";
import { LEGAL_PREFLIGHT_COPY as COPY } from "@/features/legalReview/adapters/copy";
import type { LegalChallengeItem } from "../../types";
import { NumberedItemShell } from "./NumberedItemShell";

interface Props {
  index: number;
  item: LegalChallengeItem;
  onAccept: () => void;
  onReject: () => void;
  busy: boolean;
}

export function ChallengeResolutionItem({
  index,
  item,
  onAccept,
  onReject,
  busy,
}: Props) {
  return (
    <NumberedItemShell
      index={index}
      title={COPY.itemChallengeTitle}
      tone="indigo"
      resolved={item.resolved}
      resolvedLabel={item.resolvedLabel}
    >
      {item.resolved ? (
        <ResolvedSummary item={item} />
      ) : (
        <PendingForm item={item} onAccept={onAccept} onReject={onReject} busy={busy} />
      )}
    </NumberedItemShell>
  );
}

function ResolvedSummary({ item }: { item: LegalChallengeItem }) {
  return (
    <div className="space-y-2 text-[13px] text-emerald-900/85">
      <p className="text-[12px] font-semibold uppercase tracking-wider text-emerald-900/70">
        {COPY.itemChallengeReviewerJustificationLabel}
      </p>
      {item.reviewerJustification && (
        <p className="italic leading-relaxed">&ldquo;{item.reviewerJustification}&rdquo;</p>
      )}
      <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700/85">
        Submitted by {item.submittedByName ?? "Reviewer"}
        {item.submittedAtLabel ? ` · ${item.submittedAtLabel}` : ""}
      </p>
    </div>
  );
}

function PendingForm({
  item,
  onAccept,
  onReject,
  busy,
}: {
  item: LegalChallengeItem;
  onAccept: () => void;
  onReject: () => void;
  busy: boolean;
}) {
  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <span className="inline-flex max-w-full items-center rounded-md bg-indigo-600 px-3 py-1.5">
          <code
            className="truncate font-mono text-sm font-semibold uppercase tracking-wider text-white"
            title={item.enumValue}
          >
            {item.enumValue}
          </code>
        </span>
        <p className="text-right text-sm font-bold leading-relaxed text-indigo-900">
          {item.submittedAtLabel
            ? `Submitted: ${item.submittedAtLabel} by ${item.submittedByName ?? "Reviewer"}`
            : `Submitted by ${item.submittedByName ?? "Reviewer"}`}
        </p>
      </header>

      <div>
        <h4 className="mb-1 text-sm font-semibold uppercase tracking-wider text-indigo-900">
          {COPY.itemChallengeReviewerJustificationLabel}
        </h4>
        {item.reviewerJustification && (
          <div className="rounded-md border-2 border-indigo-200 bg-white px-4 py-3">
            <p className="text-sm font-bold italic leading-relaxed text-indigo-900">
              &ldquo;{item.reviewerJustification}&rdquo;
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 rounded-md bg-indigo-100 px-4 py-3">
        <input
          type="checkbox"
          checked={item.declarationConfirmed}
          readOnly
          className="h-4 w-4 shrink-0 rounded border-slate-300 accent-indigo-600"
          aria-label={COPY.itemChallengeDeclarationLabel}
        />
        <p className="text-sm font-bold leading-relaxed text-indigo-900">
          {COPY.itemChallengeDeclarationLabel}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={onAccept}
            disabled={busy}
            className={cn(
              "inline-flex items-center rounded-md border-[1.5px] border-indigo-300 bg-white px-4 py-2 text-sm font-bold text-indigo-900 transition-colors",
              "hover:border-indigo-400 hover:bg-indigo-100",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale",
            )}
          >
            {COPY.itemChallengeAcceptCta}
          </button>
          <button
            type="button"
            onClick={onReject}
            disabled={busy}
            className={cn(
              "inline-flex items-center rounded-md border-[1.5px] border-indigo-300 bg-white px-4 py-2 text-sm font-bold text-indigo-900 transition-colors",
              "hover:border-indigo-400 hover:bg-indigo-100",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale",
            )}
          >
            {COPY.itemChallengeRejectCta}
          </button>
      </div>
    </div>
  );
}
