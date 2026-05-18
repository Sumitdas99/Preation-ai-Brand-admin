import { request } from "../client";
import {
  PatchWorkspaceSettingsRequest,
  PolicyPresetsResponse,
  ProvenanceSummary,
  WorkspaceSettings,
  type PatchWorkspaceSettingsRequest as PatchWorkspaceSettingsPayload,
} from "../schemas/policyThresholds";
import { getPolicyThresholdsScenario } from "../policyThresholdsScenario";

const WORKSPACE_BASE = "/api/v1/workspaces";
const POLICY_BASE = "/api/v1/policy";

function policyThresholdsHeaders(): Record<string, string> {
  return { "x-policy-thresholds-scenario": getPolicyThresholdsScenario() };
}

export function getWorkspaceSettings(
  workspaceId: string,
  signal?: AbortSignal,
): Promise<WorkspaceSettings> {
  return request(
    `${WORKSPACE_BASE}/${encodeURIComponent(workspaceId)}/settings`,
    {
      method: "GET",
      schema: WorkspaceSettings,
      signal,
      headers: policyThresholdsHeaders(),
    },
  );
}

export function patchWorkspaceSettings(
  workspaceId: string,
  payload: PatchWorkspaceSettingsPayload,
): Promise<WorkspaceSettings> {
  PatchWorkspaceSettingsRequest.parse(payload);
  return request(
    `${WORKSPACE_BASE}/${encodeURIComponent(workspaceId)}/settings`,
    {
      method: "PATCH",
      body: payload,
      schema: WorkspaceSettings,
      headers: policyThresholdsHeaders(),
    },
  );
}

export function listPolicyPresets(
  signal?: AbortSignal,
): Promise<PolicyPresetsResponse> {
  return request(`${POLICY_BASE}/presets`, {
    method: "GET",
    schema: PolicyPresetsResponse,
    signal,
    headers: policyThresholdsHeaders(),
  });
}

export function getProvenanceSummary(
  workspaceId: string,
  signal?: AbortSignal,
): Promise<ProvenanceSummary> {
  return request(
    `${WORKSPACE_BASE}/${encodeURIComponent(workspaceId)}/provenance-summary`,
    {
      method: "GET",
      schema: ProvenanceSummary,
      signal,
      headers: policyThresholdsHeaders(),
    },
  );
}
