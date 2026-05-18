import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listBrands } from "@/api/endpoints/billing";
import {
  getBillingScenario,
  subscribeBillingScenario,
  type BillingScenarioId,
} from "@/api/billingScenario";
import { billingKeys } from "./queryKeys";

export function useBrands() {
  const [scenario, setScenario] = useState<BillingScenarioId>(() =>
    getBillingScenario(),
  );
  useEffect(() => subscribeBillingScenario(setScenario), []);

  const query = useQuery({
    queryKey: billingKeys.brandList(scenario),
    queryFn: ({ signal }) => listBrands(signal),
  });

  return {
    brands: query.data?.items ?? [],
    totalCount: query.data?.total_count ?? 0,
    isPending: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
}
