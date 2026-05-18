import type {
  DisclosurePlacementType,
  DisclosureScope,
  DisclosureStatus,
  PlacementLocation,
  ValidationCheckId,
  ValidationCheckStatus,
} from "@/api/schemas/disclosure";

export type DisclosureStep =
  | "requirement"
  | "placement-declaration"
  | "placement-details"
  | "lock";

export interface DisclosureStepItem {
  id: DisclosureStep;
  label: string;
  status: "active" | "complete" | "upcoming";
}

export interface DisclosureStepProgress {
  items: DisclosureStepItem[];
}

export interface DisclosureTopBar {
  trail: string[];
  workspace: string;
  role: "Reviewer" | "Legal";
  coverageLabels: string[];
}

export type DetectionPillTone = "alert" | "info" | "muted";

export interface DetectionSummaryRowVM {
  key: string;
  label: string;
  score?: number;
  scoreDisplay?: string;
  pill?: { label: string; tone: DetectionPillTone };
}

export type RequirementCellTone = "danger" | "info" | "warning" | "neutral";

export type RequirementGridCell =
  | {
      key: string;
      label: string;
      sublabel?: string;
      kind: "code-chip";
      tone: RequirementCellTone;
      text: string;
    }
  | {
      key: string;
      label: string;
      sublabel?: string;
      kind: "text-emphasis";
      tone: RequirementCellTone;
      text: string;
    }
  | {
      key: string;
      label: string;
      sublabel?: string;
      kind: "link";
      text: string;
      href?: string;
    }
  | {
      key: string;
      label: string;
      sublabel?: string;
      kind: "chips";
      tone: RequirementCellTone;
      chips: string[];
    }
  | {
      key: string;
      label: string;
      sublabel?: string;
      kind: "indicator-chip";
      tone: RequirementCellTone;
      text: string;
    };

export interface RequirementAlertVM {
  title: string;
  body: string;
  severityLabel: string;
  grid: RequirementGridCell[];
  detectionSummary: {
    header: string;
    note: string;
    rows: DetectionSummaryRowVM[];
  };
}

export interface TemplateOptionVM {
  id: string;
  label: string;
  text: string;
  language: string;
}

export interface TemplateStripVM {
  visible: boolean;
  applied: boolean;
  badgeLabel: string;
  bodyPrefix: string;
  templateKey?: string;
  arrowSymbol: string;
  quotedText?: string;
  bodyMeta: string;
  changeLinkLabel: string;
  emptyMessage?: string;
  options: TemplateOptionVM[];
  currentTemplateId?: string;
}

export interface SectionAVM {
  badgeLetter: string;
  title: string;
  headerMeta: string;
  templateStrip: TemplateStripVM;
  textareaLabel: string;
  textareaValue: string;
  maxChars: number;
  charCounterTemplate: string;
  helperText: string;
  languageLabel: string;
  languageValue: string;
  languageOptions: Array<{ value: string; label: string }>;
  languageHelperText: string;
  scope?: {
    label: string;
    value: string;
    sourceLabel: string;
    helperText: string;
  };
}

export interface PlacementOptionVM {
  id: DisclosurePlacementType;
  label: string;
  description: string;
  recommended?: boolean;
  disabled?: boolean;
  disabledReason?: string;
}

export interface SectionBVM {
  badgeLetter: string;
  title: string;
  defaultPrompt: string;
  options: PlacementOptionVM[];
  selected?: DisclosurePlacementType;
}

export interface SectionCVM {
  badgeLetter: string;
  title: string;
  locked: boolean;
  showOnAssetFields: boolean;
  showCaptionFields: boolean;
  showExternalFields: boolean;
  locationLabel: string;
  locationPlaceholder: string;
  locationHelper: string;
  locationValue?: PlacementLocation;
  locationOptions: Array<{ value: PlacementLocation; label: string }>;
  scopeLabel: string;
  scopeValue?: DisclosureScope;
  fullDurationLabel: string;
  fullDurationConfirmed: boolean;
  fullDurationHelper: string;
  timeRangeStartLabel: string;
  timeRangeEndLabel: string;
  timeRangeStartPlaceholder: string;
  timeRangeEndPlaceholder: string;
  timeRangeHelper: string;
  timeRangeDimmed: boolean;
  startMs?: number;
  endMs?: number;
  assetDurationMs?: number;
  captionTextLabel: string;
  captionTextPlaceholder: string;
  captionFirstLineLabel: string;
  captionTextValue?: string;
  captionFirstLineConfirmed?: boolean;
  externalJustificationLabel: string;
  externalJustificationPlaceholder: string;
  externalAckLabel: string;
  externalJustificationValue?: string;
  externalAcknowledged?: boolean;
}

export interface ValidationCheckVM {
  id: ValidationCheckId;
  label: string;
  status: ValidationCheckStatus;
  detail?: string;
}

export interface ValidationPanelVM {
  badgeLabel: string;
  title: string;
  pillLabel: string;
  allPass: boolean;
  passCount: number;
  totalCount: number;
  checks: ValidationCheckVM[];
}

export type LockStatusTone = "pending" | "ready" | "locked";

export interface LockFooterVM {
  statusTone: LockStatusTone;
  heading: string;
  body: string;
  passCount: number;
  totalCount: number;
  ctaLabel: string;
  disabled: boolean;
  locked: boolean;
  lockedAt?: string;
  lockedHash?: string;
}

export interface DisclosureSpecData {
  status: DisclosureStatus;
  topBar: DisclosureTopBar;
  stepProgress: DisclosureStepProgress;
  requirementAlert: RequirementAlertVM;
  sectionA: SectionAVM;
  sectionB: SectionBVM;
  sectionC: SectionCVM;
  validation: ValidationPanelVM;
  lockFooter: LockFooterVM;
  readOnly: boolean;
}
