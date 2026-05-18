import { AllowBottom } from "./AllowBottom";
import { AllowWithWarningsBottom } from "./AllowWithWarningsBottom";
import { ApprovedPendingProofBottom } from "./ApprovedPendingProofBottom";
import { BlockBottom } from "./BlockBottom";
import { ChallengeBottom } from "./ChallengeBottom";
import { InProgressBottom } from "./InProgressBottom";
import { PublishClearedBottom } from "./PublishClearedBottom";
import { SystemErrorBottom } from "./SystemErrorBottom";
import type { PreFlightData } from "../types";

interface Props {
  data: PreFlightData;
}

export function StateBottom({ data }: Props) {
  switch (data.state) {
    case "EVALUATION_IN_PROGRESS":
      return <InProgressBottom data={data} />;
    case "BLOCK_UNTIL_REMEDIATED":
      return <BlockBottom data={data} />;
    case "DISCLOSURE_CHALLENGE_PENDING":
      return <ChallengeBottom data={data} />;
    case "SYSTEM_ERROR_POLICY_UNAVAILABLE":
      return <SystemErrorBottom data={data} />;
    case "ALLOW_WITH_WARNINGS":
      return <AllowWithWarningsBottom data={data} />;
    case "ALLOW":
      return <AllowBottom data={data} />;
    case "APPROVED_PENDING_PROOF":
      return <ApprovedPendingProofBottom data={data} />;
    case "PUBLISH_CLEARED":
      return <PublishClearedBottom data={data} />;
    default:
      return <Placeholder state={data.state} />;
  }
}

function Placeholder({ state }: { state: string }) {
  return (
    <section className="p-6">
      <div className="rounded-lg border-2 border-dashed border-muted-foreground/30 bg-card/50 p-6 text-sm text-muted-foreground">
        {state}
      </div>
    </section>
  );
}
