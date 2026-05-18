import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ValidationError } from "@/api/errors";
import type { DisclosureSpec } from "@/api/schemas/disclosure";
import { lockDisclosureSpec } from "@/api/endpoints/disclosure";
import { preflightKeys } from "@/features/preflight/hooks/queryKeys";
import { disclosureKeys } from "./queryKeys";

interface UseLockSpecArgs {
  specId: string | undefined;
  runId: string | undefined;
}

export function useLockSpec({ specId, runId }: UseLockSpecArgs) {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => {
      if (!specId) return Promise.reject(new Error("specId missing"));
      return lockDisclosureSpec(specId);
    },
    onSuccess: (data: DisclosureSpec) => {
      if (specId) {
        qc.setQueryData(disclosureKeys.detail(specId), data);
        qc.invalidateQueries({ queryKey: disclosureKeys.detail(specId) });
      }
      if (runId) {
        qc.invalidateQueries({ queryKey: preflightKeys.detail(runId) });
        qc.invalidateQueries({ queryKey: preflightKeys.all });
      }
      toast.success("Disclosure specification locked — returning to Pre-Flight");
      if (runId) {
        navigate(`/preflight/${runId}`, { replace: true });
      }
    },
    onError: (error) => {
      if (error instanceof ValidationError) {
        toast.warning("Cannot lock disclosure specification", {
          description:
            "Not all validation checks pass yet. Resolve the pending checks and try again.",
        });
        return;
      }
      const message =
        error instanceof Error ? error.message : "Could not lock specification";
      toast.error("Could not lock disclosure specification", {
        description: message,
      });
    },
  });
}
