import type {
  Banner,
  PreFlightState,
} from "@/components/preflight/types";

export const BANNER_COPY: Record<PreFlightState, Banner> = {
  EVALUATION_IN_PROGRESS: {
    tone: "in-progress",
    title: "Scanning in progress",
    description:
      "Detection Service and Policy Engine evaluation pipeline is running. Results will appear automatically when complete — no refresh needed.",
    tag: "EVALUATION_IN_PROGRESS",
  },
  BLOCK_UNTIL_REMEDIATED: {
    tone: "block",
    title: "Action required — asset blocked",
    description:
      "Mandatory violations must be resolved before this asset can proceed to Legal review.",
    tag: "BLOCK_UNTIL_REMEDIATED",
  },
  DISCLOSURE_CHALLENGE_PENDING: {
    tone: "challenge",
    title: "Detection challenge submitted — pending Legal review",
    description:
      "Disclosure obligation is suspended — not dismissed. Asset remains blocked until Legal accepts or rejects the challenge. Other engine actions remain available.",
    tag: "DISCLOSURE_CHALLENGE_PENDING",
  },
  SYSTEM_ERROR_POLICY_UNAVAILABLE: {
    tone: "system-error",
    title: "Review temporarily unavailable",
    description:
      "This is a system issue on our end — not a compliance violation with your content. Our team has been automatically notified.",
    tag: "SYSTEM_ERROR_POLICY_UNAVAILABLE",
  },
  ALLOW_WITH_WARNINGS: {
    tone: "allow-warnings",
    title: "Review recommended — advisory items exist",
    description:
      "No mandatory violations. Asset can proceed — review advisory items before submitting for Legal approval.",
    tag: "ALLOW_WITH_WARNINGS",
  },
  ALLOW: {
    tone: "allow",
    title: "Cleared for release",
    description:
      "All engines returned terminal state with no advisories. Ready for Legal attestation and evidence pack generation.",
    tag: "ALLOW",
  },
  APPROVED_PENDING_PROOF: {
    tone: "approved-pending-proof",
    title: "Legal approved — disclosure proof required",
    description:
      "Legal has attested and approved this asset. Upload your disclosure proof to complete publish clearance. The Evidence Pack PDF will generate automatically once proof is confirmed.",
    tag: "APPROVED_PENDING_PROOF",
  },
  PUBLISH_CLEARED: {
    tone: "publish-cleared",
    title: "Cleared for publish",
    description:
      "All compliance checks passed. Legal has attested. Disclosure proof confirmed. Evidence Pack generated and stored. This asset is cleared for publication.",
    tag: "PUBLISH_CLEARED",
  },
};

export const AUDIT_FOOTER_TEXT = "";

export const SYSTEM_ERROR_COPY = {
  strapline: "System issue — not a policy verdict",
  title: "Review temporarily unavailable",
  description:
    "Asset review is temporarily unavailable due to a system issue on our end. This is not a compliance violation with your content. Our team has been automatically notified and is working to resolve this. Please retry shortly.",
  retryLabel: "Retry evaluation",
};

export const NO_VIOLATIONS_GUARD =
  "No violations detected — checks passed below.";

export const AWAITING_RESULTS_COPY = {
  header: "POLICY VERDICT & REQUIRED ACTIONS",
  title: "Awaiting results",
  description:
    "Policy Engine evaluation is running. Results will appear automatically — no need to refresh this page.",
};

export const MODALITY_PROGRESS_COPY = {
  headerTitle: "PER-MODALITY ANALYSIS PROGRESS",
  headerSubtitle: "Video asset",
  footerNote:
    "Verdict is withheld until all image, video, and audio analyses are complete.",
};

export const ENGINE_PANEL_COPY = {
  inProgressSubtitle: "engines not yet triggered",
  allTerminalSubtitle: "all three at terminal state",
  allClearSubtitle: "all three at terminal state · no advisories",
  systemErrorSubtitle:
    "not started · Policy Engine must return verdict before engines are triggered",
  allTerminalStrip:
    "All three engines at terminal state — Submit for Approval is now available",
  allClearStrip: "All engines complete, no pending items",
  challengeStrip:
    "Disclosure obligation is suspended — not dismissed. Provenance and Brand Suitability engines continue uninterrupted.",
};

export const DETECTION_SUBTITLE_COPY = {
  inProgress: "awaiting Detection Service response",
  allow: "all checks below threshold",
};

export const EVIDENCE_PACK_DISABLED_TOOLTIP = {
  blocked:
    "Cannot generate evidence pack until all obligations are resolved and engines report terminal state.",
  allowWithAdvisories:
    "Evidence pack generation unlocks once the asset is submitted to Legal and approved.",
};

export const SUBMIT_FOR_APPROVAL_ADVISORY_CONFIRM = (advisoryCount: number) =>
  `${advisoryCount} advisory item${advisoryCount === 1 ? "" : "s"} exist — are you sure you want to submit for Legal approval?`;

export const TAMPERED_MANIFEST_COPY = {
  title: "C2PA manifest tampered",
  description:
    "The embedded C2PA manifest no longer matches the signed hash. The governance-embedded version of this asset cannot be trusted.",
};

export const DETECTION_LABELS = {
  synthetic: "Synthetic / AI-generated",
  syntheticCallout: (score: number) =>
    `Synthetically generated face detected. Score: ${score.toFixed(2)}`,
  humanPresenceRpl: "Human presence / RPL",
  provenance: "Provenance",
  moderationPrefix: "Brand suitability —",
  moderationLabels: {
    nudity: "nudity",
    alcohol: "alcohol",
    minors: "minors",
    violence: "violence",
    hate_symbols: "hate symbols",
    weapons: "weapons",
    drugs: "drugs",
    gambling: "gambling",
    tobacco: "tobacco",
  },
};

export const ENGINE_LABELS = {
  disclosure: "DISCLOSURE ENGINE",
  provenance: "PROVENANCE ENGINE",
  brand_suitability: "BRAND SUITABILITY",
};

export const ENGINE_STATUS_LABELS: Record<string, string> = {
  DISCLOSURE_NOT_REQUIRED: "Not required",
  DISCLOSURE_REQUIRED: "Action required",
  DISCLOSURE_SPEC_LOCKED: "Spec locked",
  DISCLOSURE_CHALLENGE_PENDING: "Challenge pending",
  APPROVED_PENDING_PROOF: "Proof pending",
  DISCLOSURE_PROOF_UPLOADED: "Proof uploaded",
  RPL_CONSENT_ATTACHED: "Consent attached",
  HUMAN_PRESENCE_DECLARED: "Presence declared",
  RPL_NO_CONSENT_BLOCK: "Hard blocked",
  PROVENANCE_PENDING: "Not started",
  PROVENANCE_EMBEDDING: "Embedding in progress",
  PROVENANCE_EMBEDDED: "Embedded",
  PROVENANCE_EMBED_FAILED: "Embed failed",
  MANIFEST_TAMPERED_FLAGGED: "Manifest tampered",
  BRAND_SUITABILITY_PENDING: "Not started",
  BRAND_SUITABILITY_CLEAR: "Clear",
  BRAND_SUITABILITY_FLAGGED_REVIEWED: "Flagged reviewed",
  BRAND_SUITABILITY_BLOCKED: "Blocked",
  BRAND_SUITABILITY_ASSET_WITHDRAWN: "Asset withdrawn",
};

export const ENGINE_STATUS_LABELS_LEGAL: Record<string, string> = {
  ...ENGINE_STATUS_LABELS,
  PROVENANCE_EMBED_FAILED: "Failed · noted",
  PROVENANCE_EMBED_FAILED_ACKNOWLEDGED: "Acknowledged",
  BRAND_SUITABILITY_BLOCKED: "Block · Legal required",
  BRAND_SUITABILITY_LEGAL_APPROVED: "Legal approved",
};

export const TOP_BAR_COPY = {
  trailPrefix: ["Asset Library", "Pre-Flight Review"],
  workspaceLabel: (name: string) => `Workspace: ${name}`,
};

export const CHALLENGE_PANEL_COPY = {
  summaryHeader: "Detection summary",
  justificationLabel: "Your justification",
  justificationPlaceholder: "Please explain why this detection is incorrect…",
  declarationLabel:
    "I confirm that to the best of my knowledge this asset is human-generated and the AI detection result is incorrect. I understand this challenge is recorded and reviewed.",
  footerNoteReady:
    "Submitting sends this challenge to Legal for review and pauses the AI disclosure requirement until they respond. This action is permanent and cannot be undone.",
  footerNoteBlocked: (minLength: number) =>
    `Submit disabled until justification is at least ${minLength} characters and the declaration is confirmed.`,
  submitLabel: "Submit challenge",
} as const;
