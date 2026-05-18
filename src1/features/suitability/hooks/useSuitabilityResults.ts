import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSuitabilityResults } from "@/api/endpoints/suitability";
import type { SuitabilityResults } from "@/api/schemas/suitability";
import {
  getSuitabilityScenario,
  subscribeSuitabilityScenario,
  type SuitabilityScenarioId,
} from "@/api/suitabilityScenario";
import { suitabilityKeys } from "./queryKeys";

interface UseSuitabilityResultsResult {
  results?: SuitabilityResults;
  isPending: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useSuitabilityResults(
  runId: string | undefined,
): UseSuitabilityResultsResult {
  const [scenario, setScenario] = useState<SuitabilityScenarioId>(() =>
    getSuitabilityScenario(),
  );
  useEffect(() => subscribeSuitabilityScenario(setScenario), []);

  const query = useQuery({
    queryKey: runId
      ? suitabilityKeys.resultsByScenario(runId, scenario)
      : ["suitability", "pending"],
    queryFn: ({ signal }) => getSuitabilityResults(runId!, signal),
    enabled: Boolean(runId),
  });

  return {
    results: query.data as SuitabilityResults | undefined,
    isPending: query.isPending,
    error: (query.error as Error | null) ?? null,
    refetch: () => {
      query.refetch();
    },
  };
}
