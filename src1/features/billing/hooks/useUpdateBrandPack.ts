import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateBrandPack } from "@/api/endpoints/billing";
import type { UpdateBrandPackRequest } from "@/api/schemas/billing";
import { useBillingScenario } from "@/api/billingScenario";
import { billingKeys } from "./queryKeys";

export function useUpdateBrandPack(brandId: string | undefined) {
  const queryClient = useQueryClient();
  const scenario = useBillingScenario();

  return useMutation({
    mutationFn: (payload: UpdateBrandPackRequest) => {
      if (!brandId) return Promise.reject(new Error("brandId missing"));
      return updateBrandPack(brandId, payload, scenario);
    },
    onSuccess: (data) => {
      if (!brandId) return;
      queryClient.setQueryData(
        billingKeys.brandPack(brandId, scenario),
        data,
      );
      queryClient.invalidateQueries({
        queryKey: billingKeys.brand(brandId, scenario),
      });
      queryClient.invalidateQueries({ queryKey: billingKeys.all });
      toast.success("Pack changes saved");
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Could not save pack changes";
      toast.error("Could not save pack changes", { description: message });
    },
  });
}
