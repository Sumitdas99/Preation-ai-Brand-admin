import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createSetupLink } from "@/api/endpoints/billing";
import type { SetupLinkRequest } from "@/api/schemas/billing";
import { useBillingScenario } from "@/api/billingScenario";
import { markStripeSetupInitiated } from "./useStripeSetupReturn";

export function useSetupLink() {
  const scenario = useBillingScenario();

  return useMutation({
    mutationFn: (payload: SetupLinkRequest) =>
      createSetupLink(payload, scenario),
    onSuccess: (_response, variables) => {
      if (variables.brand_id) {
        markStripeSetupInitiated(variables.brand_id);
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
