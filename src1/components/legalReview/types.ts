import type {
  ApprovalPriority,
  ApprovalQueueModality,
  ApprovalState,
  RoutingEngine,
} from "@/api/schemas/approvals";

export type LegalDashboardRole = "Legal" | "Reviewer";

export interface LegalDashboardKpi {
  label: string;
  value: number | string;
  tone?: "neutral" | "amber" | "red" | "green";
}

export type LegalActionLabel =
  | "Review"
  | "Upload Proof"
  | "Upload proof"
  | "Download PDF"
  | "Re-open Pre-Flight"
  | "Awaiting Legal"
  | "Pending Reviewer proof"
  | "Generates after proof"
  | "No pack generated";

export type LegalRowActionKind =
  | { kind: "cta-button"; label: string; href: string; tone?: "primary" | "amber" | "red" }
  | { kind: "link"; label: string; href: string }
  | { kind: "text"; label: string; tone?: "muted" | "neutral" };

export type LegalRowStatusTone =
  | "amber"
  | "green"
  | "red"
  | "neutral";

export interface LegalDashboardRowData {
  approval_id: string;
  approval_id_short?: string;
  preflight_run_id: string;
  asset_id: string;
  asset_filename: string;
  modality?: ApprovalQueueModality;
  thumbnail_url?: string;
  state: ApprovalState;
  status_label?: string;
  status_tone?: LegalRowStatusTone;
  status_subline?: string;
  policy_verdict_label?: string;
  submitted_by_name?: string;
  submitted_at_label?: string;
  submitted_subline?: string;
  resolved_at_label?: string;
  resolved_by_name?: string;
  age_label?: string;
  age_tone?: "neutral" | "amber" | "red";
  age_caption?: string;
  priority?: ApprovalPriority;
  priority_border?: "red" | "amber" | "slate" | "none";
  action_summary?: string;
  action_chips?: string[];
  evidence_pack_id?: string;
  pack_download_url?: string;
  pack_cell?: LegalRowActionKind;
  is_force_pass?: boolean;
  rejection_summary?: string;
  rejected_engines?: RoutingEngine[];
  primary_action?: LegalRowActionKind;
}

export interface LegalDashboardSection {
  key: string;
  title: string;
  count?: number;
  caption?: string;
  description?: string;
  tone?: "red" | "amber" | "green" | "muted";
  rows: LegalDashboardRowData[];
  table?: boolean;
}

export type LegalDashboardTabKey =
  | "pending"
  | "reviewed"
  | "all"
  | "pending-legal"
  | "awaiting-action"
  | "approved";

export interface LegalDashboardTabData {
  key: LegalDashboardTabKey;
  label: string;
  count?: number;
  sections: LegalDashboardSection[];
  emptyTitle?: string;
  emptyBody?: string;
  countTone?: "red" | "blue" | "amber" | "muted";
}

export interface LegalDashboardGreeting {
  title: string;
  sublineParts?: string[];
  subline?: string;
  highlightSuffix?: string;
  highlightTone?: "amber" | "red";
}

export interface LegalDashboardData {
  role: LegalDashboardRole;
  workspaceLabel?: string;
  greeting?: LegalDashboardGreeting;
  kpis?: LegalDashboardKpi[];
  tabs: LegalDashboardTabData[];
  defaultTabKey: LegalDashboardTabKey;
}

export type PreFlightLegalVariant =
  | "items-pending"
  | "ready-to-attest"
  | "clean-standard-attestation"
  | "post-attestation-success"
  | "hard-block-escalation";

export interface PreFlightLegalChecklistItem {
  id: "challenge" | "brand-block" | "provenance-failure";
  title: string;
  body: string;
  resolved: boolean;
  resolveCta?: string;
}

export interface PreFlightLegalAttestationRecord {
  approverName: string;
  approverRole?: string;
  attestedAtLabel: string;
  attestationId: string;
  approvalId: string;
  disclosurePathLabel?: string;
  isForcePass?: boolean;
}

export interface PreFlightLegalData {
  variant: PreFlightLegalVariant;
  approvalId?: string;
  assetFilename: string;
  workspaceLabel?: string;
  checklistItems: PreFlightLegalChecklistItem[];
  attestation?: PreFlightLegalAttestationRecord;
  evidencePackId?: string;
}
