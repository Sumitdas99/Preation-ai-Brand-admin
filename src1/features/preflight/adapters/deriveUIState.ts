import type { PreflightStatusResponse } from "@/api/schemas/preflight";
import type { PreFlightState } from "@/components/preflight/types";

export interface DerivedState {
  state: PreFlightState;
  forcePassDisabled: boolean;
}

export function deriveUIState(preflight: PreflightStatusResponse): DerivedState {
  if (preflight.status === "IN_PROGRESS") {
    return { state: "EVALUATION_IN_PROGRESS", forcePassDisabled: false };
  }

  const blockingReason =
    preflight.blocking_reason ?? preflight.policy_decision?.blocking_reason;
  if (blockingReason === "SYSTEM_ERROR_POLICY_UNAVAILABLE") {
    return {
      state: "SYSTEM_ERROR_POLICY_UNAVAILABLE",
      forcePassDisabled: true,
    };
  }

  if (preflight.engine_statuses?.disclosure === "DISCLOSURE_CHALLENGE_PENDING") {
    return { state: "DISCLOSURE_CHALLENGE_PENDING", forcePassDisabled: false };
  }

  if (preflight.terminal_state === "PUBLISH_CLEARED") {
    return { state: "PUBLISH_CLEARED", forcePassDisabled: true };
  }

  if (preflight.engine_statuses?.disclosure === "APPROVED_PENDING_PROOF") {
    return { state: "APPROVED_PENDING_PROOF", forcePassDisabled: true };
  }

  if (preflight.verdict === "BLOCK_NON_OVERRIDABLE") {
    return { state: "BLOCK_UNTIL_REMEDIATED", forcePassDisabled: true };
  }

  if (preflight.verdict === "BLOCK_UNTIL_REMEDIATED") {
    return { state: "BLOCK_UNTIL_REMEDIATED", forcePassDisabled: false };
  }

  if (preflight.verdict === "ALLOW_WITH_WARNINGS") {
    return { state: "ALLOW_WITH_WARNINGS", forcePassDisabled: false };
  }

  if (preflight.verdict === "ALLOW") {
    return { state: "ALLOW", forcePassDisabled: false };
  }

  throw new Error(
    `Unable to derive Pre-Flight UI state from response: status=${preflight.status} verdict=${preflight.verdict ?? "null"}`,
  );
}
