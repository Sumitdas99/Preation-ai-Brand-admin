import { DetectionResultsCard } from "../cards/DetectionResultsCard";
import { LegalApprovalRecordCard } from "../cards/LegalApprovalRecordCard";
import { EngineStatusRow } from "../rows/EngineStatusRow";
import { StateBottom } from "../bottoms/StateBottom";
import { LegalStateBottom } from "../legal/bottoms/LegalStateBottom";
import type { PreFlightData } from "../types";
import type { LegalPreflightController } from "@/features/legalReview/preflight/useLegalPreflightController";

interface Props {
  data: PreFlightData;
  legalController?: LegalPreflightController;
  policyPackLabel?: string;
}

export function MainArea({ data, legalController, policyPackLabel }: Props) {
  const showEngines = data.state !== "PUBLISH_CLEARED";
  const isLegalMode = Boolean(data.legalView);
  const isPostAttestation =
    data.legalView?.variant === "post-attestation-success";
  const showLegalApprovalRecord =
    Boolean(data.legalApprovalRecord) && !isLegalMode;

  return (
    <main className="flex-1 min-w-0 transform-gpu overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {showLegalApprovalRecord && data.legalApprovalRecord && (
        <LegalApprovalRecordCard data={data.legalApprovalRecord} />
      )}
      {!isPostAttestation && data.detectionResults && (
        <DetectionResultsCard data={data.detectionResults} />
      )}
      {!isPostAttestation && showEngines && <EngineStatusRow data={data.engines} />}
      {isLegalMode && legalController && policyPackLabel ? (
        <LegalStateBottom
          data={data}
          controller={legalController}
          policyPackLabel={policyPackLabel}
        />
      ) : (
        <StateBottom data={data} />
      )}
    </main>
  );
}
