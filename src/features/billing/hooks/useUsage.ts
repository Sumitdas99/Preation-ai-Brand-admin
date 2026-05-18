import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUsage } from "@/api/endpoints/billing";
import {
  getBillingScenario,
  subscribeBillingScenario,
  type BillingScenarioId,
} from "@/api/billingScenario";
import { billingKeys } from "./queryKeys";

interface Options {
  enabled?: boolean;
}

export function useUsage(
  brandId: string | undefined,
  { enabled = true }: Options = {},
) {
  const [scenario, setScenario] = useState<BillingScenarioId>(() =>
    getBillingScenario(),
  );
  useEffect(() => subscribeBillingScenario(setScenario), []);

  const query = useQuery({
    queryKey: brandId
      ? billingKeys.usage(brandId, scenario)
      : ["billing", "usage", "pending"],
    queryFn: ({ signal }) => getUsage(brandId!, signal),
    enabled: Boolean(brandId) && enabled,
  });

  return {
    usage: query.data,
    isPending: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
}
