import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ValidationError } from "@/api/errors";
import { submitHumanPresence } from "@/api/endpoints/consent";
import type {
  ConsentSpec,
  HumanPresenceSubmission,
} from "@/api/schemas/consent";
import { consentKeys } from "./queryKeys";

export function useSubmitHumanPresence(specId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: HumanPresenceSubmission) => {
      if (!specId) return Promise.reject(new Error("specId missing"));
      return submitHumanPresence(specId, body);
    },
    onSuccess: (data: ConsentSpec) => {
      if (specId) {
        qc.setQueryData(consentKeys.detail(specId), data);
      }
      toast.success("Presence declaration submitted", {
        description:
          "Your declaration has been recorded for this asset.",
      });
    },
    onError: (error) => {
      if (error instanceof ValidationError) {
        toast.warning("Could not submit presence declaration", {
          description:
            "The submission failed validation. Resolve the issues and retry.",
        });
        return;
      }
      const message =
        error instanceof Error
          ? error.message
          : "Could not submit presence declaration";
      toast.error("Could not submit presence declaration", {
        description: message,
      });
    },
  });
}
