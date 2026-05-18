import { useQuery } from "@tanstack/react-query";
import { listBrands } from "@/api/endpoints/billing";
import { useBillingScenario } from "@/api/billingScenario";
import { billingKeys } from "./queryKeys";

export function useBrands() {
  const scenario = useBillingScenario();

  const query = useQuery({
    queryKey: billingKeys.brandList(scenario),
    queryFn: ({ signal }) => listBrands(scenario, signal),
  });

  return {
    brands: query.data?.items ?? [],
    totalCount: query.data?.total_count ?? 0,
    isPending: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
}
