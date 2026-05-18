import { useQuery } from "@tanstack/react-query";
import type { ProofSpec } from "@/api/schemas/proof";
import { getProofSpec } from "@/api/endpoints/proof";
import { proofKeys } from "./queryKeys";

interface UseProofSpecResult {
  spec?: ProofSpec;
  isPending: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useProofSpec(specId: string | undefined): UseProofSpecResult {
  const query = useQuery({
    queryKey: specId ? proofKeys.detail(specId) : ["proof", "pending"],
    queryFn: ({ signal }) => getProofSpec(specId!, signal),
    enabled: Boolean(specId),
  });

  return {
    spec: query.data as ProofSpec | undefined,
    isPending: query.isPending,
    error: (query.error as Error | null) ?? null,
    refetch: () => {
      query.refetch();
    },
  };
}
