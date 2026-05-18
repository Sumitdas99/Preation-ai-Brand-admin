import { apiClient } from "../client";
import {
  GenerateEvidencePackRequest,
  GenerateEvidencePackResponse,
} from "../schemas/evidence";
import { EvidencePackPreview } from "../schemas/evidencePackPreview";

export function generateEvidencePack(
  body: GenerateEvidencePackRequest,
): Promise<GenerateEvidencePackResponse> {
  GenerateEvidencePackRequest.parse(body);
  return apiClient.post(
    `/api/v1/evidence/generate`,
    body,
    GenerateEvidencePackResponse,
  );
}

export function getEvidencePackPreview(
  packId: string,
  signal?: AbortSignal,
): Promise<EvidencePackPreview> {
  return apiClient.get(
    `/api/v1/evidence/${encodeURIComponent(packId)}/preview`,
    EvidencePackPreview,
    { signal },
  );
}
