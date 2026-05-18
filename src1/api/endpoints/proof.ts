import { apiClient } from "../client";
import {
  ProofSpec,
  SubmitProofPayload,
  SubmitProofResponse,
} from "../schemas/proof";

const PROOF_BASE = "/api/v1/proof";

export function getProofSpec(
  specId: string,
  signal?: AbortSignal,
): Promise<ProofSpec> {
  return apiClient.get(
    `${PROOF_BASE}/${encodeURIComponent(specId)}`,
    ProofSpec,
    { signal },
  );
}

export function submitProof(
  specId: string,
  payload: SubmitProofPayload,
): Promise<SubmitProofResponse> {
  SubmitProofPayload.parse(payload);
  return apiClient.post(
    `${PROOF_BASE}/${encodeURIComponent(specId)}/submit`,
    payload,
    SubmitProofResponse,
  );
}
