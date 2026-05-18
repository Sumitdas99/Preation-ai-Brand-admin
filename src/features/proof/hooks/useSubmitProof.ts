import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ValidationError } from "@/api/errors";
import { submitProof } from "@/api/endpoints/proof";
import type { ProofSpec, SubmitProofPayload } from "@/api/schemas/proof";
import { preflightKeys } from "@/features/preflight/hooks/queryKeys";
import { proofKeys } from "./queryKeys";

interface UseSubmitProofArgs {
  specId: string | undefined;
  runId: string | undefined;
}

export function useSubmitProof({ specId, runId }: UseSubmitProofArgs) {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: SubmitProofPayload) => {
      if (!specId) return Promise.reject(new Error("specId missing"));
      return submitProof(specId, payload);
    },
    onSuccess: (data: ProofSpec) => {
      if (specId) {
        qc.setQueryData(proofKeys.detail(specId), data);
        qc.invalidateQueries({ queryKey: proofKeys.detail(specId) });
      }
      if (runId) {
        qc.invalidateQueries({ queryKey: preflightKeys.detail(runId) });
        qc.invalidateQueries({ queryKey: preflightKeys.all });
      }
      toast.success("Disclosure proof submitted — returning to Pre-Flight");
      if (runId) {
        navigate(`/preflight/${runId}`, { replace: true });
      }
    },
    onError: (error) => {
      if (error instanceof ValidationError) {
        toast.warning("Could not submit disclosure proof", {
          description:
            "Validation failed on the upload. Review the metadata checks and try again.",
        });
        return;
      }
      const message =
        error instanceof Error ? error.message : "Could not submit proof";
      toast.error("Could not submit disclosure proof", { description: message });
    },
  });
}
