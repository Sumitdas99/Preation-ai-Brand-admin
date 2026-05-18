import { ComplianceChecksCard } from "../cards/ComplianceChecksCard";
import { EvidencePackCard } from "../cards/EvidencePackCard";
import { WhatHappensNextCard } from "../cards/WhatHappensNextCard";
import type { PreFlightData } from "../types";

interface Props {
  data: PreFlightData;
}

export function PublishClearedBottom({ data }: Props) {
  return (
    <>
      {data.evidencePackPanel && <EvidencePackCard data={data.evidencePackPanel} />}
      {data.complianceChecksList && (
        <ComplianceChecksCard data={data.complianceChecksList} />
      )}
      {data.whatHappensNext && (
        <WhatHappensNextCard data={data.whatHappensNext} />
      )}
    </>
  );
}
