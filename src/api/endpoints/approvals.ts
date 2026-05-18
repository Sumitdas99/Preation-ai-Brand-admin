import { apiClient } from "../client";
import {
  ApprovalDetail,
  ApprovalQueueResponse,
  ApproveRequest,
  ForcePassRequest,
  RejectRequest,
  SubmitApprovalRequest,
  SubmitApprovalResponse,
} from "../schemas/approvals";

export function submitForApproval(
  body: SubmitApprovalRequest,
): Promise<SubmitApprovalResponse> {
  SubmitApprovalRequest.parse(body);
  return apiClient.post(
    `/api/v1/approvals/submit`,
    body,
    SubmitApprovalResponse,
  );
}

export function approveAndAttest(
  approvalId: string,
  body: ApproveRequest,
): Promise<ApprovalDetail> {
  ApproveRequest.parse(body);
  return apiClient.post(
    `/api/v1/approvals/${encodeURIComponent(approvalId)}/approve`,
    body,
    ApprovalDetail,
  );
}

export function forcePassApproval(
  approvalId: string,
  body: ForcePassRequest,
): Promise<ApprovalDetail> {
  ForcePassRequest.parse(body);
  return apiClient.post(
    `/api/v1/approvals/${encodeURIComponent(approvalId)}/force-pass`,
    body,
    ApprovalDetail,
  );
}

export function rejectApproval(
  approvalId: string,
  body: RejectRequest,
): Promise<ApprovalDetail> {
  RejectRequest.parse(body);
  return apiClient.post(
    `/api/v1/approvals/${encodeURIComponent(approvalId)}/reject`,
    body,
    ApprovalDetail,
  );
}

export function getApproval(
  approvalId: string,
  signal?: AbortSignal,
): Promise<ApprovalDetail> {
  return apiClient.get(
    `/api/v1/approvals/${encodeURIComponent(approvalId)}`,
    ApprovalDetail,
    { signal },
  );
}

export interface ApprovalQueueQuery {
  preflight_run_id?: string;
  status?: string;
  workspace_id?: string;
  submitted_by?: string;
  approver_id?: string;
  since?: string;
  until?: string;
  state?: string;
}

export function getApprovalQueue(
  params: ApprovalQueueQuery = {},
  signal?: AbortSignal,
): Promise<ApprovalQueueResponse> {
  const query = new URLSearchParams();
  if (params.preflight_run_id)
    query.set("preflight_run_id", params.preflight_run_id);
  if (params.status) query.set("status", params.status);
  if (params.workspace_id) query.set("workspace_id", params.workspace_id);
  if (params.submitted_by) query.set("submitted_by", params.submitted_by);
  if (params.approver_id) query.set("approver_id", params.approver_id);
  if (params.since) query.set("since", params.since);
  if (params.until) query.set("until", params.until);
  if (params.state) query.set("state", params.state);
  const qs = query.toString();
  return apiClient.get(
    `/api/v1/approvals/queue${qs ? `?${qs}` : ""}`,
    ApprovalQueueResponse,
    { signal },
  );
}
