import { apiClient } from "../client";
import { getConsentScenario } from "../consentScenario";
import {
  ConsentSpec,
  HumanPresenceSubmission,
  RplSubmission,
  SubmitHumanPresenceResponse,
  SubmitRplConsentResponse,
} from "../schemas/consent";

function consentHeaders(): Record<string, string> {
  return { "x-consent-scenario": getConsentScenario() };
}

export function getConsent(
  specId: string,
  signal?: AbortSignal,
): Promise<ConsentSpec> {
  return apiClient.get(
    `/api/v1/consent/${encodeURIComponent(specId)}`,
    ConsentSpec,
    { signal, headers: consentHeaders() },
  );
}

export function submitRplConsent(
  specId: string,
  body: RplSubmission,
): Promise<SubmitRplConsentResponse> {
  RplSubmission.parse(body);
  return apiClient.post(
    `/api/v1/consent/${encodeURIComponent(specId)}/rpl`,
    body,
    SubmitRplConsentResponse,
    { headers: consentHeaders() },
  );
}

export function submitHumanPresence(
  specId: string,
  body: HumanPresenceSubmission,
): Promise<SubmitHumanPresenceResponse> {
  HumanPresenceSubmission.parse(body);
  return apiClient.post(
    `/api/v1/consent/${encodeURIComponent(specId)}/human-presence`,
    body,
    SubmitHumanPresenceResponse,
    { headers: consentHeaders() },
  );
}
