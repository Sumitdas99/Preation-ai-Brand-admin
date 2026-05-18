import { useQuery } from "@tanstack/react-query";
import type { DisclosureSpec } from "@/api/schemas/disclosure";
import { getDisclosure } from "@/api/endpoints/disclosure";
import { disclosureKeys } from "./queryKeys";

interface UseDisclosureSpecResult {
  spec?: DisclosureSpec;
  isPending: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useDisclosureSpec(
  specId: string | undefined,
): UseDisclosureSpecResult {
  const query = useQuery({
    queryKey: specId ? disclosureKeys.detail(specId) : ["disclosure", "pending"],
    queryFn: ({ signal }) => getDisclosure(specId!, signal),
    enabled: Boolean(specId),
  });

  return {
    spec: query.data as DisclosureSpec | undefined,
    isPending: query.isPending,
    error: (query.error as Error | null) ?? null,
    refetch: () => {
      query.refetch();
    },
  };
}
