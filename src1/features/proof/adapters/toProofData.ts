import type { ProofSpec } from "@/api/schemas/proof";
import type { ProofPageData } from "@/components/proof/types";
import { PROOF_PAGE_COPY, PROOF_METHOD_LABELS } from "./copy";

interface ToProofDataInput {
  spec: ProofSpec;
}

export function toProofData({ spec }: ToProofDataInput): ProofPageData {
  const placementLabel = formatPlacement(spec.placement_type);
  const scopeLabel = spec.scope ? `${formatScope(spec.scope)} scope` : undefined;
  const modalityLabel = spec.modality
    ? formatModality(spec.modality)
    : undefined;
  const approverRole = spec.legal_attestation?.approver_role
    ? formatApproverRole(spec.legal_attestation.approver_role)
    : undefined;

  return {
    spec,
    title: PROOF_PAGE_COPY.title,
    description: PROOF_PAGE_COPY.description,
    locked: spec.status === "DISCLOSURE_PROOF_UPLOADED",
    topBar: {
      assetFilename: spec.asset_filename ?? spec.asset_id,
      workspaceLabel: spec.workspace_label,
    },
    attestationStrip: {
      attestationId: spec.legal_attestation?.attestation_id,
      approver: spec.legal_attestation?.approver_name,
      approverRole,
      attestedAt: spec.legal_attestation?.attested_at
        ? formatAttestedAt(spec.legal_attestation.attested_at)
        : undefined,
      placementLabel,
      scopeLabel,
      modalityLabel,
    },
    methodSelector: {
      label: PROOF_PAGE_COPY.selectMethodLabel,
      requiredLabel: PROOF_PAGE_COPY.selectMethodRequired,
      placementHint: placementLabel
        ? `${PROOF_PAGE_COPY.placementHintPrefix} ${placementLabel}`
        : undefined,
      options: [
        {
          id: "FINAL_ASSET",
          label: PROOF_METHOD_LABELS.FINAL_ASSET,
          headline: PROOF_PAGE_COPY.optionAHeading,
          description: PROOF_PAGE_COPY.optionADescription,
        },
        {
          id: "SCREENSHOT",
          label: PROOF_METHOD_LABELS.SCREENSHOT,
          headline: PROOF_PAGE_COPY.optionBHeading,
          description: PROOF_PAGE_COPY.optionBDescription,
        },
      ],
    },
    finalAssetForm: {
      heading: PROOF_PAGE_COPY.optionAHeading,
      uploadHeading: PROOF_PAGE_COPY.optionAUploadHeading,
      uploadCta: PROOF_PAGE_COPY.optionAUploadCta,
      uploadHint: PROOF_PAGE_COPY.optionAUploadHint,
      hashHeader: PROOF_PAGE_COPY.hashHeader,
      hashHint: PROOF_PAGE_COPY.hashHint,
      validationHeader: PROOF_PAGE_COPY.metadataValidationHeader,
      validationChecks: spec.validation_checks,
    },
    screenshotForm: {
      heading: PROOF_PAGE_COPY.optionBHeading,
      description: PROOF_PAGE_COPY.optionBDescription,
      uploadHeading: PROOF_PAGE_COPY.optionBUploadHeading,
      uploadCta: PROOF_PAGE_COPY.optionBUploadCta,
      uploadHint: PROOF_PAGE_COPY.optionBUploadHint,
      attestationLabel: PROOF_PAGE_COPY.optionBAttestationLabel(spec.asset_id),
    },
    footer: {
      backCta: PROOF_PAGE_COPY.backCta,
      submitCta: PROOF_PAGE_COPY.submitCta,
    },
  };
}

function formatPlacement(placement: ProofSpec["placement_type"]): string | undefined {
  if (!placement) return undefined;
  switch (placement) {
    case "ON_ASSET":
      return "On asset";
    case "CAPTION_ONLY":
      return "Caption only";
    case "BOTH":
      return "On asset & caption";
    case "EXTERNAL_IMPLEMENTATION":
      return "External implementation";
    default:
      return placement;
  }
}

function formatScope(scope: NonNullable<ProofSpec["scope"]>): string {
  return scope === "FULL" ? "Full" : "Partial";
}

function formatApproverRole(role: string): string {
  return role.replace(/\s*\/\s*/g, " ").trim();
}

function formatModality(modality: NonNullable<ProofSpec["modality"]>): string {
  switch (modality) {
    case "VIDEO":
      return "Video";
    case "IMAGE":
      return "Image";
    case "AUDIO":
      return "Audio";
    case "TEXT":
      return "Text";
    default:
      return modality;
  }
}

function formatAttestedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const day = date.getUTCDate();
  const month = date.toLocaleString("en-GB", {
    month: "short",
    timeZone: "UTC",
  });
  const year = date.getUTCFullYear();
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  return `${day} ${month} ${year} at ${hh}:${mm} UTC`;
}
