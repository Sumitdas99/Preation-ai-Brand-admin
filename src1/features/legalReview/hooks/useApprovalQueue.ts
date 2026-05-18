import { useQuery } from "@tanstack/react-query";
import {
  getApprovalQueue,
  type ApprovalQueueQuery,
} from "@/api/endpoints/approvals";
import type { ApprovalQueueResponse } from "@/api/schemas/approvals";
import { legalKeys } from "./queryKeys";

interface UseApprovalQueueResult {
  data?: ApprovalQueueResponse;
  isPending: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useApprovalQueue(
  params: ApprovalQueueQuery = {},
  options: { enabled?: boolean } = {},
): UseApprovalQueueResult {
  const enabled = options.enabled ?? true;
  const query = useQuery({
    queryKey: legalKeys.queue(params),
    queryFn: ({ signal }) => getApprovalQueue(params, signal),
    enabled,
  });
  return {
    data: query.data as ApprovalQueueResponse | undefined,
    isPending: query.isPending,
    error: (query.error as Error | null) ?? null,
    refetch: () => {
      query.refetch();
    },
  };
}
