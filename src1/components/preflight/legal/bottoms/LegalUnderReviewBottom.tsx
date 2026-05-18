import { useState } from "react";
import type {
  LegalChallengeItem,
  LegalBrandBlockItem,
  LegalProvenanceFailureItem,
  PreFlightData,
} from "../../types";
import { VerdictPill } from "../../primitives/VerdictPill";
import { LEGAL_PREFLIGHT_COPY as COPY } from "@/features/legalReview/adapters/copy";
import { BrandBlockResolutionItem } from "../items/BrandBlockResolutionItem";
import { ChallengeResolutionItem } from "../items/ChallengeResolutionItem";
import { ProvenanceAckItem } from "../items/ProvenanceAckItem";
import { LegalApproveAttestForm } from "../forms/LegalApproveAttestForm";
import { LegalForcePassInlineForm } from "../forms/LegalForcePassInlineForm";
import { LegalRejectInlineForm } from "../forms/LegalRejectInlineForm";
import { LegalActionsSection, type LegalActionId, type LegalActionRow } from "../LegalActionsSection";
import type { LegalPreflightController } from "@/features/legalReview/preflight/useLegalPreflightController";

interface Props {
  data: PreFlightData;
  controller: LegalPreflightController;
  policyPackLabel: string;
}

export function LegalUnderReviewBottom({ data, controller, policyPackLabel }: Props) {
  const legal = data.legalView;
  if (!legal) return null;

  if (legal.itemsResolved) {
    return (
      <StateBLayout
        data={data}
        controller={controller}
        policyPackLabel={policyPackLabel}
      />
    );
  }

  return (
    <StateALayout
      data={data}
      controller={controller}
      policyPackLabel={policyPackLabel}
    />
  );
}

const STATE_A_ROWS: LegalActionRow[] = [
  {
    id: "reject",
    label: COPY.footerRejectAsset,
    description: COPY.footerRejectHint,
    tone: "red",
  },
  {
    id: "force-pass",
    label: COPY.footerForcePassWithCommentary,
    description: COPY.footerForcePassHint,
    tone: "red",
  },
];

function StateALayout({ data, controller, policyPackLabel }: Props) {
  const legal = data.legalView!;
  const [expandedId, setExpandedId] = useState<LegalActionId | null>(null);

  const challenge = legal.items.find((it) => it.kind === "challenge") as
    | LegalChallengeItem
    | undefined;
  const brandBlock = legal.items.find((it) => it.kind === "brand-block") as
    | LegalBrandBlockItem
    | undefined;
  const provenance = legal.items.find((it) => it.kind === "provenance-failure") as
    | LegalProvenanceFailureItem
    | undefined;

  const handleToggle = (id: LegalActionId) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const busy = controller.pendingForm !== null;

  return (
    <section className="space-y-6 px-6 py-5">
      <VerdictPill
        tone="warning"
        label="ALLOW_WITH_WARNINGS"
        note={policyPackLabel}
      />

      <ItemsList
        challenge={challenge}
        brandBlock={brandBlock}
        provenance={provenance}
        controller={controller}
        onOpenReject={() => setExpandedId("reject")}
      />

      <LegalActionsSection
          rows={STATE_A_ROWS}
          expandedId={expandedId}
          onToggle={handleToggle}
          busy={busy}
          slots={{
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

const STATE_B_ROWS: LegalActionRow[] = [
  {
    id: "approve",
    label: "Approve and Attest",
    description: "All items resolved. Approve the asset and record your attestation.",
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
    label: COPY.footerForcePassWithCommentary,
    description: COPY.footerForcePassHint,
    tone: "red",
  },
];

function StateBLayout({ data, controller, policyPackLabel }: Props) {
  const legal = data.legalView!;
  const [expandedId, setExpandedId] = useState<LegalActionId | null>("approve");

  const handleToggle = (id: LegalActionId) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const busy = controller.pendingForm !== null;

  return (
    <section className="space-y-6 px-6 py-5">
      <VerdictPill
        tone="warning"
        label="ALLOW_WITH_WARNINGS"
        note={policyPackLabel}
      />

      <LegalActionsSection
        rows={STATE_B_ROWS}
        expandedId={expandedId}
        onToggle={handleToggle}
        busy={busy}
        slots={{
          approve: legal.approvePreview ? (
            <LegalApproveAttestForm
              preview={legal.approvePreview}
              locked={false}
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

interface ItemsListProps {
  challenge?: LegalChallengeItem;
  brandBlock?: LegalBrandBlockItem;
  provenance?: LegalProvenanceFailureItem;
  controller: LegalPreflightController;
  onOpenReject: () => void;
}

function ItemsList({
  challenge,
  brandBlock,
  provenance,
  controller,
  onOpenReject,
}: ItemsListProps) {
  const sequence: Array<
    | { kind: "challenge"; data: LegalChallengeItem }
    | { kind: "brand-block"; data: LegalBrandBlockItem }
    | { kind: "provenance"; data: LegalProvenanceFailureItem }
  > = [];
  if (challenge && !challenge.resolved) sequence.push({ kind: "challenge", data: challenge });
  if (brandBlock && !brandBlock.resolved) sequence.push({ kind: "brand-block", data: brandBlock });
  if (provenance && !provenance.resolved) sequence.push({ kind: "provenance", data: provenance });

  if (sequence.length === 0) return null;

  return (
    <div className="space-y-8">
      {sequence.map((node, idx) => {
        const index = idx + 1;
        if (node.kind === "challenge") {
          return (
            <ChallengeResolutionItem
              key="challenge"
              index={index}
              item={node.data}
              onAccept={controller.acceptChallenge}
              onReject={controller.rejectChallenge}
              busy={controller.pendingItem === "challenge"}
            />
          );
        }
        if (node.kind === "brand-block") {
          return (
            <BrandBlockResolutionItem
              key="brand-block"
              index={index}
              item={node.data}
              onApprove={(commentary) =>
                controller.approveBrandBlock({
                  itemId: node.data.categoryKey,
                  commentary,
                })
              }
              onReject={onOpenReject}
              busy={controller.pendingItem === "brand-block"}
            />
          );
        }
        return (
          <ProvenanceAckItem
            key="provenance"
            index={index}
            item={node.data}
            onAcknowledge={controller.acknowledgeProvenance}
          />
        );
      })}
    </div>
  );
}
