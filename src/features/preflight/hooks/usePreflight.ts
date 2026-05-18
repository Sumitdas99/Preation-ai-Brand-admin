import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import type { Asset } from "@/api/schemas/asset";
import type { DisclosureSpec } from "@/api/schemas/disclosure";
import type { PreflightStatusResponse } from "@/api/schemas/preflight";
import { getAsset } from "@/api/endpoints/asset";
import { getDisclosure } from "@/api/endpoints/disclosure";
import { getPreflightStatus } from "@/api/endpoints/preflight";
import { NotFoundError } from "@/api/errors";
import { preflightKeys } from "./queryKeys";
import { areAllEnginesTerminal } from "../adapters/sections/toEngineTiles";

const PREFLIGHT_POLL_MS = 3000;

interface UsePreflightResult {
  preflight?: PreflightStatusResponse;
  asset?: Asset;
  disclosure?: DisclosureSpec;
  isPending: boolean;
  isPolling: boolean;
  error: Error | null;
  refetch: () => void;
}

export function usePreflight(runId: string | undefined): UsePreflightResult {
  const preflightQuery = useQuery({
    queryKey: runId ? preflightKeys.detail(runId) : ["preflight", "pending"],
    queryFn: ({ signal }) => getPreflightStatus(runId!, signal),
    enabled: Boolean(runId),
    refetchInterval: (query) => {
      const data = query.state.data as PreflightStatusResponse | undefined;
      if (!data) return PREFLIGHT_POLL_MS;
      if (isTerminal(data)) return false;
      return PREFLIGHT_POLL_MS;
    },
  });

  const preflight = preflightQuery.data;
  const assetId = preflight?.asset_id;
  const specId = useMemo(
    () => deriveDisclosureSpecId(preflight),
    [preflight],
  );

  const supportingQueries = useQueries({
    queries: [
      {
        queryKey: assetId ? preflightKeys.asset(assetId) : ["asset", "pending"],
        queryFn: ({ signal }: { signal: AbortSignal }) => getAsset(assetId!, signal),
        enabled: Boolean(assetId),
      },
      {
        queryKey: specId
          ? preflightKeys.disclosure(specId)
          : ["disclosure", "pending"],
        queryFn: ({ signal }: { signal: AbortSignal }) => getDisclosure(specId!, signal),
        enabled: Boolean(specId),
        retry: (failureCount: number, error: Error) => {
          if (error instanceof NotFoundError) return false;
          return failureCount < 1;
        },
      },
    ],
  });

  const [assetQuery, disclosureQuery] = supportingQueries;

  const isPending =
    preflightQuery.isPending ||
    (Boolean(assetId) && assetQuery.isPending) ||
    (Boolean(specId) && disclosureQuery.isPending);

  const error =
    preflightQuery.error ??
    assetQuery.error ??
    (disclosureQuery.error instanceof NotFoundError
      ? null
      : (disclosureQuery.error ?? null));

  return {
    preflight: preflightQuery.data,
    asset: assetQuery.data as Asset | undefined,
    disclosure: disclosureQuery.data as DisclosureSpec | undefined,
    isPending,
    isPolling:
      Boolean(preflight) && !isTerminal(preflight) && preflightQuery.isFetching,
    error,
    refetch: () => {
      preflightQuery.refetch();
      assetQuery.refetch();
      disclosureQuery.refetch();
    },
  };
}

function isTerminal(data: PreflightStatusResponse): boolean {
  if (data.status !== "COMPLETE") return false;
  if (data.engine_statuses?.disclosure === "DISCLOSURE_CHALLENGE_PENDING") {
    return false;
  }
  if (!data.engine_statuses) return true;
  return areAllEnginesTerminal(data.engine_statuses);
}

function deriveDisclosureSpecId(
  preflight: PreflightStatusResponse | undefined,
): string | undefined {
  if (!preflight) return undefined;
  const engineChallenge =
    preflight.engine_statuses?.disclosure === "DISCLOSURE_CHALLENGE_PENDING";
  const disclosureObligation = preflight.obligations.find(
    (o) => o.type === "DISCLOSURE_REQUIRED" && o.spec_id,
  );
  if (disclosureObligation?.spec_id) return disclosureObligation.spec_id;
  if (engineChallenge) {
    const any = preflight.obligations.find((o) => o.spec_id);
    return any?.spec_id;
  }
  return undefined;
}
