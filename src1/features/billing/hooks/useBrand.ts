import { useQuery } from "@tanstack/react-query";
import { getBrand } from "@/api/endpoints/billing";
import { useBillingScenario } from "@/api/billingScenario";
import { billingKeys } from "./queryKeys";

export function useBrand(brandId: string | undefined) {
  const scenario = useBillingScenario();

  const query = useQuery({
    queryKey: brandId
      ? billingKeys.brand(brandId, scenario)
      : ["billing", "brand", "pending"],
    queryFn: ({ signal }) => getBrand(brandId!, scenario, signal),
    enabled: Boolean(brandId),
  });

  return {
    brand: query.data,
    isPending: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
}
