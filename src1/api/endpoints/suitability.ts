import { apiClient } from "../client";
import {
  AcceptFlaggedRequest,
  AcceptFlaggedResponse,
  SuitabilityResults,
  WithdrawRequest,
  WithdrawResponse,
} from "../schemas/suitability";
import { getSuitabilityScenario } from "../suitabilityScenario";

const SUITABILITY_BASE = "/api/v1/suitability";

function suitabilityHeaders(): Record<string, string> {
  return { "x-suitability-scenario": getSuitabilityScenario() };
}

export function getSuitabilityResults(
  runId: string,
  signal?: AbortSignal,
): Promise<SuitabilityResults> {
  return apiClient.get(
    `${SUITABILITY_BASE}/${encodeURIComponent(runId)}/results`,
    SuitabilityResults,
    { signal, headers: suitabilityHeaders() },
  );
}

export function acceptFlagged(
  runId: string,
  payload: AcceptFlaggedRequest,
): Promise<AcceptFlaggedResponse> {
  AcceptFlaggedRequest.parse(payload);
  return apiClient.post(
    `${SUITABILITY_BASE}/${encodeURIComponent(runId)}/accept-flagged`,
    payload,
    AcceptFlaggedResponse,
    { headers: suitabilityHeaders() },
  );
}

export function withdrawSuitability(
  runId: string,
  payload: WithdrawRequest = {},
): Promise<WithdrawResponse> {
  WithdrawRequest.parse(payload);
  return apiClient.post(
    `${SUITABILITY_BASE}/${encodeURIComponent(runId)}/withdraw`,
    payload,
    WithdrawResponse,
    { headers: suitabilityHeaders() },
  );
}
