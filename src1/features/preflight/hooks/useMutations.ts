import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ValidationError } from "@/api/errors";
import {
  approveAndAttest,
  forcePassApproval,
  rejectApproval,
  submitForApproval,
} from "@/api/endpoints/approvals";
import { embedC2paManifest } from "@/api/endpoints/c2pa";
import {
  acknowledgeChallenge,
  submitChallenge,
  uploadDisclosureProof,
} from "@/api/endpoints/disclosure";
import { generateEvidencePack } from "@/api/endpoints/evidence";
import { rerunPreflight } from "@/api/endpoints/preflight";
import type {
  ApproveRequest,
  ForcePassRequest,
  RejectRequest,
  SubmitApprovalRequest,
} from "@/api/schemas/approvals";
import type {
  DisclosureAcknowledgeChallengeRequest,
  DisclosureChallengeRequest,
} from "@/api/schemas/disclosure";
import type { GenerateEvidencePackRequest } from "@/api/schemas/evidence";
import { preflightKeys } from "./queryKeys";

function useInvalidatePreflight(runId: string | undefined) {
  const qc = useQueryClient();
  return () => {
    if (!runId) return;
    qc.invalidateQueries({ queryKey: preflightKeys.detail(runId) });
    qc.invalidateQueries({ queryKey: preflightKeys.all });
  };
}

function showError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  toast.error(fallback, { description: message });
}

export function useSubmitForApproval(runId: string | undefined) {
  const qc = useQueryClient();
  const invalidate = useInvalidatePreflight(runId);
  return useMutation({
    mutationFn: (body: SubmitApprovalRequest) => submitForApproval(body),
    onSuccess: (data) => {
      if (runId) {
        qc.setQueryData(preflightKeys.approvalForRun(runId), data);
      }
      invalidate();
      toast.success("Submitted for Legal approval", {
        description: `Approval ID ${data.approval_id}`,
      });
    },
    onError: (error) => showError(error, "Could not submit for approval"),
  });
}

export function useAttestAndApprove(runId: string | undefined) {
  const invalidate = useInvalidatePreflight(runId);
  return useMutation({
    mutationFn: ({
      approvalId,
      body,
    }: {
      approvalId: string;
      body: ApproveRequest;
    }) => approveAndAttest(approvalId, body),
    onSuccess: () => {
      invalidate();
      toast.success("Approved and attested");
    },
    onError: (error) => showError(error, "Could not approve"),
  });
}

export function useForcePass(runId: string | undefined) {
  const invalidate = useInvalidatePreflight(runId);
  return useMutation({
    mutationFn: ({
      approvalId,
      body,
    }: {
      approvalId: string;
      body: ForcePassRequest;
    }) => forcePassApproval(approvalId, body),
    onSuccess: () => {
      invalidate();
      toast.success("Force-pass recorded");
    },
    onError: (error) => showError(error, "Could not force pass"),
  });
}

export function useRejectApproval(runId: string | undefined) {
  const invalidate = useInvalidatePreflight(runId);
  return useMutation({
    mutationFn: ({
      approvalId,
      body,
    }: {
      approvalId: string;
      body: RejectRequest;
    }) => rejectApproval(approvalId, body),
    onSuccess: () => {
      invalidate();
      toast.success("Approval rejected");
    },
    onError: (error) => showError(error, "Could not reject"),
  });
}

export function useChallengeDetection(runId: string | undefined) {
  const invalidate = useInvalidatePreflight(runId);
  return useMutation({
    mutationFn: ({
      specId,
      body,
    }: {
      specId: string;
      body: DisclosureChallengeRequest;
    }) => submitChallenge(specId, body),
    onSuccess: () => {
      invalidate();
      toast.success("Challenge submitted — pending Legal review");
    },
    onError: (error) => showError(error, "Could not submit challenge"),
  });
}

export function useAcknowledgeChallenge(runId: string | undefined) {
  const invalidate = useInvalidatePreflight(runId);
  return useMutation({
    mutationFn: ({
      specId,
      body,
    }: {
      specId: string;
      body: DisclosureAcknowledgeChallengeRequest;
    }) => acknowledgeChallenge(specId, body),
    onSuccess: (_data, variables) => {
      invalidate();
      toast.success(
        variables.body.decision === "ACCEPTED"
          ? "Challenge accepted"
          : "Challenge rejected",
      );
    },
    onError: (error) => showError(error, "Could not resolve challenge"),
  });
}

export function useUploadDisclosureProof(runId: string | undefined) {
  const invalidate = useInvalidatePreflight(runId);
  return useMutation({
    mutationFn: ({
      specId,
      file,
      notes,
    }: {
      specId: string;
      file: File;
      notes?: string;
    }) =>
      uploadDisclosureProof(specId, { file, implementation_notes: notes }),
    onSuccess: () => {
      invalidate();
      toast.success("Disclosure proof uploaded");
    },
    onError: (error) => showError(error, "Could not upload disclosure proof"),
  });
}

export function useFixProvenance(runId: string | undefined) {
  const invalidate = useInvalidatePreflight(runId);
  return useMutation({
    mutationFn: ({ assetId }: { assetId: string }) =>
      embedC2paManifest(assetId),
    onSuccess: () => {
      invalidate();
      toast.success("Provenance re-embedding started");
    },
    onError: (error) => showError(error, "Could not re-trigger provenance"),
  });
}

export function useRetryPreflight(runId: string | undefined) {
  const invalidate = useInvalidatePreflight(runId);
  return useMutation({
    mutationFn: (reason?: string) =>
      runId ? rerunPreflight(runId, reason) : Promise.reject(new Error("runId missing")),
    onSuccess: () => {
      invalidate();
      toast.success("Evaluation retry queued");
    },
    onError: (error) => showError(error, "Could not retry evaluation"),
  });
}

export function useGenerateEvidencePack(runId: string | undefined) {
  const invalidate = useInvalidatePreflight(runId);
  return useMutation({
    mutationFn: (body: GenerateEvidencePackRequest) => generateEvidencePack(body),
    onSuccess: () => {
      invalidate();
      toast.success("Evidence pack generated");
    },
    onError: (error) => {
      if (error instanceof ValidationError) {
        toast.warning("Cannot generate evidence pack", {
          description:
            "Obligations are not yet resolved. Resolve them first and try again.",
        });
        return;
      }
      showError(error, "Could not generate evidence pack");
    },
  });
}
