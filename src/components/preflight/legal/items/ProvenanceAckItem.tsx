import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { LEGAL_PREFLIGHT_COPY as COPY } from "@/features/legalReview/adapters/copy";
import type { LegalProvenanceFailureItem } from "../../types";
import { NumberedItemShell } from "./NumberedItemShell";

interface Props {
  index: number;
  item: LegalProvenanceFailureItem;
  onAcknowledge: (acknowledged: boolean) => void;
}

export function ProvenanceAckItem({ index, item, onAcknowledge }: Props) {
  return (
    <NumberedItemShell
      index={index}
      title={COPY.itemProvenanceTitle}
      tone="amber"
      resolved={item.resolved}
      resolvedLabel={item.resolvedLabel}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-2 text-base font-bold leading-snug text-amber-900">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" strokeWidth={3} />
          <span>{COPY.itemProvenanceTitleHeader}</span>
        </div>

        {!item.resolved && (
          <p className="text-sm font-bold italic leading-relaxed text-amber-800">
            {COPY.itemProvenanceBody}
          </p>
        )}

        <label
          className={cn(
            "flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2.5",
            item.resolved
              ? "border-amber-400 bg-amber-100/50"
              : "border-amber-200 bg-white hover:bg-slate-50",
          )}
        >
          <input
            type="checkbox"
            checked={item.resolved}
            onChange={(e) => onAcknowledge(e.target.checked)}
            className="peer sr-only"
          />
          <span
            aria-hidden
            className={cn(
              "mt-[4px] flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border bg-white text-white transition-colors",
              item.resolved
                ? "border-amber-600 bg-amber-600"
                : "border-[1.5px] border-amber-300",
            )}
          >
            {item.resolved ? (
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
          <span className="min-w-0 flex-1 text-sm font-bold leading-relaxed text-amber-900">
            {COPY.itemProvenanceDeclaration}
          </span>
        </label>
      </div>
    </NumberedItemShell>
  );
}
