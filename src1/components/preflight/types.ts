export type PreFlightState =
  | "EVALUATION_IN_PROGRESS"
  | "BLOCK_UNTIL_REMEDIATED"
  | "DISCLOSURE_CHALLENGE_PENDING"
  | "SYSTEM_ERROR_POLICY_UNAVAILABLE"
  | "ALLOW_WITH_WARNINGS"
  | "ALLOW"
  | "APPROVED_PENDING_PROOF"
  | "PUBLISH_CLEARED";

export type UserRole = "Reviewer" | "Legal only";

export type BannerTone =
  | "in-progress"
  | "block"
  | "challenge"
  | "system-error"
  | "allow-warnings"
  | "allow"
  | "approved-pending-proof"
  | "publish-cleared"
  | "legal-under-review"
  | "legal-ready-to-attest"
  | "legal-hard-block"
  | "legal-attestation-complete";

export interface TopBar {
  trail: string[];
  workspace: string;
}

export interface Banner {
  tone: BannerTone;
  title: string;
  description: string;
  tag: string;
}

export interface VideoThumbnail {
  modalityLabel: string;
  durationLabel: string;
}

export interface AssetDetailRow {
  label: string;
  value: string;
  emphasis?: "amber" | "purple";
}

export interface AssetDetails {
  rows: AssetDetailRow[];
}

export type ModalityStatus = "COMPLETE" | "IN_PROGRESS" | "PENDING";

export interface Modality {
  name: string;
  status: ModalityStatus;
  statusLabel: string;
  progressPct: number;
  enumValue: string;
  tone: "success" | "warning" | "muted";
}

export interface ModalityProgress {
  headerTitle: string;
  headerSubtitle: string;
  items: Modality[];
  footerNote: string;
}

export type EmbedStatus = "embedding" | "embedded";

export interface AssetVersions {
  originalLabel: string;
  originalFileName: string;
  governanceLabel: string;
  governanceFileName?: string;
  embedStatus: EmbedStatus;
  embedStatusLabel: string;
  provenanceNote: string;
}

export interface ErrorDetail {
  label: string;
  value: string;
  tone?: "success" | "warning" | "muted";
}

export interface SystemErrorDetails {
  blocks: ErrorDetail[];
}

export type DetectorBand =
  | "BLOCK_BAND"
  | "FLAG_BAND"
  | "ALLOW"
  | "FLAGGED_ADVISORY"
  | "FLAGGED_ACCEPTED"
  | "CHALLENGED_BY_REVIEWER"
  | "NOT_DETECTED"
  | "NO_PEOPLE_DETECTED";

export interface DetectorCallout {
  tone: "warning";
  text: string;
}

export interface Detector {
  label: string;
  score?: number;
  band: DetectorBand;
  badgeLabel: string;
  inlineCallout?: DetectorCallout;
}

export type DetectionMode = "normal" | "skeleton" | "system-error";

export interface DetectionResults {
  subtitle: string;
  mode: DetectionMode;
  rows: Detector[];
}

export type EngineStatus =
  | "skeleton"
  | "not-started"
  | "in-progress"
  | "action-required"
  | "flagged-reviewed"
  | "clear"
  | "locked"
  | "challenge-pending"
  | "embedded";

export interface EngineTile {
  name: string;
  status: EngineStatus;
  statusLabel: string;
  enumValue?: string;
}

export type EngineMode = "normal" | "skeleton";

export interface EngineStatusStrip {
  tone: "success" | "challenge";
  icon: "check" | "info";
  text: string;
}

export interface Engines {
  subtitle: string;
  mode: EngineMode;
  tiles: EngineTile[];
  bottomStrip?: EngineStatusStrip;
  headerLabel?: string;
}

export interface LegalApprovalRecordField {
  label: string;
  value: string;
}

export interface LegalApprovalRecord {
  title: string;
  fields: LegalApprovalRecordField[];
}

export interface EvidencePackMetaField {
  label: string;
  value: string;
}

export interface EvidencePackPanel {
  sectionTitle: string;
  documentTitle: string;
  documentSubtitle: string;
  metaFields: EvidencePackMetaField[];
  footerText: string;
  downloadLabel: string;
  downloadUrl?: string;
  packId?: string;
}

export interface ComplianceCheckItem {
  title: string;
  description: string;
}

export interface ComplianceChecksList {
  header: string;
  items: ComplianceCheckItem[];
}

export interface WhatHappensNextAction {
  id: string;
  label: string;
  variant: "primary" | "secondary";
}

export interface WhatHappensNextPanel {
  title: string;
  statusLabel: string;
  items: string[];
  actions: WhatHappensNextAction[];
}


export interface Violation {
  code: string;
  description: string;
  linkLabel: string;
  linkHref: string;
}

export interface Advisory {
  code: string;
  description: string;
  linkLabel: string;
  linkHref: string;
}

export interface Check {
  title: string;
  description: string;
}

export interface Challenge {
  enumValue: string;
  submittedAt: string;
  submittedBy: string;
  reviewerJustification: string;
  declarationText: string;
  auditNote: string;
}

export interface ErrorMeta {
  icon: "clock" | "hash" | "check" | "shield";
  label: string;
}

export interface ErrorPanel {
  strapline: string;
  title: string;
  description: string;
  retryLabel: string;
  meta: ErrorMeta[];
}

export type VerdictSection =
  | {
      kind: "awaiting";
      header: string;
      title: string;
      description: string;
    }
  | {
      kind: "violations";
      pillLabel: string;
      pillNote: string;
      listHeader: string;
      violations: Violation[];
    }
  | {
      kind: "challenge";
      pillLabel: string;
      pillNote: string;
      suspensionNote: string;
      listHeader: string;
      challenge: Challenge;
    }
  | {
      kind: "system-error";
      panel: ErrorPanel;
    }
  | {
      kind: "advisories";
      pillLabel: string;
      pillNote: string;
      listHeader: string;
      advisories: Advisory[];
    }
  | {
      kind: "allow-checks";
      pillLabel: string;
      pillNote: string;
      listHeader: string;
      checks: Check[];
    };

export interface ChallengeSummaryRow {
  key: string;
  label: string;
  value?: string;
  score?: number;
  band?: string;
}

export interface ChallengePanelData {
  visible: boolean;
  summaryHeader: string;
  justificationLabel: string;
  justificationPlaceholder: string;
  declarationLabel: string;
  footerNoteReady: string;
  footerNoteBlocked: string;
  submitLabel: string;
  summaryRows: ChallengeSummaryRow[];
  minJustificationLength: number;
}

export type ActionSectionKind = "regular" | "legal-challenge-resolution";

export type ActionItemTone = "default" | "purple";

export interface ActionItem {
  id: string;
  label: string;
  description?: string;
  role?: UserRole;
  primary?: boolean;
  tone?: ActionItemTone;
}

export interface ActionSection {
  kind: ActionSectionKind;
  title: string;
  items: ActionItem[];
}

export type LegalViewVariant =
  | "state-a-items-pending"
  | "state-b-ready-to-attest"
  | "clean-standard-attestation"
  | "hard-block-escalation"
  | "post-attestation-success";

export type LegalItemId = "challenge" | "brand-block" | "provenance-failure";

export interface LegalChallengeItem {
  kind: "challenge";
  id: LegalItemId;
  resolved: boolean;
  enumValue: string;
  submittedByName?: string;
  submittedAtLabel?: string;
  reviewerJustification?: string;
  declarationConfirmed: boolean;
  resolvedLabel: string;
}

export interface LegalBrandBlockItem {
  kind: "brand-block";
  id: LegalItemId;
  resolved: boolean;
  categoryKey: string;
  categoryLabel: string;
  score: number;
  thresholdScore: number;
  ruleId: string;
  resolvedLabel: string;
}

export interface LegalProvenanceFailureItem {
  kind: "provenance-failure";
  id: LegalItemId;
  resolved: boolean;
  resolvedLabel: string;
}

export type LegalNumberedItem =
  | LegalChallengeItem
  | LegalBrandBlockItem
  | LegalProvenanceFailureItem;

export interface LegalAttestationRecordField {
  label: string;
  value: string;
  tone?: "muted";
}

export interface LegalAttestationRecord {
  asset: string;
  approvalId: string;
  attestedByName: string;
  attestedByRole: string;
  attestedAtLabel: string;
  attestationId: string;
  disclosurePathLabel: string;
}

export interface LegalWhatHappensNextItem {
  id: string;
  text: string;
  endpointTag?: string;
  trailing?: string;
}

export interface LegalReviewerNotification {
  recipientName: string;
  message: string;
}

export interface LegalEscalationReason {
  triggerConditions: string[];
  reviewerDeclarationQuote: string;
  reviewerDeclarationLabel?: string;
  auditEventId: string;
}

export interface LegalApprovePreview {
  asset: string;
  approvalId: string;
  workspace: string;
}

export interface LegalView {
  variant: LegalViewVariant;
  approvalId?: string;
  items: LegalNumberedItem[];
  itemsResolved: boolean;
  approvePreview?: LegalApprovePreview;
  escalationReason?: LegalEscalationReason;
  hardBlockDeclarationQuote?: string;
  attestationRecord?: LegalAttestationRecord;
  whatHappensNext?: LegalWhatHappensNextItem[];
  reviewerNotification?: LegalReviewerNotification;
  evidencePackId?: string;
}

export interface PreFlightData {
  state: PreFlightState;
  topBar: TopBar;
  banner: Banner;
  videoThumbnail: VideoThumbnail;
  assetDetails: AssetDetails;
  modalityProgress?: ModalityProgress;
  assetVersions?: AssetVersions;
  systemErrorDetails?: SystemErrorDetails;
  auditFooterText?: string;
  detectionResults?: DetectionResults;
  legalApprovalRecord?: LegalApprovalRecord;
  evidencePackPanel?: EvidencePackPanel;
  complianceChecksList?: ComplianceChecksList;
  whatHappensNext?: WhatHappensNextPanel;
  engines: Engines;
  verdict: VerdictSection;
  actionSections: ActionSection[];
  challengePanel?: ChallengePanelData;
  legalView?: LegalView;
}

