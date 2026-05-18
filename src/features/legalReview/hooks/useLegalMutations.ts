import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  approveAndAttest,
  forcePassApproval,
  rejectApproval,
  submitForApproval,
} from "@/api/endpoints/approvals";
import type {
  ApproveRequest,
  ForcePassRequest,
  RejectRequest,
  SubmitApprovalRequest,
} from "@/api/schemas/approvals";
import { legalKeys } from "./queryKeys";

export function useSubmitForApprovalMutation(approvalId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SubmitApprovalRequest) => submitForApproval(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: legalKeys.all });
      if (approvalId) {
        queryClient.invalidateQueries({
          queryKey: legalKeys.approvalDetail(approvalId),
        });
      }
    },
  });
}

export function useApproveAndAttestMutation(approvalId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ApproveRequest) => {
      if (!approvalId) {
        return Promise.reject(new Error("approval_id missing"));
      }
      return approveAndAttest(approvalId, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: legalKeys.all });
      if (approvalId) {
        queryClient.invalidateQueries({
          queryKey: legalKeys.approvalDetail(approvalId),
        });
      }
    },
  });
}

export function useForcePassMutation(approvalId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ForcePassRequest) => {
      if (!approvalId) {
        return Promise.reject(new Error("approval_id missing"));
      }
      return forcePassApproval(approvalId, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: legalKeys.all });
      if (approvalId) {
        queryClient.invalidateQueries({
          queryKey: legalKeys.approvalDetail(approvalId),
        });
      }
    },
  });
}

export function useRejectMutation(approvalId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: RejectRequest) => {
      if (!approvalId) {
        return Promise.reject(new Error("approval_id missing"));
      }
      return rejectApproval(approvalId, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: legalKeys.all });
      if (approvalId) {
        queryClient.invalidateQueries({
          queryKey: legalKeys.approvalDetail(approvalId),
        });
      }
    },
  });
}
