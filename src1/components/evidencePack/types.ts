export type EvidencePackSectionTone =
  | "complete"
  | "warning"
  | "muted"
  | "danger"
  | "approved"
  | "force-pass";

export interface EvidencePackTopBarData {
  trail: string[];
  roleLabel: string;
  workspaceLabel?: string;
}

export interface EvidencePackHeaderData {
  title: string;
  generatedAtLabel?: string;
  pdfTypeLabel?: string;
  wormStorageLabel?: string;
  packStatusBadge: {
    label: string;
    tone: EvidencePackSectionTone;
  };
  preSignedHint: string;
}

export interface EvidencePackSidebarMetaRow {
  label: string;
  value: string;
  tone?: "mono";
  truncate?: boolean;
}

export type EvidencePackSidebarStatus =
  | "complete"
  | "not-applicable"
  | "embed-failed"
  | "pending"
  | "force-pass";

export interface EvidencePackSidebarItem {
  key: string;
  index: number;
  label: string;
  href: `#${string}`;
  status?: EvidencePackSidebarStatus;
  dividerAfter?: boolean;
}

export interface EvidencePackSidebarData {
  header: string;
  subtitle?: string;
  meta: EvidencePackSidebarMetaRow[];
  sectionsHeader: string;
  items: EvidencePackSidebarItem[];
  downloadLabel?: string;
  downloadHref?: string;
  downloadDisabled?: boolean;
}

export interface EvidencePackKeyValue {
  label: string;
  value: string;
  tone?: "neutral" | "muted" | "mono" | "warning" | "approved";
  truncate?: boolean;
}

export interface EvidencePackSectionShellData {
  key: string;
  index: number;
  title: string;
  statusBadge: {
    label: string;
    tone: EvidencePackSectionTone;
  };
  secondaryBadge?: {
    label: string;
    tone: EvidencePackSectionTone;
  };
  intro?: string;
}

export type EvidencePackSectionBody =
  | { kind: "key_values"; rows: EvidencePackKeyValue[] }
  | {
      kind: "detection_table";
      rows: Array<{
        detectorLabel: string;
        scoreLabel: string;
        thresholdLabel: string;
        verdictLabel: string;
        verdictTone: EvidencePackSectionTone;
        sourceLabel?: string;
      }>;
      sourceSummary?: string;
    }
  | {
      kind: "policy_record";
      verdictLabel: string;
      verdictTone: EvidencePackSectionTone;
      keyValues: EvidencePackKeyValue[];
      obligations: string[];
      obligationsCaption?: string;
    }
  | {
      kind: "provenance_record";
      statusLabel: string;
      statusTone: EvidencePackSectionTone;
      reason?: string;
      keyValues: EvidencePackKeyValue[];
      notApplicableRationale?: string;
    }
  | {
      kind: "brand_suitability_record";
      categories: Array<{
        key: string;
        label: string;
        ruleId?: string;
        scoreLabel: string;
        verdictLabel: string;
        verdictTone: EvidencePackSectionTone;
        resolutionLabel?: string;
        resolutionTone?: EvidencePackSectionTone;
        commentary?: string;
        commentaryFooter?: string;
      }>;
      otherCategoriesCaption?: string;
      legalCommentary?: string;
      legalCommentaryHeader?: string;
      overrideCommentary?: string;
      overrideCommentaryHeader?: string;
    }
  | {
      kind: "disclosure_record";
      keyValues: EvidencePackKeyValue[];
      disclosureText?: string;
      disclosureLocked: boolean;
      proofKeyValues: EvidencePackKeyValue[];
      notApplicableRationale?: string;
    }
  | {
      kind: "consent_record";
      statusLabel: string;
      statusTone: EvidencePackSectionTone;
      rationale?: string;
    }
  | {
      kind: "attestation_page";
      header: string;
      keyValues: EvidencePackKeyValue[];
      typedSignature: string;
      declarationText?: string;
      overrideCommentary?: string;
      overrideCommentaryHeader?: string;
      isForcePass: boolean;
      forcePassBadgeLabel?: string;
    };

export interface EvidencePackSectionData {
  shell: EvidencePackSectionShellData;
  body: EvidencePackSectionBody;
}

export interface EvidencePackFooterData {
  downloadCtaLabel: string;
  downloadHref?: string;
  downloadDisabled: boolean;
  expiryHint: string;
}

export interface EvidencePackPreviewData {
  topBar: EvidencePackTopBarData;
  header: EvidencePackHeaderData;
  sidebar: EvidencePackSidebarData;
  sections: EvidencePackSectionData[];
  footer: EvidencePackFooterData;
}
