import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { withdrawSuitability } from "@/api/endpoints/suitability";
import type {
  WithdrawRequest,
  WithdrawResponse,
} from "@/api/schemas/suitability";
import { getSuitabilityScenario } from "@/api/suitabilityScenario";
import { preflightKeys } from "@/features/preflight/hooks/queryKeys";
import { suitabilityKeys } from "./queryKeys";

interface UseWithdrawArgs {
  runId: string | undefined;
  returnToPreflight?: boolean;
}

export function useWithdraw({
  runId,
  returnToPreflight = true,
}: UseWithdrawArgs) {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: WithdrawRequest = {}) => {
      if (!runId) return Promise.reject(new Error("runId missing"));
      return withdrawSuitability(runId, payload);
    },
    onSuccess: (data: WithdrawResponse) => {
      if (runId) {
        qc.setQueryData(
          suitabilityKeys.resultsByScenario(runId, getSuitabilityScenario()),
          data,
        );
        qc.invalidateQueries({ queryKey: suitabilityKeys.results(runId) });
        qc.invalidateQueries({ queryKey: preflightKeys.detail(runId) });
        qc.invalidateQueries({ queryKey: preflightKeys.all });
      }
      toast.success("Asset withdrawn from review", {
        description:
          "Withdrawal recorded against the audit trail. Returning to Pre-Flight.",
      });
      if (returnToPreflight && runId) {
        navigate(`/preflight/${runId}`, { replace: true });
      }
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Could not withdraw asset";
      toast.error("Could not withdraw asset", { description: message });
    },
  });
}
