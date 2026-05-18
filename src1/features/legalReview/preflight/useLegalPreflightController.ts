import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApprovalDetail } from "@/api/schemas/approvals";
import type {
  LegalNumberedItem,
  LegalView,
} from "@/components/preflight/types";
import {
  useAcknowledgeChallenge,
  useAttestAndApprove,
  useForcePass,
  useRejectApproval,
} from "@/features/preflight/hooks";
import { preflightKeys } from "@/features/preflight/hooks/queryKeys";
import {
  persistChallengeResolved,
  persistProvenanceAck,
} from "@/features/preflight/adapters/sections/toLegalView";
import type { ApproveAttestFormValues } from "@/features/legalReview/forms/legalFormSchemas";
import type { ForcePassFormValues } from "@/features/legalReview/forms/legalFormSchemas";
import type { RejectFormValues } from "@/features/legalReview/forms/legalFormSchemas";
import { toRoutingInstructions } from "@/features/legalReview/forms/legalFormSchemas";

const BRAND_APPROVED_PREFIX = "praetion.legal.brandApproved";

function readBrandApprovedSet(runId: string): Set<string> {
  try {
    const raw = sessionStorage.getItem(`${BRAND_APPROVED_PREFIX}.${runId}`);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

function writeBrandApprovedSet(runId: string, set: Set<string>): void {
  try {
    sessionStorage.setItem(
      `${BRAND_APPROVED_PREFIX}.${runId}`,
      JSON.stringify([...set]),
    );
  } catch { void 0; }
}

interface UseLegalPreflightControllerInput {
  runId: string;
  legalView: LegalView | undefined;
  approval: ApprovalDetail | undefined;
  disclosureSpecId: string | undefined;
  onItemResolved?: () => void;
}

export interface LegalRejectFormSubmit {
  values: RejectFormValues;
}

export interface LegalForcePassFormSubmit {
  values: ForcePassFormValues;
}

export interface LegalApproveFormSubmit {
  values: ApproveAttestFormValues;
}

interface BrandApproveInput {
  itemId: string;
  commentary: string;
}

export interface LegalPreflightController {
  acceptChallenge: () => Promise<void>;
  rejectChallenge: () => Promise<void>;
  approveBrandBlock: (input: BrandApproveInput) => Promise<void>;
  acknowledgeProvenance: (acknowledged: boolean) => void;
  isProvenanceAcked: boolean;
  approveAndAttest: (input: LegalApproveFormSubmit) => Promise<void>;
  rejectAsset: (input: LegalRejectFormSubmit) => Promise<void>;
  forcePass: (input: LegalForcePassFormSubmit) => Promise<void>;
  pendingItem: LegalPendingItem;
  pendingForm: LegalPendingForm;
  goBackToQueue: () => void;
}

export type LegalPendingItem = "challenge" | "brand-block" | null;
export type LegalPendingForm = "approve" | "reject" | "force-pass" | null;

export function useLegalPreflightController(
  input: UseLegalPreflightControllerInput,
): LegalPreflightController {
  const { runId, legalView, approval, disclosureSpecId, onItemResolved } = input;
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [pendingItem, setPendingItem] = useState<LegalPendingItem>(null);
  const [pendingForm, setPendingForm] = useState<LegalPendingForm>(null);
  const [isProvenanceAcked, setIsProvenanceAcked] = useState<boolean>(() => {
    return Boolean(
      legalView?.items.some(
        (it) => it.kind === "provenance-failure" && it.resolved,
      ),
    );
  });

  useEffect(() => {
    const acked = Boolean(
      legalView?.items.some(
        (it) => it.kind === "provenance-failure" && it.resolved,
      ),
    );
    setIsProvenanceAcked(acked);
  }, [legalView]);

  const ackChallenge = useAcknowledgeChallenge(runId);
  const approve = useAttestAndApprove(runId);
  const forcePassMutation = useForcePass(runId);
  const reject = useRejectApproval(runId);

  const approvalId = approval?.approval_id;

  const invalidateLegalAndPreflight = useCallback(() => {
    qc.invalidateQueries({ queryKey: preflightKeys.detail(runId) });
    qc.invalidateQueries({ queryKey: ["legal"] });
  }, [qc, runId]);

  const acceptChallenge = useCallback(async () => {
    if (!disclosureSpecId) {
      toast.error("Missing disclosure spec for challenge resolution");
      return;
    }
    setPendingItem("challenge");
    try {
      await ackChallenge.mutateAsync({
        specId: disclosureSpecId,
        body: {
          decision: "ACCEPTED",
          response_notes:
            "Reviewer's justification accepted — disclosure obligation removed.",
          typed_signature: "Legal Approver",
        },
      });
      persistChallengeResolved(runId, true);
      onItemResolved?.();
    } finally {
      setPendingItem(null);
    }
  }, [ackChallenge, disclosureSpecId, runId, onItemResolved]);

  const rejectChallengeAction = useCallback(async () => {
    if (!disclosureSpecId) return;
    setPendingItem("challenge");
    try {
      await ackChallenge.mutateAsync({
        specId: disclosureSpecId,
        body: {
          decision: "REJECTED",
          response_notes:
            "Insufficient evidence to overturn detection. Returning to disclosure flow.",
          typed_signature: "Legal Approver",
        },
      });
    } finally {
      setPendingItem(null);
    }
  }, [ackChallenge, disclosureSpecId]);

  const approveBrandBlock = useCallback(
    async ({ itemId }: BrandApproveInput) => {
      setPendingItem("brand-block");
      try {
        const set = readBrandApprovedSet(runId);
        set.add(itemId);
        writeBrandApprovedSet(runId, set);
        try {
          const w = window as unknown as {
            __praetionLegalBrandApproved?: Record<string, Set<string>>;
          };
          w.__praetionLegalBrandApproved =
            w.__praetionLegalBrandApproved ?? {};
          const existing = w.__praetionLegalBrandApproved[runId] ?? new Set();
          existing.add(itemId);
          w.__praetionLegalBrandApproved[runId] = existing;
        } catch { void 0; }
        qc.invalidateQueries({ queryKey: preflightKeys.detail(runId) });
        toast.success("Brand block approved with commentary");
        onItemResolved?.();
      } finally {
        setPendingItem(null);
      }
    },
    [runId, qc, onItemResolved],
  );

  const acknowledgeProvenance = useCallback(
    (acknowledged: boolean) => {
      persistProvenanceAck(runId, acknowledged);
      setIsProvenanceAcked(acknowledged);
      qc.invalidateQueries({ queryKey: preflightKeys.detail(runId) });
      if (acknowledged) onItemResolved?.();
    },
    [qc, runId, onItemResolved],
  );

  const approveAndAttest = useCallback(
    async ({ values }: LegalApproveFormSubmit) => {
      if (!approvalId) {
        toast.error("No approval record yet");
        return;
      }
      setPendingForm("approve");
      try {
        await approve.mutateAsync({
          approvalId,
          body: {
            attestation_type: values.attestation_type,
            typed_signature: values.typed_signature,
            declaration_confirmed: values.declaration_confirmed,
            override_commentary: values.notes || undefined,
          },
        });
        invalidateLegalAndPreflight();
      } finally {
        setPendingForm(null);
      }
    },
    [approve, approvalId, invalidateLegalAndPreflight],
  );

  const rejectAsset = useCallback(
    async ({ values }: LegalRejectFormSubmit) => {
      if (!approvalId) {
        toast.error("No approval record yet");
        return;
      }
      setPendingForm("reject");
      try {
        await reject.mutateAsync({
          approvalId,
          body: {
            rejection_notes: values.rejection_notes,
            routing_instructions: toRoutingInstructions(values.unlock_engines),
            typed_signature: values.typed_signature,
            declaration_confirmed: values.declaration_confirmed,
          },
        });
        invalidateLegalAndPreflight();
        navigate("/approvals");
      } finally {
        setPendingForm(null);
      }
    },
    [reject, approvalId, invalidateLegalAndPreflight, navigate],
  );

  const forcePass = useCallback(
    async ({ values }: LegalForcePassFormSubmit) => {
      if (!approvalId) {
        toast.error("No approval record yet");
        return;
      }
      setPendingForm("force-pass");
      try {
        await forcePassMutation.mutateAsync({
          approvalId,
          body: {
            commentary: values.commentary,
            typed_signature: values.typed_signature,
            declaration_confirmed: values.declaration_confirmed,
          },
        });
        invalidateLegalAndPreflight();
      } finally {
        setPendingForm(null);
      }
    },
    [forcePassMutation, approvalId, invalidateLegalAndPreflight],
  );

  const goBackToQueue = useCallback(() => {
    navigate("/approvals");
  }, [navigate]);

  return {
    acceptChallenge,
    rejectChallenge: rejectChallengeAction,
    approveBrandBlock,
    acknowledgeProvenance,
    isProvenanceAcked,
    approveAndAttest,
    rejectAsset,
    forcePass,
    pendingItem,
    pendingForm,
    goBackToQueue,
  };
}

export function getLocallyBrandApprovedItems(runId: string): Set<string> {
  return readBrandApprovedSet(runId);
}

export function clearLegalLocalState(runId?: string): void {
  try {
    if (!runId) {
      const keys: string[] = [];
      for (let i = 0; i < sessionStorage.length; i += 1) {
        const key = sessionStorage.key(i);
        if (
          key &&
          (key.startsWith(BRAND_APPROVED_PREFIX) ||
            key.startsWith("praetion.legal.provenanceAck") ||
            key.startsWith("praetion.legal.challengeResolved"))
        ) {
          keys.push(key);
        }
      }
      keys.forEach((key) => sessionStorage.removeItem(key));
      return;
    }
    sessionStorage.removeItem(`${BRAND_APPROVED_PREFIX}.${runId}`);
    sessionStorage.removeItem(`praetion.legal.provenanceAck.${runId}`);
    sessionStorage.removeItem(`praetion.legal.challengeResolved.${runId}`);
  } catch { void 0; }
}

export { BRAND_APPROVED_PREFIX };
