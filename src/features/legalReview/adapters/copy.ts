export const LEGAL_DASHBOARD_COPY = {
  brandLockup: "Praetion AI",
  reviewerBadge: "Reviewer",
  legalBadge: "Legal",
  workspaceLabelPrefix: "Workspace:",

  legalTitle: "Legal Approver Queue",
  legalSubtitle:
    "Pending review and reviewed approvals across the workspace.",
  reviewerTitle: "My Submissions",
  reviewerSubtitle: "Track approval, proof upload, and remediation.",

  tabPending: "Pending Review",
  tabReviewed: "Reviewed",
  tabAll: "All",
  tabPendingLegal: "Pending Legal review",
  tabAwaitingMyAction: "Awaiting my action",
  tabApproved: "Approved",

  kpiPendingReview: "Pending Review",
  kpiWaitingOver8h: "Waiting 8+ hours",
  kpiWaitingOver24h: "Waiting 24+ hours",
  kpiReviewedToday: "Reviewed Today",

  priorityCritical: "Critical · Hard Block Escalations",
  priorityHigh: "High · Detection Challenges",
  priorityStandard: "Standard · Attestation Only",

  reviewedAwaitingProof: "Awaiting Reviewer Proof Upload",
  reviewedPackReady: "Evidence Pack Ready",
  reviewedRejected: "Rejected · Awaiting Reviewer Resubmission",

  filterToday: "Today",
  filter7Days: "7 Days",
  filter30Days: "30 Days",
  filterAllTime: "All time",

  reviewCta: "Review",
  uploadProofCta: "Upload Proof",
  downloadPdfCta: "Download PDF",
  reopenPreflightCta: "Re-open Pre-Flight",
  awaitingLegalLabel: "Awaiting Legal",
  pendingReviewerProofLabel: "Pending Reviewer proof",
  forcePassBadge: "Force Pass",

  emptyPendingTitle: "No approvals waiting",
  emptyPendingBody:
    "All Reviewer submissions for this workspace are reviewed.",
  emptyReviewedTitle: "Nothing reviewed in this window",
  emptyReviewedBody: "Adjust the date range or check the Pending tab.",

  loadingTitle: "Loading approvals…",
};

export const LEGAL_PREFLIGHT_COPY = {
  bannerStateATitle: (count: number) =>
    `Legal review mode. ${count} item${count === 1 ? "" : "s"} require${count === 1 ? "s" : ""} your attention before attesting`,
  bannerStateASubline: (submittedBy: string, ageLabel: string, priorityLabel: string) =>
    `Submitted by ${submittedBy} (Reviewer) · ${ageLabel} · Priority: ${priorityLabel}`,
  bannerStateBTitle: "All items resolved, ready to attest",
  bannerStateBSubline:
    "Challenge accepted, brand suitability approved, provenance acknowledged. Approve and Attest is now available.",
  bannerCleanTitle: "Legal review mode, no pending items. Ready to attest",
  bannerCleanSubline: (submittedBy: string, ageLabel: string) =>
    `Submitted by ${submittedBy} (Reviewer), ${ageLabel}. Standard attestation only`,
  bannerHardBlockTitle: "Hard block escalated to Legal. Consent not obtainable.",
  bannerHardBlockSubline:
    "This AI generated asset contains a real person likeness. No consent was declared. The asset was automatically escalated and the Reviewer cannot act. Force Pass is the only path forward.",
  bannerPostAttestationTitle: "Approval recorded, attestation complete",
  bannerPostAttestationSubline:
    "Your attestation has been permanently stored. The Reviewer has been notified and this asset now appears in your Reviewed Today tab.",

  tagUnderReview: "UNDER_REVIEW",
  tagReadyToAttest: "UNDER_REVIEW",
  tagBlockNonOverridable: "BLOCK_NON_OVERRIDABLE",
  tagApproved: "APPROVED",

  itemChallengeTitle: "RESOLVE DETECTION CHALLENGE",
  itemBrandBlockTitle: "RESOLVE BRAND SUITABILITY BLOCK",
  itemProvenanceTitle: "ACKNOWLEDGE PROVENANCE SYSTEM FAILURE",

  itemChallengeReviewerJustificationLabel: "REVIEWER JUSTIFICATION",
  itemChallengeDeclarationLabel: "Declaration confirmed by Reviewer",
  itemChallengeAcceptCta: "Accept challenge",
  itemChallengeRejectCta: "Reject challenge",
  itemChallengeAcceptHint:
    "Accept → exits Disclosure Engine as human-generated · disclosure obligation removed.",
  itemChallengeRejectHint:
    "Reject → returns to DISCLOSURE_REQUIRED · mandatory rejection reason required.",

  itemBrandBlockHeader: (
    category: string,
    score: number,
    threshold: number,
    _rule: string,
  ) =>
    `${category} content detected (score ${score.toFixed(2)}) and blocked. Exceeds the strict threshold of ${threshold.toFixed(2)} set for this workspace.`,
  itemBrandBlockCommentaryPlaceholder:
    "Mandatory commentary — min 50 characters. Explain why this BLOCKED brand suitability category is acceptable for this campaign.",
  itemBrandBlockCommentaryHint:
    "Min 50 characters · stored verbatim in Evidence Pack Section 5 · declaration required",
  itemBrandBlockDeclaration: (category: string) =>
    `I confirm I have reviewed the flagged content and approve this asset with the ${category.toUpperCase()} category on record.`,
  itemBrandBlockApproveCta: "Approve with commentary",
  itemBrandBlockRejectCta: "Reject",

  itemProvenanceTitleHeader:
    "Provenance embedding was unsuccessful due to a system error. The asset has been automatically proceeded and no further action is required.",
  itemProvenanceBody:
    "The system was unable to embed a C2PA provenance manifest into this asset due to a system error. The asset was automatically proceeded. Please acknowledge this record before proceeding with attestation.",
  itemProvenanceDeclaration:
    "I acknowledge the C2PA embedding failure. This is a system record and does not affect my compliance decision.",

  itemChallengeResolvedLabel: "Challenge accepted",
  itemBrandBlockResolvedLabel: "Brand block approved",
  itemProvenanceResolvedLabel: "Provenance acknowledged",

  approveLockedTitle: (n: number) =>
    `Approve & Attest — locked until all ${n} items above are resolved`,
  approveLockedDescription: (n: number) =>
    `Complete Items 1${n >= 2 ? ", 2" : ""}${n >= 3 ? " and 3" : ""} above. The Approve & Attest form and CTA unlock automatically once all pending items reach a resolved state.`,
  approveActiveTitleResolved: "Approve and Attest",
  approveActiveTitleClean: "Approve and Attest",
  approveAutoPopulatedHeader: "AUTO-POPULATED, READ-ONLY",
  approveAssetLabel: "ASSET",
  approveApprovalIdLabel: "APPROVAL ID",
  approveWorkspaceLabel: "WORKSPACE",
  approveAttestationTimestampLabel: "ATTESTATION TIMESTAMP",
  approveAttestationTimestampValue: "Auto-set on submit",
  approveTypedSignatureLabel: "TYPED SIGNATURE",
  approveTypedSignatureRequired: "Required",
  approveTypedSignatureHint: "",
  approveTypedSignaturePlaceholder: "Type your full legal name to confirm attestation (must match your registered name).",
  approveTypedSignatureFooter: "",
  approveOverrideCommentaryLabel: "OVERRIDE COMMENTARY",
  approveOverrideCommentaryHint: "Optional",
  approveOverrideCommentaryPlaceholder:
    "Any additional notes on this approval decision (optional).",
  approveDeclaration:
    "I confirm I have reviewed all compliance results for this asset and attest that it meets the applicable regulatory requirements for publication. I understand this attestation is stored permanently in the WORM audit trail and the Evidence Pack.",
  approveSubmitFooter:
    "Your attestation will be stored permanently and cannot be edited after submission.",
  approveSubmitHint: "Complete all required fields to submit.",
  approveSubmitCta: "Approve & Attest",

  rejectFormHeader: "Reject asset",
  rejectFormSubheader: "Reject and route back to the Reviewer with instructions.",
  rejectNotesLabel: "Rejection notes",
  rejectNotesRequired: "Required",
  rejectNotesPlaceholder:
    "Provide the reason for this rejection…",
  rejectEnginesLabel: "Engines to unlock",
  rejectEngineDisclosureLabel: "Disclosure",
  rejectEngineDisclosureSubtext: "Reviewer will revise disclosure",
  rejectEngineBrandLabel: "Brand Suitability",
  rejectEngineBrandSubtext: "Reviewer can re-upload or withdraw",
  rejectEngineProvenanceLabel: "Provenance",
  rejectEngineProvenanceSubtext: "Cannot be unlocked by Reviewer",
  rejectEngineProvenanceDisabledNote: "Not applicable",
  rejectTypedSignatureLabel: "Typed signature",
  rejectTypedSignatureRequired: "Required",
  rejectTypedSignaturePlaceholder: "Type your full name to confirm rejection",
  rejectSubmitCta: "Confirm rejection",

  forcePassFormHeader: "FORCE PASS WITH MANDATORY COMMENTARY",
  forcePassTitle: "Force Pass overrides the compliance block. This action is permanently recorded.",
  forcePassCommentaryLabel: "OVERRIDE COMMENTARY",
  forcePassCommentaryRequired: "Required",
  forcePassCommentaryHint: "minimum 50 characters, stored verbatim in the Evidence Pack",
  forcePassCommentaryPlaceholder:
    "Document why standard attestation is being overridden. This is permanently recorded with your name…",
  forcePassTypedSignatureLabel: "TYPED SIGNATURE",
  forcePassTypedSignatureRequired: "Required",
  forcePassTypedSignaturePlaceholder: "Type your full legal name to confirm override",
  forcePassDeclaration:
    "I accept personal accountability for this override. I have reviewed the full evidence chain and elect to publish despite the open compliance items.",
  forcePassSubmitCta: "Confirm Force Pass",

  footerBackToQueue: "Back to queue",
  footerBackToQueueHint: "Return to the queue without recording a decision.",
  footerNavigationOnlyA: "No decision is recorded when you navigate away.",
  footerNavigationOnlyB: "The asset stays under review. Return any time to continue.",
  footerNavigationOnlyShort:
    "No decision recorded. Asset stays under review.",
  footerLegalOnly: "Legal only",
  footerRejectAsset: "Reject asset",
  footerRejectHint: "Reject and route back to the Reviewer with instructions.",
  footerForcePass: "Force pass",
  footerForcePassHint: "Override the compliance block with mandatory commentary.",
  footerForcePassWithCommentary: "Force pass with commentary",
  hardBlockBackToQueueHint:
    "If Force Pass is not appropriate, return the asset to the queue. It will remain in its current state until Legal takes action or the asset is withdrawn.",

  itemsResolvedHeader: "ITEMS RESOLVED",

  escalationReasonHeader: "ESCALATION REASON",
  escalationTriggerHeader: "WHY THIS WAS ESCALATED",
  escalationReviewerDeclarationPrefix: "Reviewer declaration:",
  escalationAuditEventPrefix: "Audit event:",

  hardBlockDeclarationTitle: "Reviewer declared that consent cannot be obtained. Reason on record.",
  hardBlockDeclarationFooter:
    "This declaration has been permanently recorded in the audit trail and cannot be edited or removed.",
  hardBlockDisabledTitle: "Standard approval path is not available for this asset",
  hardBlockDisabledApproveAttestNote:
    "Not available. This hard block cannot be resolved via standard attestation.",
  hardBlockDisabledBrandNote:
    "Not applicable. Brand suitability is clear for this asset.",

  postSuccessTitle: "Attestation complete",
  postSuccessBody: (reviewedTodayLabel: string) =>
    `Your approval and attestation have been recorded permanently in the WORM audit trail. The Reviewer has been notified. This asset now appears in your ${reviewedTodayLabel} tab.`,
  postSuccessReviewedTodayLabel: "Reviewed Today",
  postSuccessAttestationRecordTitle: "ATTESTATION RECORD",
  postSuccessFieldAsset: "Asset",
  postSuccessFieldApprovalId: "Approval ID",
  postSuccessFieldAttestedBy: "Attested by",
  postSuccessFieldAttestedAt: "Attested at",
  postSuccessFieldAttestationId: "Attestation ID",
  postSuccessFieldDisclosurePath: "Disclosure path",
  postSuccessDisclosureNotRequired:
    "No disclosure required. Evidence Pack generating automatically.",
  postSuccessDisclosureApprovedPendingProof:
    "Approved, pending proof upload. Evidence Pack generates after Reviewer uploads proof.",
  postSuccessNextHeader: "WHAT HAPPENS NEXT",
  postSuccessNextStatusLabel: "NO FURTHER ACTION REQUIRED FROM REVIEWER",
  postSuccessNextItems: [
    "Asset is marked publish cleared. Your team can now publish the final asset.",
    "Asset appears in Approved Assets on the Legal Approver's dashboard, with a permanent link to the Evidence Pack.",
    "Evidence Pack is permanently accessible. Download links regenerate on each request and expire after 15 minutes.",
    "All events have been recorded in the audit trail, from initial detection through disclosure, consent, Legal review, proof upload, and Evidence Pack generation.",
  ] as readonly string[],
  postSuccessNextItemsProofPending: [
    "The Reviewer has been notified to upload disclosure proof before the asset can be published.",
    "Once proof is uploaded, the Evidence Pack will generate automatically.",
    "Asset appears in Approved Assets on the Legal Approver's dashboard, with a permanent link to the Evidence Pack once ready.",
    "All events have been recorded in the audit trail, from initial detection through disclosure, consent, Legal review, and approval.",
  ] as readonly string[],
  postSuccessReturnCta: "Return to Legal Queue",
  postSuccessReturnHintA: "No further action needed on this asset.",
  postSuccessReturnHintB: "Evidence Pack will be available from the queue.",
  postSuccessViewEvidencePackCta: "View Evidence Pack",

  detectionResultsHeaderHint: "read-only · Legal cannot edit detector scores",

  engineStatusHeaderClean: "ENGINE STATUS — ALL AT TERMINAL STATE · NO PENDING ITEMS",
};

export const EVIDENCE_PACK_PREVIEW_COPY = {
  brandLockup: "Praetion AI",
  pageTitle: "Evidence Pack for",
  packLabel: "Evidence Pack Preview",

  trailPreFlight: "Pre-Flight",
  trailEvidencePackPreview: "Evidence Pack Preview",
  topBarRoleLabel: "Reviewer / Legal",
  topBarWorkspacePrefix: "Workspace",
  topBarAccessibleHint:
    "Accessible from Pre-Flight publish-cleared · Screen #34",

  packCompleteBadge: "COMPLETE",
  packGeneratingBadge: "GENERATING",
  packFailedBadge: "FAILED",
  generatedPrefix: "Generated",
  weasyPrintLabel: "WeasyPrint PDF",
  s3ObjectLockSuffix: "S3 WORM Object Lock COMPLIANCE mode",
  preSignedHint: "Pre-signed URL · 15-min expiry · cannot be modified",

  sidebarHeader: "EVIDENCE PACK COMPLETED",
  sidebarAssetLabel: "Asset",
  sidebarGeneratedLabel: "Generated",
  sidebarShaLabel: "SHA-256",
  sidebarSectionsLabel: "Sections",
  sidebarStorageLabel: "Storage",
  sidebarSectionsHeader: "SECTIONS",
  generatedLabel: "Generated:",
  packIdLabel: "Pack ID:",
  shaLabel: "SHA-256:",
  sectionsLabel: "Sections:",
  storageLabel: "Storage:",
  defaultStorageLabel: "S3 WORM",

  downloadCta: "Download PDF",
  downloadHint: "Pre-signed URL · 15-min expiry",
  downloadDisabledHint: "Pack still generating — Download PDF unlocks at COMPLETE",
  downloadFailedHint:
    "Pack generation failed — re-run the generator to download.",
  copyShareLink: "Copy share link",

  sectionAssetDetails: "Asset Details",
  sectionDetectionResults: "Detection Results",
  sectionPolicyEngineRecord: "Policy Engine Record",
  sectionProvenanceRecord: "Provenance Record",
  sectionBrandSuitabilityRecord: "Brand Suitability Record",
  sectionDisclosureRecord: "Disclosure Record",
  sectionConsentRecord: "Consent & Likeness Record",
  sectionAttestationPage: "Attestation Page",

  badgeComplete: "COMPLETE",
  badgeNotApplicable: "NOT_APPLICABLE",
  badgeEmbedFailed: "EMBED_FAILED",
  badgePending: "PENDING",
  badgeLegalApproved: "LEGAL_APPROVED",
  badgeDisclosureProofUploaded: "DISCLOSURE_PROOF_UPLOADED",
  badgeApprovedPendingProof: "APPROVED_PENDING_PROOF",
  badgeForcePass: "FORCE_PASS",
  badgeWormStored: "WORM-STORED",

  asset1Filename: "FILENAME",
  asset1AssetId: "ASSET ID",
  asset1Modality: "MODALITY",
  asset1FileSize: "FILE SIZE",
  asset1Sha256Original: "SHA-256 (ORIGINAL)",
  asset1Uploaded: "UPLOADED",
  asset1Workspace: "WORKSPACE",
  asset1GeoContext: "GEO CONTEXT",

  detection2HeaderHint: "Read-only · scores from Detection Service",
  detectionTableDetector: "DETECTOR",
  detectionTableScore: "SCORE",
  detectionTableThreshold: "THRESHOLD",
  detectionTableVerdict: "VERDICT",
  detectionTableSource: "SOURCE",
  detectionEmpty: "No detector rows recorded",

  policy3FinalVerdict: "FINAL VERDICT",
  policy3PolicyPack: "POLICY PACK",
  policy3EvaluatedAt: "EVALUATED AT",
  policy3PreflightRunId: "PREFLIGHT RUN ID",
  policy3ObligationsHeader: "Obligations triggered",
  policy3ObligationsEmpty: "No obligations triggered",

  provenance4EmbeddingLabel: "C2PA EMBEDDING",
  provenance4FailureReason: "FAILURE REASON",
  provenance4NotApplicableLabel: "NOT_APPLICABLE",
  provenance4DefaultRationale:
    "C2PA embedding failed due to a system-side error. Asset auto-proceeded per Provenance Spec P0 Section 5.3. Legal acknowledged this failure during consolidated review. This failure does not invalidate the compliance decision.",

  brand5StatusLegalApproved: "LEGAL_APPROVED on record",
  brand5TableCategory: "CATEGORY",
  brand5TableScore: "SCORE",
  brand5TableVerdict: "VERDICT",
  brand5TableResolution: "RESOLUTION",
  brand5OtherCategoriesLabel: (count: number) => `Other categories (${count})`,
  brand5OtherCategoriesNote: "Below threshold · no action required",
  brand5LegalCommentaryHeader: "Legal approval commentary (verbatim)",
  brand5OverrideCommentaryHeader: "Override commentary (optional)",

  disclosure6Trigger: "TRIGGER",
  disclosure6Placement: "PLACEMENT",
  disclosure6Scope: "SCOPE",
  disclosure6FinalText: "DISCLOSURE TEXT (LOCKED)",
  disclosure6FinalTextUnlocked: "DISCLOSURE TEXT",
  disclosure6ProofType: "PROOF TYPE",
  disclosure6ProofFilename: "PROOF FILENAME",
  disclosure6ProofHash: "PROOF HASH",
  disclosure6ProofUploadedAt: "PROOF UPLOADED AT",
  disclosure6NotApplicable:
    "No disclosure obligation was triggered for this asset. Detection scores remained below thresholds.",

  consent7DefaultRationale:
    "No human presence was detected in this asset. Consent and likeness checks were not required.",

  attestation8Header: "Legal Attestation",
  attestation8AttestedBy: "ATTESTED BY",
  attestation8AttestationId: "ATTESTATION ID",
  attestation8AttestedAt: "ATTESTED AT",
  attestation8ApprovalId: "APPROVAL ID",
  attestation8TypedSignature: "TYPED SIGNATURE",
  attestation8DefaultDeclaration:
    "I confirm I have reviewed all compliance results for this asset and attest that it meets the applicable regulatory requirements for publication. This attestation is stored permanently in the WORM audit trail.",
  attestation8OverrideHeader: "Override commentary (optional)",
  attestation8ForcePassBadge: "FORCE PASS · OVERRIDE RECORDED",
};
