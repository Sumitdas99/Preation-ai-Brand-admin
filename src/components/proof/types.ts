import type {
  MetadataValidationCheck,
  ProofMethod,
  ProofSpec,
} from "@/api/schemas/proof";

export interface ProofTopBar {
  assetFilename: string;
  workspaceLabel?: string;
}

export interface ProofAttestationStrip {
  attestationId?: string;
  approver?: string;
  approverRole?: string;
  attestedAt?: string;
  placementLabel?: string;
  scopeLabel?: string;
  modalityLabel?: string;
}

export interface ProofMethodOption {
  id: ProofMethod;
  label: string;
  headline: string;
  description: string;
}

export interface ProofMethodSelector {
  label: string;
  requiredLabel: string;
  placementHint?: string;
  options: ProofMethodOption[];
}

export interface ProofFinalAssetForm {
  heading: string;
  uploadHeading: string;
  uploadCta: string;
  uploadHint: string;
  hashHeader: string;
  hashHint: string;
  validationHeader: string;
  validationChecks: MetadataValidationCheck[];
}

export interface ProofScreenshotForm {
  heading: string;
  description: string;
  uploadHeading: string;
  uploadCta: string;
  uploadHint: string;
  attestationLabel: string;
}

export interface ProofFooter {
  backCta: string;
  submitCta: string;
}

export interface ProofPageData {
  spec: ProofSpec;
  title: string;
  description: string;
  locked: boolean;
  topBar: ProofTopBar;
  attestationStrip: ProofAttestationStrip;
  methodSelector: ProofMethodSelector;
  finalAssetForm: ProofFinalAssetForm;
  screenshotForm: ProofScreenshotForm;
  footer: ProofFooter;
}
