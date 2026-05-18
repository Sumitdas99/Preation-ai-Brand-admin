import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getOveragePreview } from "@/api/endpoints/billing";
import {
  getBillingScenario,
  subscribeBillingScenario,
  type BillingScenarioId,
} from "@/api/billingScenario";
import { billingKeys } from "./queryKeys";

interface UseOveragePreviewOptions {
  enabled?: boolean;
}

export function useOveragePreview(
  brandId: string | undefined,
  { enabled = true }: UseOveragePreviewOptions = {},
) {
  const [scenario, setScenario] = useState<BillingScenarioId>(() =>
    getBillingScenario(),
  );
  useEffect(() => subscribeBillingScenario(setScenario), []);

  const query = useQuery({
    queryKey: brandId
      ? billingKeys.overagePreview(brandId, scenario)
      : ["billing", "overage-preview", "pending"],
    queryFn: ({ signal }) => getOveragePreview(brandId!, signal),
    enabled: Boolean(brandId) && enabled,
  });

  return {
    preview: query.data,
    isPending: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
}
