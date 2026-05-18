import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { activateSubscription } from "@/api/endpoints/billing";
import type { ActivateSubscriptionRequest } from "@/api/schemas/billing";
import {
  getBillingScenario,
  subscribeBillingScenario,
  type BillingScenarioId,
} from "@/api/billingScenario";
import { billingKeys } from "./queryKeys";

export function useActivateSubscription() {
  const queryClient = useQueryClient();
  const [scenario, setScenario] = useState<BillingScenarioId>(() =>
    getBillingScenario(),
  );
  useEffect(() => subscribeBillingScenario(setScenario), []);

  return useMutation({
    mutationFn: (payload: ActivateSubscriptionRequest) =>
      activateSubscription(payload),
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
