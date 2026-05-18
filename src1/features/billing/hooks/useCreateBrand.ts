import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createBrand, sendBrandInvitation } from "@/api/endpoints/billing";
import type { CreateBrandRequest } from "@/api/schemas/billing";
import { useBillingScenario } from "@/api/billingScenario";
import { billingKeys } from "./queryKeys";

export interface CreateBrandWithInvitationInput {
  payload: CreateBrandRequest;
  sendInvitation: boolean;
}

export function useCreateBrand() {
  const queryClient = useQueryClient();
  const scenario = useBillingScenario();

  return useMutation({
    mutationFn: async ({
      payload,
      sendInvitation,
    }: CreateBrandWithInvitationInput) => {
      const brand = await createBrand(payload, scenario);
      if (sendInvitation) {
        await sendBrandInvitation({ brand_id: brand.brand_id }, scenario);
      }
      return { brand, invitationSent: sendInvitation };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.all });
      toast.success(
        result.invitationSent
          ? "Brand created — invitation email sent"
          : "Brand saved — configure later",
      );
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Could not create brand";
      toast.error("Could not create brand", { description: message });
    },
  });
}
