import { useState } from "react";
import { Check as CheckIcon } from "lucide-react";
import type { PreFlightData } from "../../types";
import { VerdictPill } from "../../primitives/VerdictPill";
import { LEGAL_PREFLIGHT_COPY as COPY } from "@/features/legalReview/adapters/copy";
import { LegalApproveAttestForm } from "../forms/LegalApproveAttestForm";
import { LegalForcePassInlineForm } from "../forms/LegalForcePassInlineForm";
import { LegalRejectInlineForm } from "../forms/LegalRejectInlineForm";
import { LegalActionsSection, type LegalActionId, type LegalActionRow } from "../LegalActionsSection";
import type { LegalPreflightController } from "@/features/legalReview/preflight/useLegalPreflightController";

const ROWS: LegalActionRow[] = [
  {
    id: "approve",
    label: "Approve and Attest",
    description: "Approve the asset and record your attestation.",
    tone: "emerald",
  },
  {
    id: "reject",
    label: COPY.footerRejectAsset,
    description: COPY.footerRejectHint,
    tone: "red",
  },
  {
    id: "force-pass",
    label: COPY.footerForcePass,
    description: COPY.footerForcePassHint,
    tone: "red",
  },
];

interface Props {
  data: PreFlightData;
  controller: LegalPreflightController;
  policyPackLabel: string;
}

export function LegalCleanBottom({ data, controller, policyPackLabel }: Props) {
  const legal = data.legalView;
  const [expandedId, setExpandedId] = useState<LegalActionId | null>("approve");
  if (!legal) return null;

  const allowChecks =
    data.verdict.kind === "allow-checks" ? data.verdict.checks : [];

  const handleToggle = (id: LegalActionId) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const busy = controller.pendingForm !== null;

  return (
    <section className="space-y-6 px-6 py-5">
      <VerdictPill tone="allow" label="ALLOW" note={policyPackLabel} />

      {allowChecks.length > 0 && (
        <div className="space-y-2.5">
          {allowChecks.map((check) => (
            <div
              key={check.title}
              className="flex items-start gap-3 rounded-r-md border-l-4 border-l-emerald-600 bg-emerald-50 p-4"
            >
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600"
                aria-hidden
              >
                <CheckIcon className="h-3 w-3 text-white" strokeWidth={3} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold text-emerald-900">
                  {check.title}
                </p>
                <p className="mt-1 text-[12.5px] font-semibold leading-relaxed text-foreground/80">
                  {check.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <LegalActionsSection
          rows={ROWS}
          expandedId={expandedId}
          onToggle={handleToggle}
          busy={busy}
          slots={{
            approve: legal.approvePreview ? (
              <LegalApproveAttestForm
                preview={legal.approvePreview}
                locked={false}
                cleanCase
                embedded
                onSubmit={async (values) => {
                  await controller.approveAndAttest({ values });
                }}
                busy={controller.pendingForm === "approve"}
              />
            ) : undefined,
            reject: (
              <LegalRejectInlineForm
                embedded
                onCancel={() => setExpandedId(null)}
                onSubmit={async (values) => {
                  await controller.rejectAsset({ values });
                }}
                busy={controller.pendingForm === "reject"}
              />
            ),
            "force-pass": (
              <LegalForcePassInlineForm
                embedded
                onCancel={() => setExpandedId(null)}
                onSubmit={async (values) => {
                  await controller.forcePass({ values });
                }}
                busy={controller.pendingForm === "force-pass"}
              />
            ),
          }}
          backToQueue={{
            label: COPY.footerBackToQueue,
            description: COPY.footerBackToQueueHint,
            onClick: controller.goBackToQueue,
          }}
      />
    </section>
  );
}
