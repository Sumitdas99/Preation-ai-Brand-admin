import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProvenanceSummary,
  getWorkspaceSettings,
  listPolicyPresets,
  patchWorkspaceSettings,
} from "@/api/endpoints/policyThresholds";
import type {
  PatchWorkspaceSettingsRequest,
  PolicyPresetsResponse,
  ProvenanceSummary,
  WorkspaceSettings,
} from "@/api/schemas/policyThresholds";
import {
  getPolicyThresholdsScenario,
  subscribePolicyThresholdsScenario,
  type PolicyThresholdsScenarioId,
} from "@/api/policyThresholdsScenario";
import { policyThresholdKeys } from "./queryKeys";

interface UsePolicyThresholdsResult {
  settings?: WorkspaceSettings;
  presets?: PolicyPresetsResponse;
  provenanceSummary?: ProvenanceSummary;
  isPending: boolean;
  isProvenancePending: boolean;
  error: Error | null;
  refetch: () => void;
  saveSettings: (payload: PatchWorkspaceSettingsRequest) => void;
  saveSettingsAsync: (
    payload: PatchWorkspaceSettingsRequest,
  ) => Promise<WorkspaceSettings>;
  isSaving: boolean;
}

export function usePolicyThresholds(
  workspaceId: string,
  options: { loadProvenanceSummary?: boolean } = {},
): UsePolicyThresholdsResult {
  const [scenario, setScenario] = useState<PolicyThresholdsScenarioId>(() =>
    getPolicyThresholdsScenario(),
  );
  useEffect(() => subscribePolicyThresholdsScenario(setScenario), []);

  const queryClient = useQueryClient();
  const settingsQuery = useQuery({
    queryKey: policyThresholdKeys.settings(workspaceId, scenario),
    queryFn: ({ signal }) => getWorkspaceSettings(workspaceId, signal),
  });

  const presetsQuery = useQuery({
    queryKey: policyThresholdKeys.presets(scenario),
    queryFn: ({ signal }) => listPolicyPresets(signal),
  });

  const provenanceQuery = useQuery({
    queryKey: policyThresholdKeys.provenanceSummary(workspaceId, scenario),
    queryFn: ({ signal }) => getProvenanceSummary(workspaceId, signal),
    enabled: Boolean(options.loadProvenanceSummary),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: PatchWorkspaceSettingsRequest) =>
      patchWorkspaceSettings(workspaceId, payload),
    onSuccess: (next) => {
      queryClient.setQueryData(
        policyThresholdKeys.settings(workspaceId, scenario),
        next,
      );
    },
  });

  return {
    settings: settingsQuery.data,
    presets: presetsQuery.data,
    provenanceSummary: provenanceQuery.data,
    isPending: settingsQuery.isPending || presetsQuery.isPending,
    isProvenancePending: provenanceQuery.isPending,
    error:
      ((settingsQuery.error ?? presetsQuery.error ?? provenanceQuery.error) as
        | Error
        | null) ?? null,
    refetch: () => {
      settingsQuery.refetch();
      presetsQuery.refetch();
      if (options.loadProvenanceSummary) provenanceQuery.refetch();
    },
    saveSettings: (payload) => saveMutation.mutate(payload),
    saveSettingsAsync: (payload) => saveMutation.mutateAsync(payload),
    isSaving: saveMutation.isPending,
  };
}
