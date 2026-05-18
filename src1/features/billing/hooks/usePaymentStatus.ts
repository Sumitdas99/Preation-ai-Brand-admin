import { useQuery } from "@tanstack/react-query";
import { getPaymentStatus } from "@/api/endpoints/billing";
import { useBillingScenario } from "@/api/billingScenario";
import { billingKeys } from "./queryKeys";

interface Options {
  enabled?: boolean;
  refetchIntervalMs?: number;
}

export function usePaymentStatus(
  brandId: string | undefined,
  { enabled = true, refetchIntervalMs }: Options = {},
) {
  const scenario = useBillingScenario();

  const query = useQuery({
    queryKey: brandId
      ? billingKeys.paymentStatus(brandId, scenario)
      : ["billing", "payment-status", "pending"],
    queryFn: ({ signal }) => getPaymentStatus(brandId!, scenario, signal),
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
