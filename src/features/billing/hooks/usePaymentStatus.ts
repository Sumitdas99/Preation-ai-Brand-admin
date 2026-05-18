import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPaymentStatus } from "@/api/endpoints/billing";
import {
  getBillingScenario,
  subscribeBillingScenario,
  type BillingScenarioId,
} from "@/api/billingScenario";
import { billingKeys } from "./queryKeys";

interface Options {
  enabled?: boolean;
  refetchIntervalMs?: number;
}

export function usePaymentStatus(
  brandId: string | undefined,
  { enabled = true, refetchIntervalMs }: Options = {},
) {
  const [scenario, setScenario] = useState<BillingScenarioId>(() =>
    getBillingScenario(),
  );
  useEffect(() => subscribeBillingScenario(setScenario), []);

  const query = useQuery({
    queryKey: brandId
      ? billingKeys.paymentStatus(brandId, scenario)
      : ["billing", "payment-status", "pending"],
    queryFn: ({ signal }) => getPaymentStatus(brandId!, signal),
    enabled: Boolean(brandId) && enabled,
    refetchInterval: refetchIntervalMs,
  });

  return {
    paymentStatus: query.data,
    isPending: query.isPending,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
