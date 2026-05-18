export const SUITABILITY_RESULTS_COPY = {
  pageTitle: "Brand Suitability",
  pageDescription:
    "Per-category verdicts for this asset against the active policy pack.",

  sectionBlockedTitle: "BLOCKED",
  sectionFlaggedTitle: "FLAGGED",
  sectionAllowedTitle: "ALLOWED",

  blockedRowChipPrefix: "Routed to Legal",
  flaggedRowChipPrefix: "Reviewer can accept",

  flaggedFramesLabel: "Flagged frames:",
  peakFrameLabel: "Peak frame:",
  viewDetailCta: "View detail",

  reviewerActionsHeader: "REVIEWER ACTIONS",

  blockedNoteTitleTemplate: (categoryLabels: string[]) =>
    `Note: BLOCKED ${categoryLabels.length === 1 ? "category routed" : "categories routed"} to Legal.`,
  blockedNoteBodyTemplate: (_categoryLabels: string[]) =>
    "These categories cannot be accepted by the Reviewer. You may still accept the FLAGGED categories below independently.",

  acceptHeadingTemplate: (labels: string[]) =>
    `ACCEPT FLAGGED ITEMS: ${labels.map((l) => l.toUpperCase()).join(" + ")}`,
  acceptHeadingEmpty: "NO FLAGGED CATEGORIES TO ACCEPT",

  reviewerNotesPlaceholder:
    "Reason for accepting these flagged items (optional).",

  reviewerDeclaration:
    "I confirm I have reviewed the flagged content in this asset and accept responsibility for proceeding with these flags on record. I understand these findings will be permanently recorded in the Evidence Pack and visible to Legal reviewers.",

  acceptanceCaption: "",

  withdrawalCaption: "",

  acceptCta: "Accept flagged items & confirm",
  acceptCtaSubmitting: "Recording acceptance…",
  withdrawCta: "Withdraw asset",
  withdrawCtaSubmitting: "Withdrawing…",
  backToPreflightCta: "Back to Pre-Flight",

  withdrawDialogTitle: "Withdraw this asset?",
  withdrawDialogDescription:
    "Withdrawing returns the asset to the creative team. The withdrawal is permanently recorded in the audit log and Evidence Pack — full pipeline must restart to retry.",
  withdrawReasonLabel: "Reason (optional)",
  withdrawReasonPlaceholder:
    "Optional: explain why the asset is being withdrawn (e.g. re-cut required) — recorded in Evidence Pack.",
  withdrawDialogCancelCta: "Cancel",
  withdrawDialogConfirmCta: "Withdraw asset",

  bannerBlockedTitle: "Overall verdict: BLOCKED",
  bannerBlockedDescription:
    "One or more brand suitability categories exceed the block threshold defined by the active policy pack. Asset has been automatically routed to the Legal review queue. BLOCKED categories cannot be approved by Reviewers.",
  bannerFlaggedTitle: "Overall verdict: FLAGGED",
  bannerFlaggedDescription:
    "One or more categories exceed flag threshold. Reviewer can accept flagged items with declaration to proceed.",
  bannerClearTitle: "Overall verdict: CLEAR",
  bannerClearDescription:
    "All categories are below the flag threshold for the active policy pack. No reviewer action required.",
  bannerWithdrawnTitle: "Overall verdict: WITHDRAWN",
  bannerWithdrawnDescription:
    "Asset has been withdrawn from the review pipeline. Brand must re-upload a remediated asset to retry.",
  bannerReviewedTitle: "Overall verdict: FLAGGED REVIEWED",
  bannerReviewedDescription:
    "Reviewer has accepted the flagged categories with declaration. Asset is recorded against the audit trail.",

  allowedBadgeLabel: "ALL ALLOWED",
  allowedDefaultNote: "all below flag threshold",
} as const;

export const SUITABILITY_DETAIL_COPY = {
  subContextPrefix: "Category drill-down",
  positionTemplate: (current: number, total: number, tone: "flagged" | "blocked") =>
    `${current} of ${total} ${tone} ${total === 1 ? "category" : "categories"}`,

  statScoreLabel: "SCORE",
  statFlagThresholdLabel: "FLAG THRESHOLD",
  statBlockThresholdLabel: "BLOCK THRESHOLD",
  statThresholdSourceLabel: "THRESHOLD SOURCE",
  statBlockThresholdAdvisoryValue: "—",

  scoreHeader: "SCORE DETAIL",
  scoreAssetLabel: "ASSET SCORE",
  legendFlagLabel: "Flag threshold",
  legendBlockLabel: "Block threshold",
  legendAllowedLabel: "Allowed range",
  legendFlagValue: (flag: number) => flag.toFixed(2),
  legendBlockValue: (block: number) => block.toFixed(2),
  legendAllowedValue: (flag: number) => `< ${flag.toFixed(2)}`,
  scoreExplanationFlagged: (score: number, flag: number, block: number) =>
    `This category is flagged because its score (${score.toFixed(
      2,
    )}) falls between the flag threshold (${flag.toFixed(
      2,
    )}) and the block threshold (${block.toFixed(2)}).`,
  scoreExplanationBlocked: (score: number, block: number) =>
    `This category is blocked because its score (${score.toFixed(
      2,
    )}) is at or above the block threshold (${block.toFixed(2)}).`,
  scoreExplanationAllowed: (score: number, flag: number) =>
    `This category is allowed because its score (${score.toFixed(
      2,
    )}) is below the flag threshold (${flag.toFixed(2)}).`,
  scoreSourcedFromPrefix: "Score sourced from",
  subFieldNoteTemplate: (
    parentLabel: string,
    sub: { label: string; flag: number; block?: number; score: number; verdict: string },
  ) => {
    const thresholdRange =
      sub.block !== undefined
        ? `threshold ${sub.flag.toFixed(2)} / ${sub.block.toFixed(2)}`
        : `threshold ${sub.flag.toFixed(2)}`;
    const verdictPhrase =
      sub.verdict === "ALLOWED"
        ? "below flag threshold → ALLOWED"
        : sub.verdict === "FLAGGED"
          ? "between flag and block thresholds → FLAGGED"
          : "above block threshold → BLOCKED";
    return `This category also has a ${sub.label} sub-field (${thresholdRange}) — score ${sub.score.toFixed(
      2,
    )}, ${verdictPhrase}.`;
  },

  perTimecodeHeader: "PER-TIMECODE BREAKDOWN",
  scrubberLabel:
    "Drag the thumb to scrub through the asset. The marker shows the highest-scoring frame.",
  perTimecodeFooterNoteTemplate: (score: number) =>
    `This category's score (${score.toFixed(
      2,
    )}) is the highest score from any single frame. Frames with a near-zero score are hidden.`,
  noFrameContributionsNote:
    "No per-timecode breakdown is available for this category.",

  policyHeader: "POLICY REFERENCE",
  policyRuleIdLabel: "Rule ID",
  policyPolicyPackLabel: "Policy pack",
  policyThresholdSourceLabel: "Threshold source",
  policyAppliedToLabel: "Applied to",
  policyEvidencePackLabel: "Evidence Pack reference",
  policyAppliedAssetScoreField: "Asset score",
  policyAppliedRowTemplate: (field: string, flag: number, block?: number) =>
    block !== undefined
      ? `${field} (flag at ${flag.toFixed(2)}, block at ${block.toFixed(2)})`
      : `${field} (flag at ${flag.toFixed(2)})`,
  policyThresholdSourceTextTemplate: (
    source: string,
    presetId: string | undefined,
    advisoryOnly: boolean,
  ) => {
    if (source === "SYSTEM_DEFAULT") {
      return "System default (not overridden by workspace or geo preset)";
    }
    if (source === "GEO_PRESET") {
      const base = `Geo preset${presetId ? ` (${presetId})` : ""}`;
      return advisoryOnly
        ? `${base}, advisory only (block threshold suppressed)`
        : base;
    }
    if (source === "WORKSPACE_OVERRIDE") {
      return "Workspace override";
    }
    return source;
  },

  backCta: "Back to results overview",
  nextCategoryCtaTemplate: (label: string) => `Next category: ${label}`,
} as const;

export const VERDICT_LABELS = {
  BLOCKED: "BLOCKED",
  FLAGGED: "FLAGGED",
  ALLOWED: "ALLOWED",
} as const;

export const THRESHOLD_SOURCE_LABELS = {
  SYSTEM_DEFAULT: "SYSTEM_DEFAULT",
  GEO_PRESET: "GEO_PRESET",
  WORKSPACE_OVERRIDE: "WORKSPACE_OVERRIDE",
} as const;

export const MODALITY_LABELS = {
  IMAGE: "Image",
  VIDEO: "Video",
  AUDIO: "Audio",
} as const;
