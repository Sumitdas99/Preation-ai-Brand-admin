import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBrand } from "@/api/endpoints/billing";
import {
  getBillingScenario,
  subscribeBillingScenario,
  type BillingScenarioId,
} from "@/api/billingScenario";
import { billingKeys } from "./queryKeys";

export function useBrand(brandId: string | undefined) {
  const [scenario, setScenario] = useState<BillingScenarioId>(() =>
    getBillingScenario(),
  );
  useEffect(() => subscribeBillingScenario(setScenario), []);

  const query = useQuery({
    queryKey: brandId
      ? billingKeys.brand(brandId, scenario)
      : ["billing", "brand", "pending"],
    queryFn: ({ signal }) => getBrand(brandId!, signal),
    enabled: Boolean(brandId),
  });

  return {
    brand: query.data,
    isPending: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
}
