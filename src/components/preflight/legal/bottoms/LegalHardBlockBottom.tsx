import { useState } from "react";
import { AlertCircle } from "lucide-react";
import type { PreFlightData } from "../../types";
import { LEGAL_PREFLIGHT_COPY as COPY } from "@/features/legalReview/adapters/copy";
import { LegalForcePassInlineForm } from "../forms/LegalForcePassInlineForm";
import { LegalActionsSection, type LegalActionId, type LegalActionRow } from "../LegalActionsSection";
import type { LegalPreflightController } from "@/features/legalReview/preflight/useLegalPreflightController";

const ROWS: LegalActionRow[] = [
  {
    id: "force-pass",
    label: COPY.footerForcePassWithCommentary,
    description: COPY.footerForcePassHint,
  },
];

interface Props {
  data: PreFlightData;
  controller: LegalPreflightController;
}

export function LegalHardBlockBottom({ data, controller }: Props) {
  const legal = data.legalView;
  const [expandedId, setExpandedId] = useState<LegalActionId | null>("force-pass");
  if (!legal) return null;

  const handleToggle = (id: LegalActionId) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const busy = controller.pendingForm !== null;

  return (
    <section className="space-y-5 px-6 py-5">
      <span className="inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-1.5 font-mono text-sm font-bold uppercase tracking-wide text-white">
        <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
        BLOCK_NON_OVERRIDABLE   RPL_NO_CONSENT_BLOCK
      </span>

      {legal.hardBlockDeclarationQuote && (
        <article className="rounded-r-md border-l-4 border-l-red-600 bg-red-50 p-4">
          <header className="mb-2">
            <span className="text-base font-extrabold text-red-900">
              {COPY.hardBlockDeclarationTitle}
            </span>
          </header>
          <p className="mb-2 text-sm font-bold italic leading-relaxed text-red-900">
            {legal.hardBlockDeclarationQuote}
          </p>
          <p className="text-sm font-bold leading-relaxed text-foreground/75">
            {COPY.hardBlockDeclarationFooter}
          </p>
        </article>
      )}

      <LegalActionsSection
          rows={ROWS}
          expandedId={expandedId}
          onToggle={handleToggle}
          busy={busy}
          slots={{
            "force-pass": (
              <LegalForcePassInlineForm
                embedded
                onCancel={controller.goBackToQueue}
                onSubmit={async (values) => {
                  await controller.forcePass({ values });
                }}
                busy={controller.pendingForm === "force-pass"}
              />
            ),
          }}
          backToQueue={{
            label: COPY.footerBackToQueue,
            description: COPY.hardBlockBackToQueueHint,
            onClick: controller.goBackToQueue,
          }}
      />
    </section>
  );
}
