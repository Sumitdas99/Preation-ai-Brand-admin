import type {
  PreFlightState,
  WhatHappensNextPanel,
} from "@/components/preflight/types";

export function toWhatHappensNext(
  state: PreFlightState,
): WhatHappensNextPanel | undefined {
  if (state !== "PUBLISH_CLEARED") return undefined;

  return {
    title: "What happens next",
    statusLabel: "No further action required from reviewer",
    items: [
      "Asset is marked publish-cleared. Your team can now publish the final asset.",
      "Asset appears in Approved Assets on the Legal Approver's dashboard, with a permanent link to the Evidence Pack.",
      "Evidence Pack is permanently accessible. Download links regenerate on each request and expire after 15 minutes.",
      "All events have been recorded in the audit trail, from initial detection through disclosure, consent, Legal review, proof upload, and Evidence Pack generation.",
    ],
    actions: [
      {
        id: "return-to-asset-library",
        label: "Return to Asset Library",
        variant: "secondary",
      },
      {
        id: "view-evidence-pack",
        label: "View Evidence Pack",
        variant: "primary",
      },
    ],
  };
}
