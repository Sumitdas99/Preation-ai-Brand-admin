import { useQuery } from "@tanstack/react-query";
import { getEvidencePackPreview } from "@/api/endpoints/evidence";
import type { EvidencePackPreview } from "@/api/schemas/evidencePackPreview";
import { evidencePackKeys } from "./queryKeys";

interface UseEvidencePackPreviewResult {
  pack?: EvidencePackPreview;
  isPending: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useEvidencePackPreview(
  packId: string | undefined,
): UseEvidencePackPreviewResult {
  const query = useQuery({
    queryKey: packId
      ? evidencePackKeys.preview(packId)
      : ["evidence-pack", "pending"],
    queryFn: ({ signal }) => getEvidencePackPreview(packId!, signal),
    enabled: Boolean(packId),
  });
  return {
    pack: query.data as EvidencePackPreview | undefined,
    isPending: query.isPending,
    error: (query.error as Error | null) ?? null,
    refetch: () => {
      query.refetch();
    },
  };
}
