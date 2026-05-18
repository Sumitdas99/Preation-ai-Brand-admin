import { useQuery } from "@tanstack/react-query";
import { getOveragePreview } from "@/api/endpoints/billing";
import { useBillingScenario } from "@/api/billingScenario";
import { billingKeys } from "./queryKeys";

interface UseOveragePreviewOptions {
  enabled?: boolean;
}

export function useOveragePreview(
  brandId: string | undefined,
  { enabled = true }: UseOveragePreviewOptions = {},
) {
  const scenario = useBillingScenario();

  const query = useQuery({
    queryKey: brandId
      ? billingKeys.overagePreview(brandId, scenario)
      : ["billing", "overage-preview", "pending"],
    queryFn: ({ signal }) => getOveragePreview(brandId!, scenario, signal),
    enabled: Boolean(brandId) && enabled,
  });

  return {
    preview: query.data,
    isPending: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
}
