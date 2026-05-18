import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createSetupLink } from "@/api/endpoints/billing";
import type { SetupLinkRequest } from "@/api/schemas/billing";
import { markStripeSetupInitiated } from "./useStripeSetupReturn";

export function useSetupLink() {
  return useMutation({
    mutationFn: (payload: SetupLinkRequest) => createSetupLink(payload),
    onSuccess: (response, variables) => {
      if (variables.brand_id) {
        markStripeSetupInitiated(variables.brand_id);
      }
      if (typeof window !== "undefined" && response.hosted_url) {
        window.open(response.hosted_url, "_self", "noopener,noreferrer");
      }
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "Could not open the secure payment page";
      toast.error("Could not open Stripe", { description: message });
    },
  });
}
