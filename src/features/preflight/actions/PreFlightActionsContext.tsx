import { createContext, useContext } from "react";
import type { ActionItem } from "@/components/preflight/types";
import type { ChallengeFormValues } from "@/features/preflight/forms/challengeFormSchema";

export type PreFlightActionId =
  | "add-disclosure"
  | "confirm-consent-presence"
  | "fix-provenance"
  | "challenge-detection"
  | "force-pass"
  | "accept-challenge"
  | "reject-challenge"
  | "review-brand"
  | "submit-legal"
  | "approve-attest"
  | "reject-approval"
  | "retry-evaluation"
  | "generate-evidence"
  | "upload-disclosure-proof"
  | "download-evidence-pack"
  | "view-evidence-pack"
  | "return-to-asset-library"
  | (string & {});

export interface PreFlightActionsValue {
  onAction: (id: PreFlightActionId, item: ActionItem) => void;
  pendingAction: PreFlightActionId | null;
  disabledActions: Set<PreFlightActionId>;
  approvalId?: string;
  disclosureSpecId?: string;
  consentSpecId?: string;
  proofSpecId?: string;
  challengePanelExpanded: boolean;
  setChallengePanelExpanded: (expanded: boolean) => void;
  submitChallenge: (values: ChallengeFormValues) => Promise<void>;
  challengeSubmitting: boolean;
}

const noopValue: PreFlightActionsValue = {
  onAction: () => {},
  pendingAction: null,
  disabledActions: new Set(),
  challengePanelExpanded: false,
  setChallengePanelExpanded: () => {},
  submitChallenge: async () => {},
  challengeSubmitting: false,
};

export const PreFlightActionsContext =
  createContext<PreFlightActionsValue>(noopValue);

export function usePreFlightActions(): PreFlightActionsValue {
  return useContext(PreFlightActionsContext);
}
