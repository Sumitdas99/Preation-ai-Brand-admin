import { useQuery } from "@tanstack/react-query";
import { getApproval } from "@/api/endpoints/approvals";
import type { ApprovalDetail } from "@/api/schemas/approvals";
import { legalKeys } from "./queryKeys";

interface UseApprovalDetailResult {
  approval?: ApprovalDetail;
  isPending: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useApprovalDetail(
  approvalId: string | undefined,
): UseApprovalDetailResult {
  const query = useQuery({
    queryKey: approvalId
      ? legalKeys.approvalDetail(approvalId)
      : ["legal", "approval", "pending"],
    queryFn: ({ signal }) => getApproval(approvalId!, signal),
    enabled: Boolean(approvalId),
  });
  return {
    approval: query.data as ApprovalDetail | undefined,
    isPending: query.isPending,
    error: (query.error as Error | null) ?? null,
    refetch: () => {
      query.refetch();
    },
  };
}
