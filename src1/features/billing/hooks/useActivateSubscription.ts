import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { activateSubscription } from "@/api/endpoints/billing";
import type { ActivateSubscriptionRequest } from "@/api/schemas/billing";
import { useBillingScenario } from "@/api/billingScenario";
import { billingKeys } from "./queryKeys";

export function useActivateSubscription() {
  const queryClient = useQueryClient();
  const scenario = useBillingScenario();

  return useMutation({
    mutationFn: (payload: ActivateSubscriptionRequest) =>
      activateSubscription(payload, scenario),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: billingKeys.brand(data.brand_id, scenario),
      });
      queryClient.invalidateQueries({
        queryKey: billingKeys.paymentStatus(data.brand_id, scenario),
      });
      queryClient.invalidateQueries({
        queryKey: billingKeys.usage(data.brand_id, scenario),
      });
      toast.success("Subscription activated", {
        description: "Your compliance workspace is now active.",
      });
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "Could not activate subscription";
      toast.error("Activation failed", { description: message });
    },
  });
}
