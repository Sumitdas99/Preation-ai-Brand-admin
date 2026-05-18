import { useQuery } from "@tanstack/react-query";
import { getApprovalQueue } from "@/api/endpoints/approvals";
import type {
  ApprovalDetail,
  ApprovalQueueResponse,
} from "@/api/schemas/approvals";

export function useApprovalForRun(
  runId: string | undefined,
  enabled: boolean,
): {
  approval?: ApprovalDetail;
  isPending: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const query = useQuery({
    queryKey: ["legal", "approvalForRun", runId ?? "pending"],
    queryFn: async ({ signal }) => {
      const res = (await getApprovalQueue(
        { preflight_run_id: runId! },
        signal,
      )) as ApprovalQueueResponse;
      return res.items[0] ?? null;
    },
    enabled: Boolean(runId) && enabled,
    staleTime: 0,
  });

  return {
    approval: (query.data as ApprovalDetail | undefined) ?? undefined,
    isPending: query.isPending,
    error: (query.error as Error | null) ?? null,
    refetch: () => {
      query.refetch();
    },
  };
}
