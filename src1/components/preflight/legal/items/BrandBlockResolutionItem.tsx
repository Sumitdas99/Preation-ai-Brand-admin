import { useState } from "react";
import { XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { LEGAL_PREFLIGHT_COPY as COPY } from "@/features/legalReview/adapters/copy";
import type { LegalBrandBlockItem } from "../../types";
import { NumberedItemShell } from "./NumberedItemShell";

interface Props {
  index: number;
  item: LegalBrandBlockItem;
  onApprove: (commentary: string) => void | Promise<void>;
  onReject: () => void;
  busy: boolean;
}

const COMMENTARY_MIN = 50;

export function BrandBlockResolutionItem({
  index,
  item,
  onApprove,
  onReject,
  busy,
}: Props) {
  const [commentary, setCommentary] = useState("");
  const [declarationConfirmed, setDeclarationConfirmed] = useState(false);

  const trimmedLen = commentary.trim().length;
  const commentaryReady = trimmedLen >= COMMENTARY_MIN;
  const submitDisabled = !commentaryReady || !declarationConfirmed || busy;

  return (
    <NumberedItemShell
      index={index}
      title={COPY.itemBrandBlockTitle}
      tone="red"
      resolved={item.resolved}
      resolvedLabel={item.resolvedLabel}
    >
      {item.resolved ? (
        <ResolvedSummary item={item} />
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-2 text-base font-bold leading-snug text-red-900">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" strokeWidth={2.5} />
            <span>
              {COPY.itemBrandBlockHeader(
                item.categoryLabel,
                item.score,
                item.thresholdScore,
                item.ruleId,
              )}
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="space-y-1.5">
              <textarea
                rows={4}
                value={commentary}
                onChange={(e) => setCommentary(e.target.value)}
                placeholder="Provide your commentary for this override decision"
                className={cn(
                  "block min-h-[7rem] w-full resize-y rounded-md border border-red-300 bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-900 shadow-sm placeholder:font-medium placeholder:text-slate-400",
                  "focus:border-2 focus:border-red-500 focus:outline-none focus:ring-0 focus:placeholder:text-transparent",
                  busy && "cursor-not-allowed opacity-60",
                )}
                aria-label="Brand suitability override commentary"
              />
              <div className="flex justify-end text-xs font-bold text-slate-500">
                {commentaryReady
                  ? `${trimmedLen} / ${COMMENTARY_MIN} minimum, minimum met`
                  : `${trimmedLen} / ${COMMENTARY_MIN} minimum, ${Math.max(0, COMMENTARY_MIN - trimmedLen)} more character${COMMENTARY_MIN - trimmedLen === 1 ? "" : "s"} required`}
              </div>
            </div>
            <div className="flex flex-col gap-2 md:w-[140px]">
              <button
                type="button"
                onClick={() => onApprove(commentary)}
                disabled={submitDisabled}
                className={cn(
                  "inline-flex items-center justify-center rounded-md border-[1.5px] border-red-300 bg-white px-4 py-2 text-sm font-bold text-red-900 transition-colors",
                  "hover:border-red-400 hover:bg-red-100",
                  "disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale",
                )}
              >
                {COPY.itemBrandBlockApproveCta}
              </button>
              <button
                type="button"
                onClick={onReject}
                disabled={busy}
                className={cn(
                  "inline-flex items-center justify-center rounded-md border-[1.5px] border-red-300 bg-white px-4 py-2 text-sm font-bold text-red-900 transition-colors",
                  "hover:border-red-400 hover:bg-red-100",
                  "disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale",
                )}
              >
                {COPY.itemBrandBlockRejectCta}
              </button>
            </div>
          </div>

          <label
            className={cn(
              "flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2.5",
              declarationConfirmed
                ? "border-red-400 bg-red-100/50"
                : "border-red-200 bg-white hover:bg-slate-50",
              busy && "cursor-not-allowed opacity-60",
            )}
          >
            <input
              type="checkbox"
              checked={declarationConfirmed}
              onChange={(e) => setDeclarationConfirmed(e.target.checked)}
              disabled={busy}
              className="peer sr-only"
            />
            <span
              aria-hidden
              className={cn(
                "mt-[4px] flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border bg-white text-white transition-colors",
                declarationConfirmed
                  ? "border-red-600 bg-red-600"
                  : "border-[1.5px] border-red-300",
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
            <span className="min-w-0 flex-1 text-sm font-bold leading-relaxed text-red-900">
              {COPY.itemBrandBlockDeclaration(item.categoryLabel)}
            </span>
          </label>
        </div>
      )}
    </NumberedItemShell>
  );
}

function ResolvedSummary({ item }: { item: LegalBrandBlockItem }) {
  return (
    <p className="text-sm font-bold leading-snug text-emerald-900">
      {item.categoryLabel} block approved with commentary. Stored in the Evidence Pack.
    </p>
  );
}
