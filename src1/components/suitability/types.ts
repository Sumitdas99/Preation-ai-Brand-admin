import type {
  SuitabilityCategoryResult,
  SuitabilityCategoryVerdict,
  SuitabilityFrameVerdict,
  SuitabilityOverallStatus,
  SuitabilityResults,
  ThresholdSource,
} from "@/api/schemas/suitability";

export interface SuitabilityTopBar {
  assetFilename: string;
  workspaceLabel?: string;
  geoLabel?: string;
  policyPackLabel?: string;
  evaluatedAtLabel?: string;
}

export interface AssetContextStripView {
  assetLabel: string;
  modalityLabel?: string;
  durationLabel?: string;
  geoLabel?: string;
  geoPresetLabel?: string;
  policyPackLabel?: string;
  evaluatedAtLabel?: string;
}

export type VerdictBannerTone = "blocked" | "flagged" | "clear" | "withdrawn";

export interface VerdictBannerView {
  tone: VerdictBannerTone;
  title: string;
  description: string;
  counts: SuitabilityCounts;
}

export interface SuitabilityCounts {
  blocked: number;
  flagged: number;
  allowed: number;
}

export interface AppliedThresholdView {
  source: ThresholdSource;
  sourceLabel: string;
  presetId?: string;
  workspaceLabel?: string;
  advisoryOnly?: boolean;
}

export interface ThresholdsView {
  flag: number;
  block?: number;
  applied: AppliedThresholdView;
}

export interface FrameThumbView {
  timecodeMs: number;
  timecodeLabel: string;
  thumbnailUrl?: string;
}

export interface FrameContributionRowView {
  frameIndex?: number;
  timecodeLabel: string;
  timecodeMs: number;
  score: number;
  verdict: SuitabilityFrameVerdict;
  subFieldLabel?: string;
  isPeak?: boolean;
}

export interface SuitabilityCategoryRowView {
  categoryKey: string;
  categoryLabel: string;
  verdict: SuitabilityCategoryVerdict;
  score: number;
  thresholds: ThresholdsView;
  ruleId: string;
  policyPackLabel?: string;
  routingMessage?: string;
  chipText: string;
  thumbnails: FrameThumbView[];
  thumbnailLabel: string;
  detailHref: string;
  hasDetail: boolean;
}

export interface SuitabilityAllowedSummaryView {
  count: number;
  categories: string[];
  note: string;
  badgeLabel: string;
}

export interface ReviewerActionsView {
  visible: boolean;
  canAcceptFlagged: boolean;
  canWithdraw: boolean;
  acceptDisabledReason?: string;
  routedToLegal: boolean;
  alreadyAccepted: boolean;
  alreadyWithdrawn: boolean;
  allClear: boolean;
  acceptHeading: string;
  flaggedCategoryLabels: string[];
  acceptanceSystemCaption: string;
  withdrawalSystemCaption: string;
  blockedNote?: BlockedNoteView;
  acceptanceRecord?: AcceptanceRecordView;
}

export interface BlockedNoteView {
  title: string;
  body: string;
}

export interface AcceptanceRecordView {
  acceptedAtLabel: string;
  acceptedBy: string;
  notes?: string;
}

export interface WithdrawalRecordView {
  withdrawnAtLabel: string;
  withdrawnBy: string;
  reason?: string;
}

export interface SuitabilityResultsPageData {
  raw: SuitabilityResults;
  status: SuitabilityOverallStatus;
  topBar: SuitabilityTopBar;
  contextStrip: AssetContextStripView;
  verdict: VerdictBannerView;
  blockedRows: SuitabilityCategoryRowView[];
  flaggedRows: SuitabilityCategoryRowView[];
  allowed: SuitabilityAllowedSummaryView;
  actions: ReviewerActionsView;
  withdrawalRecord?: WithdrawalRecordView;
}

export type CategoryDetailTone = "blocked" | "flagged";

export interface CategoryHeaderView {
  tone: CategoryDetailTone;
  verdict: SuitabilityCategoryVerdict;
  verdictLabel: string;
  categoryLabel: string;
  positionLabel: string;
  subContext: string;
  statBoxes: CategoryStatBoxView[];
}

export interface CategoryStatBoxView {
  label: string;
  value: string;
  tone?: "default" | "muted";
}

export interface ScoreDetailView {
  scoreLabel: string;
  scoreNumeric: number;
  flagThreshold: number;
  blockThreshold?: number;
  legend: ScoreLegendItem[];
  explanation: ScoreExplanationView;
}

export interface ScoreLegendItem {
  label: string;
  value?: string;
  swatch: "score" | "flag" | "block" | "allowed";
}

export interface ScoreExplanationView {
  primarySentence: string;
  scoreSourcePath?: string;
  subFieldNote?: string;
}

export interface SubFieldRowView {
  key: string;
  label: string;
  score: number;
  flagThreshold: number;
  blockThreshold?: number;
  verdict: SuitabilityCategoryVerdict;
}

export interface PerTimecodeView {
  heading: string;
  scrubberLabel: string;
  durationMs?: number;
  peakMs?: number;
  axisTicks: AxisTickView[];
  contributions: FrameContributionRowView[];
  footerNote: string;
}

export interface AxisTickView {
  ms: number;
  label: string;
}

export interface PolicyReferenceView {
  ruleId: string;
  policyPackLabel: string;
  thresholdSourceText: string;
  appliedTo: PolicyReferenceAppliedToRow[];
  evidencePackRef: string;
}

export interface PolicyReferenceAppliedToRow {
  field: string;
  thresholds: string;
}

export interface NextCategoryView {
  categoryKey: string;
  categoryLabel: string;
  verdict: SuitabilityCategoryVerdict;
  href: string;
}

export interface CategoryDotView {
  categoryKey: string;
  categoryLabel: string;
  verdict: SuitabilityCategoryVerdict;
  href: string;
  isCurrent: boolean;
}

export interface SuitabilityCategoryDetailPageData {
  raw: SuitabilityCategoryResult;
  parent: {
    runId: string;
    assetFilename: string;
    resultsHref: string;
  };
  topBar: SuitabilityTopBar;
  breadcrumbTail: string;
  header: CategoryHeaderView;
  scoreDetail: ScoreDetailView;
  perTimecode: PerTimecodeView;
  policyReference: PolicyReferenceView;
  nextCategory?: NextCategoryView;
  categoryDots: CategoryDotView[];
  subFields: SubFieldRowView[];
}
