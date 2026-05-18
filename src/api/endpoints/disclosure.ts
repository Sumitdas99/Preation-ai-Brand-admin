import { apiClient, request } from "../client";
import {
  DisclosureAcknowledgeChallengeRequest,
  DisclosureAcknowledgeChallengeResponse,
  DisclosureChallengeRequest,
  DisclosureChallengeResponse,
  DisclosureSpec,
  DisclosureTemplate,
  DisclosureTemplateQuery,
  ListDisclosureTemplatesResponse,
  LockDisclosureResponse,
  UpdateDisclosureSpecRequest,
  UpdateDisclosureSpecResponse,
} from "../schemas/disclosure";

export function getDisclosure(
  specId: string,
  signal?: AbortSignal,
): Promise<DisclosureSpec> {
  return apiClient.get(
    `/api/v1/disclosure/${encodeURIComponent(specId)}`,
    DisclosureSpec,
    { signal },
  );
}

export function updateDisclosureSpec(
  specId: string,
  body: UpdateDisclosureSpecRequest,
): Promise<UpdateDisclosureSpecResponse> {
  UpdateDisclosureSpecRequest.parse(body);
  return apiClient.post(
    `/api/v1/disclosure/${encodeURIComponent(specId)}/spec`,
    body,
    UpdateDisclosureSpecResponse,
  );
}

export function lockDisclosureSpec(
  specId: string,
): Promise<LockDisclosureResponse> {
  return apiClient.post(
    `/api/v1/disclosure/${encodeURIComponent(specId)}/lock`,
    {},
    LockDisclosureResponse,
  );
}

export function listDisclosureTemplates(
  query: DisclosureTemplateQuery = {},
  signal?: AbortSignal,
): Promise<DisclosureTemplate[]> {
  const params = new URLSearchParams();
  if (query.trigger) params.set("trigger", query.trigger);
  if (query.modality) params.set("modality", query.modality);
  if (query.scope) params.set("scope", query.scope);
  if (query.channel) params.set("channel", query.channel);
  if (query.geo) params.set("geo", query.geo);
  if (query.lang) params.set("lang", query.lang);
  const qs = params.toString();
  const path = qs
    ? `/api/v1/disclosure/templates?${qs}`
    : "/api/v1/disclosure/templates";
  return apiClient
    .get(path, ListDisclosureTemplatesResponse, { signal })
    .then((res) => res.items);
}

export function submitChallenge(
  specId: string,
  body: DisclosureChallengeRequest,
): Promise<DisclosureChallengeResponse> {
  DisclosureChallengeRequest.parse(body);
  return apiClient.post(
    `/api/v1/disclosure/${encodeURIComponent(specId)}/challenge`,
    body,
    DisclosureChallengeResponse,
  );
}

export function acknowledgeChallenge(
  specId: string,
  body: DisclosureAcknowledgeChallengeRequest,
): Promise<DisclosureAcknowledgeChallengeResponse> {
  DisclosureAcknowledgeChallengeRequest.parse(body);
  return apiClient.post(
    `/api/v1/disclosure/${encodeURIComponent(specId)}/acknowledge-challenge`,
    body,
    DisclosureAcknowledgeChallengeResponse,
  );
}

export interface UploadProofRequest {
  file: File;
  implementation_notes?: string;
}

export function uploadDisclosureProof(
  specId: string,
  body: UploadProofRequest,
): Promise<DisclosureSpec> {
  const formData = new FormData();
  formData.append("file", body.file);
  if (body.implementation_notes) {
    formData.append("implementation_notes", body.implementation_notes);
  }
  return request(
    `/api/v1/disclosure/${encodeURIComponent(specId)}/proof`,
    {
      method: "POST",
      body: formData,
      schema: DisclosureSpec,
    },
  );
}
