import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApprovalDetail } from "@/api/schemas/approvals";
import type { ActionItem } from "@/components/preflight/types";
import type { ChallengeFormValues } from "@/features/preflight/forms/challengeFormSchema";
import {
  useAcknowledgeChallenge,
  useAttestAndApprove,
  useChallengeDetection,
  useFixProvenance,
  useForcePass,
  useGenerateEvidencePack,
  useRejectApproval,
  useRetryPreflight,
  useSubmitForApproval,
} from "@/features/preflight/hooks";
import { preflightKeys } from "@/features/preflight/hooks/queryKeys";
import {
  MOCK_EVIDENCE_PACK_ID,
  MOCK_REVIEWER_ID,
} from "@/mocks/constants";
import type {
  PreFlightActionId,
  PreFlightActionsValue,
} from "./PreFlightActionsContext";

export interface ActionsControllerInput {
  runId: string;
  assetId?: string;
  workspaceId?: string;
  disclosureSpecId?: string;
  consentSpecId?: string;
  proofSpecId?: string;
  evidencePackId?: string;
  mandatoryObligationsResolved: boolean;
  forcePassDisabled: boolean;
  advisoryCount: number;
}

export function usePreFlightActionsController(
  input: ActionsControllerInput,
): PreFlightActionsValue {
  const {
    runId,
    assetId,
    workspaceId,
    disclosureSpecId,
    consentSpecId,
    proofSpecId,
    evidencePackId,
    mandatoryObligationsResolved,
  } = input;
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [pending, setPending] = useState<PreFlightActionId | null>(null);
  const [challengePanelExpanded, setChallengePanelExpanded] = useState(false);

  const cachedApproval =
    qc.getQueryData<ApprovalDetail>(preflightKeys.approvalForRun(runId));
  const approvalId = cachedApproval?.approval_id;

  const submit = useSubmitForApproval(runId);
  const approve = useAttestAndApprove(runId);
  const forcePass = useForcePass(runId);
  const reject = useRejectApproval(runId);
  const challenge = useChallengeDetection(runId);
  const acknowledge = useAcknowledgeChallenge(runId);
  const fixProvenance = useFixProvenance(runId);
  const retry = useRetryPreflight(runId);
  const generateEvidence = useGenerateEvidencePack(runId);

  const onAction = useCallback(
    async (id: PreFlightActionId, _item: ActionItem) => {
      if (pending) return;
      setPending(id);
      try {
        await dispatch(id);
      } finally {
        setPending(null);
      }
      async function dispatch(actionId: PreFlightActionId) {
        switch (actionId) {
          case "submit-legal": {
            if (!assetId || !workspaceId) {
              toast.error("Missing asset context for submission");
              return;
            }
            await submit.mutateAsync({
              asset_id: assetId,
              workspace_id: workspaceId,
              preflight_run_id: runId,
              evidence_pack_id: MOCK_EVIDENCE_PACK_ID,
              submitted_by: MOCK_REVIEWER_ID,
            });
            return;
          }
          case "approve-attest": {
            if (!approvalId) {
              toast.error("No approval record yet — submit for approval first");
              return;
            }
            await approve.mutateAsync({
              approvalId,
              body: {
                attestation_type: "HUMAN_GENERATED_ATTESTED",
                typed_signature: "Legal Approver",
                declaration_confirmed: true,
              },
            });
            return;
          }
          case "force-pass": {
            if (!approvalId) {
              toast.error("No approval record yet — submit for approval first");
              return;
            }
            await forcePass.mutateAsync({
              approvalId,
              body: {
                commentary:
                  "Override issued by Legal after reviewing the full evidence chain and accepting personal accountability for the decision.",
                declaration_confirmed: true,
                typed_signature: "Legal Approver",
              },
            });
            return;
          }
          case "reject-approval": {
            if (!approvalId) {
              toast.error("No approval record yet");
              return;
            }
            await reject.mutateAsync({
              approvalId,
              body: {
                rejection_notes:
                  "Returning to Reviewer for remediation — see engine status notes.",
                routing_instructions: [
                  { engine: "disclosure", action: "RE_EVALUATE" },
                ],
                typed_signature: "Legal Approver",
              },
            });
            return;
          }
          case "challenge-detection": {
            setChallengePanelExpanded((prev) => !prev);
            return;
          }
          case "accept-challenge": {
            if (!disclosureSpecId) return;
            await acknowledge.mutateAsync({
              specId: disclosureSpecId,
              body: {
                decision: "ACCEPTED",
                response_notes:
                  "Reviewed the provided evidence; detection result is incorrect for this asset.",
                typed_signature: "Legal Approver",
              },
            });
            return;
          }
          case "reject-challenge": {
            if (!disclosureSpecId) return;
            await acknowledge.mutateAsync({
              specId: disclosureSpecId,
              body: {
                decision: "REJECTED",
                response_notes:
                  "Insufficient evidence to overturn the detection; returning to disclosure flow.",
                typed_signature: "Legal Approver",
              },
            });
            return;
          }
          case "fix-provenance": {
            if (!assetId) {
              toast.error("Missing asset id");
              return;
            }
            await fixProvenance.mutateAsync({ assetId });
            return;
          }
          case "retry-evaluation": {
            await retry.mutateAsync(undefined);
            return;
          }
          case "generate-evidence": {
            if (!assetId || !workspaceId) return;
            if (!mandatoryObligationsResolved) {
              toast.warning(
                "Cannot generate evidence pack until obligations are resolved",
              );
              return;
            }
            await generateEvidence.mutateAsync({
              preflight_run_id: runId,
              asset_id: assetId,
              workspace_id: workspaceId,
            });
            return;
          }
          case "add-disclosure": {
            if (!disclosureSpecId) {
              toast.error(
                "No disclosure specification available to open",
              );
              return;
            }
            navigate(
              `/disclosure/${encodeURIComponent(disclosureSpecId)}?runId=${encodeURIComponent(runId)}`,
            );
            return;
          }
          case "confirm-consent-presence": {
            if (!consentSpecId) {
              toast.error(
                "No consent specification available to open",
              );
              return;
            }
            navigate(
              `/consent/${encodeURIComponent(consentSpecId)}?runId=${encodeURIComponent(runId)}`,
            );
            return;
          }
          case "review-brand": {
            navigate(`/suitability/${encodeURIComponent(runId)}/results`);
            return;
          }
          case "upload-disclosure-proof": {
            if (!proofSpecId) {
              toast.error("No proof specification available to open");
              return;
            }
            navigate(
              `/proof/${encodeURIComponent(proofSpecId)}?runId=${encodeURIComponent(runId)}`,
            );
            return;
          }
          case "download-evidence-pack": {
            toast.info("Evidence Pack download — wired in Phase 2");
            return;
          }
          case "view-evidence-pack": {
            if (!evidencePackId) {
              toast.error("No evidence pack available to view");
              return;
            }
            navigate(`/evidence/${encodeURIComponent(evidencePackId)}/preview`);
            return;
          }
          case "return-to-asset-library": {
            navigate("/assets");
            return;
          }
          default:
            toast.info(`Action "${actionId}" not wired`);
        }
      }
    },
    [
      pending,
      runId,
      assetId,
      workspaceId,
      disclosureSpecId,
      consentSpecId,
      proofSpecId,
      evidencePackId,
      approvalId,
      mandatoryObligationsResolved,
      navigate,
      submit,
      approve,
      forcePass,
      reject,
      challenge,
      acknowledge,
      fixProvenance,
      retry,
      generateEvidence,
    ],
  );

  const disabledActions = useMemo(() => {
    const disabled = new Set<PreFlightActionId>();
    if (!mandatoryObligationsResolved) disabled.add("generate-evidence");
    if (input.forcePassDisabled) disabled.add("force-pass");
    return disabled;
  }, [mandatoryObligationsResolved, input.forcePassDisabled]);

  const submitChallenge = useCallback(
    async (values: ChallengeFormValues) => {
      if (!disclosureSpecId) {
        toast.error("No disclosure spec id available to challenge");
        return;
      }
      await challenge.mutateAsync({
        specId: disclosureSpecId,
        body: {
          justification: values.justification,
          declaration_confirmed: values.declaration_confirmed,
        },
      });
      setChallengePanelExpanded(false);
    },
    [challenge, disclosureSpecId],
  );

  return {
    onAction,
    pendingAction: pending,
    disabledActions,
    approvalId,
    disclosureSpecId,
    consentSpecId,
    proofSpecId,
    challengePanelExpanded,
    setChallengePanelExpanded,
    submitChallenge,
    challengeSubmitting: challenge.isPending,
  };
}
