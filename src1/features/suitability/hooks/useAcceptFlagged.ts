import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ValidationError } from "@/api/errors";
import { acceptFlagged } from "@/api/endpoints/suitability";
import type {
  AcceptFlaggedRequest,
  AcceptFlaggedResponse,
} from "@/api/schemas/suitability";
import { getSuitabilityScenario } from "@/api/suitabilityScenario";
import { preflightKeys } from "@/features/preflight/hooks/queryKeys";
import { suitabilityKeys } from "./queryKeys";

interface UseAcceptFlaggedArgs {
  runId: string | undefined;
  returnToPreflight?: boolean;
}

export function useAcceptFlagged({
  runId,
  returnToPreflight = true,
}: UseAcceptFlaggedArgs) {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: AcceptFlaggedRequest) => {
      if (!runId) return Promise.reject(new Error("runId missing"));
      return acceptFlagged(runId, payload);
    },
    onSuccess: (data: AcceptFlaggedResponse) => {
      if (runId) {
        qc.setQueryData(
          suitabilityKeys.resultsByScenario(runId, getSuitabilityScenario()),
          data,
        );
        qc.invalidateQueries({ queryKey: suitabilityKeys.results(runId) });
        qc.invalidateQueries({ queryKey: preflightKeys.detail(runId) });
        qc.invalidateQueries({ queryKey: preflightKeys.all });
      }
      toast.success("Flagged categories accepted", {
        description:
          "Reviewer acceptance recorded. Returning to Pre-Flight to continue.",
      });
      if (returnToPreflight && runId) {
        navigate(`/preflight/${runId}`, { replace: true });
      }
    },
    onError: (error) => {
      if (error instanceof ValidationError) {
        toast.warning("Could not accept flagged categories", {
          description:
            "Validation failed on the acceptance request. Confirm the declaration and retry.",
        });
        return;
      }
      const message =
        error instanceof Error ? error.message : "Could not accept flagged";
      toast.error("Could not accept flagged categories", {
        description: message,
      });
    },
  });
}
