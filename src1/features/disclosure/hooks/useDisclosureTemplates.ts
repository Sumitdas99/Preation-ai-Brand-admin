import { useQuery } from "@tanstack/react-query";
import type {
  DisclosureTemplate,
  DisclosureTemplateQuery,
} from "@/api/schemas/disclosure";
import { listDisclosureTemplates } from "@/api/endpoints/disclosure";
import { disclosureKeys } from "./queryKeys";

interface UseDisclosureTemplatesResult {
  templates: DisclosureTemplate[];
  isPending: boolean;
  error: Error | null;
}

export function useDisclosureTemplates(
  query: DisclosureTemplateQuery = {},
  enabled: boolean = true,
): UseDisclosureTemplatesResult {
  const result = useQuery({
    queryKey: disclosureKeys.templates(query),
    queryFn: ({ signal }) => listDisclosureTemplates(query, signal),
    enabled,
    staleTime: 5 * 60_000,
  });

  return {
    templates: (result.data as DisclosureTemplate[] | undefined) ?? [],
    isPending: result.isPending,
    error: (result.error as Error | null) ?? null,
  };
}
