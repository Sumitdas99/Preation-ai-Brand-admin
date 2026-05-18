import type { MockScenario } from "@/api/mockScenario";
import type { ProofSpec } from "@/api/schemas/proof";
import {
  MOCK_ASSET_ID,
  MOCK_DISCLOSURE_SPEC_ID,
  MOCK_RUN_ID,
} from "../../constants";

const baseAttestation = {
  attestation_id: "att_a4f2e_c91",
  approver_name: "S. Chen",
  approver_role: "Legal / Approver",
  attested_at: "2026-04-18T14:31:00Z",
};

const baseValidationChecks: ProofSpec["validation_checks"] = [
  {
    id: "MODALITY_MATCH",
    label: "Modality match",
    status: "PENDING",
  },
  {
    id: "DURATION_CHECK",
    label: "Duration check",
    status: "PENDING",
  },
  {
    id: "AI_DETECTOR",
    label: "AI detector",
    status: "NOT_APPLICABLE",
    detail: "Not run on this upload",
  },
];

const pendingProofSpec: ProofSpec = {
  spec_id: MOCK_DISCLOSURE_SPEC_ID,
  asset_id: MOCK_ASSET_ID,
  preflight_run_id: MOCK_RUN_ID,
  workspace_label: "Acme EU",
  asset_filename: "summer_campaign_hero.mp4",
  status: "APPROVED_PENDING_PROOF",
  placement_type: "ON_ASSET",
  scope: "FULL",
  modality: "VIDEO",
  legal_attestation: baseAttestation,
  validation_checks: baseValidationChecks,
  created_at: "2026-04-18T14:31:00Z",
  updated_at: "2026-04-18T14:31:00Z",
};

const uploadedProofSpec: ProofSpec = {
  ...pendingProofSpec,
  status: "DISCLOSURE_PROOF_UPLOADED",
  validation_checks: [
    {
      id: "MODALITY_MATCH",
      label: "Modality match",
      status: "PASS",
      detail: "Video — matches original",
    },
    {
      id: "DURATION_CHECK",
      label: "Duration check",
      status: "PASS",
      detail: "0:32 · within ±2s of original",
    },
    {
      id: "AI_DETECTOR",
      label: "AI detector",
      status: "NOT_APPLICABLE",
      detail: "Not run on this upload",
    },
  ],
  submission: {
    proof_method: "FINAL_ASSET",
    filename: "summer_campaign_hero_with_disclosure.mp4",
    size_bytes: 17_842_112,
    hash: "sha256:a3f29e1c8b4d",
    submitted_at: "2026-04-18T14:46:00Z",
    submitted_by: "Reviewer (mock)",
    audit_trail_id: "aud_demo_proof_0001",
  },
  updated_at: "2026-04-18T14:46:00Z",
};

export const proofScenarios: Partial<Record<MockScenario, ProofSpec>> = {
  "approved-pending-proof": pendingProofSpec,
  "publish-cleared": uploadedProofSpec,
};
