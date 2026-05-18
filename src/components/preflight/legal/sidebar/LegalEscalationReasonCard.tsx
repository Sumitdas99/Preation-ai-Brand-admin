import { LEGAL_PREFLIGHT_COPY as COPY } from "@/features/legalReview/adapters/copy";
import type { LegalEscalationReason } from "../../types";

interface Props {
  data: LegalEscalationReason;
}

export function LegalEscalationReasonCard({ data }: Props) {
  return (
    <section className="pb-4 pl-3.5 pr-4 pt-3">
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {COPY.escalationReasonHeader}
      </h3>

      <div className="rounded-md bg-red-50/60 p-3">
        <p className="mb-2 text-[12px] font-extrabold uppercase tracking-wider text-red-900">
          {COPY.escalationTriggerHeader}
        </p>
        <ul className="space-y-1.5 text-[12.5px] font-semibold leading-snug text-red-900/90">
          {data.triggerConditions.map((cond) => (
            <li key={cond} className="flex gap-2">
              <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-600" />
              <span className="flex-1 break-words">{cond}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 px-1">
        <p className="text-[12px] leading-snug">
          <span className="font-bold text-foreground">
            {data.reviewerDeclarationLabel ?? COPY.escalationReviewerDeclarationPrefix}
          </span>{" "}
          <span className="font-semibold italic text-foreground/80">
            {data.reviewerDeclarationQuote}
          </span>
        </p>
      </div>
    </section>
  );
}
