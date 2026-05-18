import type { PreFlightData } from "../../types";
import { LegalCleanBottom } from "./LegalCleanBottom";
import { LegalHardBlockBottom } from "./LegalHardBlockBottom";
import { LegalPostAttestationBottom } from "./LegalPostAttestationBottom";
import { LegalUnderReviewBottom } from "./LegalUnderReviewBottom";
import type { LegalPreflightController } from "@/features/legalReview/preflight/useLegalPreflightController";

interface Props {
  data: PreFlightData;
  controller: LegalPreflightController;
  policyPackLabel: string;
}

export function LegalStateBottom({ data, controller, policyPackLabel }: Props) {
  const legal = data.legalView;
  if (!legal) return null;

  switch (legal.variant) {
    case "state-a-items-pending":
    case "state-b-ready-to-attest":
      return (
        <LegalUnderReviewBottom
          data={data}
          controller={controller}
          policyPackLabel={policyPackLabel}
        />
      );
    case "clean-standard-attestation":
      return (
        <LegalCleanBottom
          data={data}
          controller={controller}
          policyPackLabel={policyPackLabel}
        />
      );
    case "hard-block-escalation":
      return <LegalHardBlockBottom data={data} controller={controller} />;
    case "post-attestation-success":
      return (
        <LegalPostAttestationBottom
          legal={legal}
          onReturnToQueue={controller.goBackToQueue}
        />
      );
    default:
      return null;
  }
}
