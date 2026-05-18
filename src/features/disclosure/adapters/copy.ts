export const STEP_LABELS = {
  requirement: "Requirement & text",
  placementDeclaration: "Placement declaration",
  placementDetails: "Placement details",
  lock: "Lock",
};

export const TOP_BAR_COPY = {
  trailPrefix: ["Asset Library", "Pre-Flight"],
  workspaceLabel: "Workspace: Acme EU",
  coverageLabels: [
    "#17 Disclosure Requirement Alert",
    "#18 Disclosure Specification Form",
    "#19 Template Selector (inline)",
  ],
};

export const REQUIREMENT_ALERT_COPY = {
  title: "Disclosure required — AI origin detected",
  body: "This asset has been detected as AI-generated content. A disclosure label is mandatory before publication under EU AI Act Article 50(1). Complete the specification below and lock it to proceed to Legal review.",
  severityLabel: "MANDATORY",
  detectionHeader: "Detection summary",
  detectionNote:
    "FULL means the entire asset is AI-generated. Scope is set automatically by detection and can't be changed here. PARTIAL scope (segment-only detection) requires time-range fields in Section C.",
  gridLabels: {
    trigger_type: "TRIGGER TYPE",
    disclosure_level: "DISCLOSURE LEVEL",
    policy_basis: "POLICY BASIS",
    geo_context: "GEO CONTEXT",
    channel_platform: "CHANNEL / PLATFORM",
    risk_indicator: "RISK INDICATOR",
  },
  disclosureLevelLabels: {
    MANDATORY: "Mandatory",
    ADVISORY: "Advisory",
  } as Record<string, string>,
  detectionPillSuffix: " · system-set",
};

export const TEMPLATE_STRIP_COPY = {
  badgeLabel: "Template auto-applied",
  bodyPrefix: "Template pre-filled based on:",
  arrowSymbol: "→",
  bodyMeta: "Edit the text below or select a different template.",
  changeLinkLabel: "Change template",
  emptyMessage: "No template matched the detection context yet.",
};

export const SECTION_A_COPY = {
  badgeLetter: "1",
  title: "Disclosure text",
  headerMeta: "500 character maximum",
  textareaLabel: "DISCLOSURE TEXT",
  charCounterTemplate: "{count} / {max} characters",
  helperText:
    "Pre-filled from template. Edit to match your brand voice. Disclosure meaning must be preserved.",
  languageLabel: "LANGUAGE",
  languageHelperText: "",
  scopeLabel: "SCOPE",
  scopeSourceLabel: "system-set",
  scopeHelperText: "",
  maxChars: 500,
};

export const SECTION_B_COPY = {
  badgeLetter: "2",
  title: "Placement declaration",
  defaultPrompt: "Please select the disclosure type for this asset.",
  options: {
    ON_ASSET: {
      label: "On asset",
      description: "Disclosure label embedded visually on the asset itself",
      recommended: true,
    },
    CAPTION_ONLY: {
      label: "Caption only",
      description: "Disclosure in post caption / description. Not on the asset.",
    },
    BOTH: {
      label: "Both",
      description:
        "Disclosure appears on asset AND in caption. All fields for both required.",
    },
    EXTERNAL_IMPLEMENTATION: {
      label: "External",
      description:
        "Implemented via a third-party system. Requires justification + acknowledgement.",
    },
  },
};

export const SECTION_C_COPY = {
  badgeLetter: "3",
  title: "Placement details",
  locationLabel: "PLACEMENT LOCATION",
  locationPlaceholder: "Choose a location",
  locationHelper:
    "Select where the disclosure label will appear on the asset.",
  scopeLabel: "SCOPE DURATION",
  fullDurationLabel: "Full duration",
  fullDurationHelperNoLocation:
    "Please select a placement location first.",
  fullDurationHelperFull:
    "Full scope. The disclosure persists across the entire asset.",
  fullDurationHelperPartial:
    "Not applicable for Partial scope. Please confirm time range below.",
  timeRangeStartLabel: "START TIME (MS)",
  timeRangeEndLabel: "END TIME (MS)",
  timeRangeStartPlaceholder: "e.g. 0",
  timeRangeEndPlaceholder: "e.g. 32000",
  timeRangeHelperPartial:
    "Set the segment where the disclosure applies. Start time must be earlier than end time.",
  timeRangeHelperFull:
    "Activates when scope is Partial.",
  captionTextLabel: "CAPTION TEXT",
  captionTextPlaceholder: "Enter caption text…",
  captionFirstLineLabel:
    "Confirm the disclosure appears in the caption's first line.",
  externalJustificationLabel: "JUSTIFICATION FOR EXTERNAL DISCLOSURE",
  externalJustificationPlaceholder: "Enter justification…",
  externalAckLabel: "Acknowledge external disclosure obligations.",
  locationOptions: [
    { value: "BOTTOM_LEFT", label: "Bottom left" },
    { value: "BOTTOM_RIGHT", label: "Bottom right" },
    { value: "TOP_LEFT", label: "Top left" },
    { value: "TOP_RIGHT", label: "Top right" },
    { value: "CENTER_BOTTOM", label: "Center-bottom overlay" },
  ] as const,
};

export const VALIDATION_PANEL_COPY = {
  badgeLabel: "4",
  title: "Pre-lock validation",
  pendingPillTemplate: "All {total} checks must pass",
  passPill: "All checks pass",
};

export const VALIDATION_CHECK_LABELS: Record<string, string> = {
  DISCLOSURE_TEXT_PRESENT: "Disclosure text provided",
  PLACEMENT_TYPE_SELECTED: "Placement type selected",
  REQUIRED_FIELDS_COMPLETE: "Required placement fields complete",
  TIME_RANGE_VALID: "Time range valid",
  CAPTION_FIRST_LINE_CONFIRMED: "Disclosure appears in caption's first line",
  EXTERNAL_ACKNOWLEDGED: "External implementation acknowledged",
};

export const LOCK_FOOTER_COPY = {
  ctaLabel: "Lock Disclosure Specification",
  pendingHeading: (pass: number, total: number) =>
    `${pass} of ${total} checks complete`,
  pendingBody: "Please resolve the pending checks to proceed.",
  readyHeading: "All checks pass",
  readyBody: "Lock to finalize the disclosure specification.",
  lockedHeading: "Specification locked",
  lockedBody: "This specification is finalized and ready for Legal review.",
};

export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English (EN)" },
  { value: "de", label: "Deutsch (DE)" },
  { value: "fr", label: "Français (FR)" },
  { value: "es", label: "Español (ES)" },
  { value: "it", label: "Italiano (IT)" },
];

export const PLACEMENT_LOCATION_LABELS: Record<string, string> = {
  BOTTOM_LEFT: "Bottom left",
  BOTTOM_RIGHT: "Bottom right",
  TOP_LEFT: "Top left",
  TOP_RIGHT: "Top right",
  CENTER_BOTTOM: "Center-bottom overlay",
};

export const GEO_LABELS: Record<string, string> = {
  EU: "EU",
  DE: "DE",
  FR: "FR",
  US: "US",
  UK: "UK",
};

export const TRIGGER_LABELS: Record<string, string> = {
  TRIGGER_AI_ORIGIN: "TRIGGER_AI_ORIGIN",
  TRIGGER_SPONSORED_CONTENT: "TRIGGER_SPONSORED_CONTENT",
  TRIGGER_RPL_CONSENT_REQUIRED: "TRIGGER_RPL_CONSENT_REQUIRED",
  TRIGGER_RPL_DEEPFAKE: "TRIGGER_RPL_DEEPFAKE",
};
