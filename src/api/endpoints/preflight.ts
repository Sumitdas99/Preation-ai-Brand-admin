import { apiClient } from "../client";
import {
  PreflightEvaluateRequest,
  PreflightEvaluateResponse,
  PreflightRerunResponse,
  PreflightStatusResponse,
} from "../schemas/preflight";

export function getPreflightStatus(
  runId: string,
  signal?: AbortSignal,
): Promise<PreflightStatusResponse> {
  return apiClient.get(
    `/api/v1/preflight/${encodeURIComponent(runId)}/status`,
    PreflightStatusResponse,
    { signal },
  );
}

export function evaluatePreflight(
  body: PreflightEvaluateRequest,
): Promise<PreflightEvaluateResponse> {
  PreflightEvaluateRequest.parse(body);
  return apiClient.post(
    `/api/v1/preflight/evaluate`,
    body,
    PreflightEvaluateResponse,
  );
}

export function rerunPreflight(
  runId: string,
  reason?: string,
): Promise<PreflightRerunResponse> {
  return apiClient.post(
    `/api/v1/preflight/${encodeURIComponent(runId)}/rerun`,
    reason ? { reason } : {},
    PreflightRerunResponse,
  );
}
