import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ValidationError } from "@/api/errors";
import { submitRplConsent } from "@/api/endpoints/consent";
import type {
  ConsentSpec,
  RplSubmission,
} from "@/api/schemas/consent";
import { consentKeys } from "./queryKeys";

export function useSubmitRplConsent(specId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RplSubmission) => {
      if (!specId) return Promise.reject(new Error("specId missing"));
      return submitRplConsent(specId, body);
    },
    onSuccess: (data: ConsentSpec) => {
      if (specId) {
        qc.setQueryData(consentKeys.detail(specId), data);
      }
      const path = data.rpl_section?.submission?.consent_path;
      if (path === "A") {
        toast.success("Consent attached", {
          description:
            "Document recorded. The disclosure specification step is now unlocked for this asset.",
        });
      } else if (path === "B") {
        toast.message("Consent pending declared", {
          description:
            "Asset will remain on hold. Return here once the consent document is available.",
        });
      } else if (path === "C") {
        toast.error("Escalated to Legal", {
          description:
            "This declaration is permanently recorded in the audit trail. You no longer have action capability on this asset.",
        });
      }
    },
    onError: (error) => {
      if (error instanceof ValidationError) {
        toast.warning("Could not submit RPL consent", {
          description:
            "The submission failed validation. Resolve the issues and retry.",
        });
        return;
      }
      const message =
        error instanceof Error ? error.message : "Could not submit RPL consent";
      toast.error("Could not submit RPL consent", { description: message });
    },
  });
}
