import { useQuery } from "@tanstack/react-query";
import type { ConsentSpec } from "@/api/schemas/consent";
import { getConsent } from "@/api/endpoints/consent";
import { consentKeys } from "./queryKeys";

interface UseConsentResult {
  spec?: ConsentSpec;
  isPending: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useConsent(specId: string | undefined): UseConsentResult {
  const query = useQuery({
    queryKey: specId ? consentKeys.detail(specId) : ["consent", "pending"],
    queryFn: ({ signal }) => getConsent(specId!, signal),
    enabled: Boolean(specId),
  });

  return {
    spec: query.data as ConsentSpec | undefined,
    isPending: query.isPending,
    error: (query.error as Error | null) ?? null,
    refetch: () => {
      query.refetch();
    },
  };
}
