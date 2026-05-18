import type { Banner, PreFlightState } from "@/components/preflight/types";
import { BANNER_COPY } from "../copy";

export function toBanner(
  state: PreFlightState,
  mandatoryCount: number,
): Banner {
  const base = BANNER_COPY[state];
  if (state === "BLOCK_UNTIL_REMEDIATED" && mandatoryCount > 0) {
    return {
      ...base,
      description: `${mandatoryCount} mandatory violation${mandatoryCount === 1 ? "" : "s"} must be resolved before this asset can proceed to Legal review.`,
    };
  }
  return base;
}
