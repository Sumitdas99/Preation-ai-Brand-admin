import type {
  EpAssetDetails,
  EpAttestationPage,
  EpBrandSuitabilityRecord,
  EpConsentRecord,
  EpDetectionResults,
  EpDetectorVerdict,
  EpDisclosureRecord,
  EpPolicyEngineRecord,
  EpProvenanceRecord,
  EvidencePackPreview,
} from "@/api/schemas/evidencePackPreview";
import type {
  EvidencePackFooterData,
  EvidencePackHeaderData,
  EvidencePackKeyValue,
  EvidencePackPreviewData,
  EvidencePackSectionBody,
  EvidencePackSectionData,
  EvidencePackSectionShellData,
  EvidencePackSectionTone,
  EvidencePackSidebarData,
  EvidencePackSidebarItem,
  EvidencePackSidebarMetaRow,
  EvidencePackSidebarStatus,
  EvidencePackTopBarData,
} from "@/components/evidencePack/types";
import { EVIDENCE_PACK_PREVIEW_COPY as COPY } from "@/features/legalReview/adapters/copy";

export function toEvidencePackPreviewData(
  pack: EvidencePackPreview,
): EvidencePackPreviewData {
  const sections: EvidencePackSectionData[] = [
    buildAssetDetailsSection(pack.asset_details),
    buildDetectionResultsSection(pack.detection_results),
    buildPolicyEngineSection(pack.policy_engine_record),
    buildProvenanceSection(pack.provenance_record),
    buildBrandSuitabilitySection(pack.brand_suitability_record),
    buildDisclosureSection(pack.disclosure_record),
    buildConsentSection(pack.consent_record),
    buildAttestationSection(pack.attestation_page),
  ];

  return {
    topBar: buildTopBar(pack),
    header: buildHeader(pack),
    sidebar: buildSidebar(pack, sections),
    sections,
    footer: buildFooter(pack),
  };
}

function buildTopBar(pack: EvidencePackPreview): EvidencePackTopBarData {
  return {
    trail: [COPY.trailPreFlight, pack.asset_filename, COPY.trailEvidencePackPreview],
    roleLabel: COPY.topBarRoleLabel,
    workspaceLabel: pack.workspace_label
      ? `${COPY.topBarWorkspacePrefix}: ${pack.workspace_label}`
      : undefined,
  };
}

function buildHeader(pack: EvidencePackPreview): EvidencePackHeaderData {
  const generatedAtLabel = pack.generated_at
    ? `${COPY.generatedPrefix} ${formatDateTime(pack.generated_at)}`
    : undefined;
  const isComplete = pack.status === "COMPLETE";
  const isFailed = pack.status === "FAILED";
  const tone: EvidencePackSectionTone = isFailed
    ? "danger"
    : isComplete
      ? "complete"
      : "muted";
  const label = isComplete
    ? COPY.packCompleteBadge
    : isFailed
      ? COPY.packFailedBadge
      : COPY.packGeneratingBadge;
  return {
    title: `${COPY.pageTitle} ${pack.asset_filename}`,
    generatedAtLabel,
    pdfTypeLabel: COPY.weasyPrintLabel,
    wormStorageLabel: COPY.s3ObjectLockSuffix,
    packStatusBadge: { label, tone },
    preSignedHint: COPY.preSignedHint,
  };
}

function buildSidebar(
  pack: EvidencePackPreview,
  sections: EvidencePackSectionData[],
): EvidencePackSidebarData {
  const meta: EvidencePackSidebarMetaRow[] = [];
  meta.push({
    label: COPY.sidebarAssetLabel,
    value: pack.asset_filename,
    truncate: true,
  });
  if (pack.generated_at) {
    meta.push({
      label: COPY.sidebarGeneratedLabel,
      value: formatDateShort(pack.generated_at),
    });
  }
  if (pack.pack_sha256) {
    meta.push({
      label: COPY.sidebarShaLabel,
      value: shortHash(pack.pack_sha256),
      tone: "mono",
      truncate: true,
    });
  }
  meta.push({
    label: COPY.sidebarSectionsLabel,
    value: `${pack.sections_complete ?? 0} of ${pack.sections_count ?? 8} complete`,
  });
  meta.push({
    label: COPY.sidebarStorageLabel,
    value:
      pack.storage_label ??
      (pack.storage ? `${pack.storage}, immutable` : COPY.defaultStorageLabel),
  });

  const items: EvidencePackSidebarItem[] = sections.map((s) => ({
    key: s.shell.key,
    index: s.shell.index,
    label: s.shell.title,
    href: `#${s.shell.key}`,
    status: deriveSidebarStatus(s),
  }));

  const isComplete = pack.status === "COMPLETE";
  return {
    header: COPY.sidebarHeader,
    meta,
    sectionsHeader: COPY.sidebarSectionsHeader,
    items,
    downloadLabel: COPY.downloadCta,
    downloadHref: isComplete ? pack.download_url : undefined,
    downloadDisabled: !isComplete || !pack.download_url,
  };
}

function deriveSidebarStatus(
  section: EvidencePackSectionData,
): EvidencePackSidebarStatus | undefined {
  const tone = section.shell.statusBadge.tone;
  if (tone === "muted") return "not-applicable";
  return "complete";
}

function buildFooter(pack: EvidencePackPreview): EvidencePackFooterData {
  const isComplete = pack.status === "COMPLETE";
  const isFailed = pack.status === "FAILED";
  const expiryHint = isComplete
    ? COPY.downloadHint
    : isFailed
      ? COPY.downloadFailedHint
      : COPY.downloadDisabledHint;
  return {
    downloadCtaLabel: COPY.downloadCta,
    downloadHref: isComplete ? pack.download_url : undefined,
    downloadDisabled: !isComplete || !pack.download_url,
    expiryHint,
  };
}

function buildAssetDetailsSection(
  data: EpAssetDetails,
): EvidencePackSectionData {
  const rows: EvidencePackKeyValue[] = [];
  rows.push({ label: COPY.asset1Filename, value: data.filename });
  rows.push({
    label: COPY.asset1AssetId,
    value: data.asset_id,
    tone: "mono",
    truncate: true,
  });
  if (data.modality)
    rows.push({ label: COPY.asset1Modality, value: capitalize(data.modality) });
  if (data.file_size_label || typeof data.file_size_bytes === "number") {
    rows.push({
      label: COPY.asset1FileSize,
      value:
        data.file_size_label ??
        formatBytes(data.file_size_bytes ?? 0),
    });
  }
  if (data.sha256_original) {
    rows.push({
      label: COPY.asset1Sha256Original,
      value: data.sha256_original,
      tone: "mono",
      truncate: true,
    });
  }
  if (data.submitted_at) {
    rows.push({
      label: COPY.asset1Uploaded,
      value: formatDateTime(data.submitted_at),
    });
  }
  if (data.workspace_label) {
    rows.push({ label: COPY.asset1Workspace, value: data.workspace_label });
  }
  if (data.geo_context) {
    rows.push({ label: COPY.asset1GeoContext, value: data.geo_context });
  }
  return {
    shell: {
      key: "asset-details",
      index: 1,
      title: COPY.sectionAssetDetails,
      statusBadge: {
        label: data.status === "COMPLETE" ? COPY.badgeComplete : data.status,
        tone: data.status === "COMPLETE" ? "complete" : "muted",
      },
    },
    body: { kind: "key_values", rows },
  };
}

function buildDetectionResultsSection(
  data: EpDetectionResults,
): EvidencePackSectionData {
  const rows = data.rows.map((row) => {
    const tone = detectorVerdictTone(row.verdict);
    const verdictLabel =
      row.verdict_label ?? humaniseDetectorVerdict(row.verdict);
    return {
      detectorLabel: row.detector_label,
      scoreLabel: typeof row.score === "number" ? row.score.toFixed(2) : "—",
      thresholdLabel:
        row.threshold_label ?? (typeof row.threshold === "number" ? row.threshold.toFixed(2) : "—"),
      verdictLabel,
      verdictTone: tone,
      sourceLabel: row.source,
    };
  });
  const evaluatedLabel = data.evaluated_at
    ? formatDateShort(data.evaluated_at)
    : undefined;
  return {
    shell: {
      key: "detection-results",
      index: 2,
      title: COPY.sectionDetectionResults,
      statusBadge: {
        label:
          data.status === "COMPLETE"
            ? (evaluatedLabel ?? COPY.badgeComplete)
            : data.status,
        tone: data.status === "COMPLETE" ? "complete" : "muted",
      },
      intro: COPY.detection2HeaderHint,
    },
    body: {
      kind: "detection_table",
      rows,
      sourceSummary: data.source_summary,
    },
  };
}

function detectorVerdictTone(verdict: EpDetectorVerdict): EvidencePackSectionTone {
  switch (verdict) {
    case "BLOCK_BAND":
    case "BLOCKED":
      return "danger";
    case "FLAG_BAND":
    case "FLAGGED":
      return "warning";
    case "ALL_CLEAR":
    case "ALLOWED":
    case "ALLOW":
      return "approved";
    case "BELOW_THRESHOLD":
    case "NOT_DETECTED":
    case "NOT_APPLICABLE":
      return "muted";
    default:
      return "muted";
  }
}

function humaniseDetectorVerdict(verdict: EpDetectorVerdict): string {
  if (typeof verdict !== "string") return "—";
  return verdict.replace(/_/g, " ").toLowerCase().replace(/^./, (c) => c.toUpperCase());
}

function buildPolicyEngineSection(
  data: EpPolicyEngineRecord,
): EvidencePackSectionData {
  const verdictTone = policyVerdictTone(data.final_verdict);
  const kvTone: EvidencePackKeyValue["tone"] =
    verdictTone === "approved" ? "approved" : "warning";
  const keyValues: EvidencePackKeyValue[] = [];
  keyValues.push({
    label: COPY.policy3FinalVerdict,
    value: data.final_verdict,
    tone: kvTone,
  });
  if (data.policy_pack_id) {
    const version = data.policy_pack_version
      ? `_v${data.policy_pack_version}`
      : "";
    keyValues.push({
      label: COPY.policy3PolicyPack,
      value: `${data.policy_pack_id.toUpperCase()}${version}`,
      tone: "mono",
    });
  }
  if (data.evaluated_at) {
    keyValues.push({
      label: COPY.policy3EvaluatedAt,
      value: formatDateTime(data.evaluated_at),
    });
  }
  if (data.preflight_run_id) {
    keyValues.push({
      label: COPY.policy3PreflightRunId,
      value: data.preflight_run_id,
      tone: "mono",
      truncate: true,
    });
  }
  return {
    shell: {
      key: "policy-engine-record",
      index: 3,
      title: COPY.sectionPolicyEngineRecord,
      statusBadge: {
        label: data.status === "COMPLETE" ? COPY.badgeComplete : data.status,
        tone: data.status === "COMPLETE" ? "complete" : "muted",
      },
    },
    body: {
      kind: "policy_record",
      verdictLabel: data.final_verdict,
      verdictTone,
      keyValues,
      obligations: data.obligations_triggered,
      obligationsCaption: data.obligations_summary,
    },
  };
}

function policyVerdictTone(verdict: string): EvidencePackSectionTone {
  switch (verdict) {
    case "ALLOW":
      return "approved";
    case "ALLOW_WITH_WARNINGS":
      return "warning";
    case "BLOCK_NON_OVERRIDABLE":
      return "danger";
    case "BLOCK_UNTIL_REMEDIATED":
      return "danger";
    default:
      return "muted";
  }
}

function buildProvenanceSection(
  data: EpProvenanceRecord,
): EvidencePackSectionData {
  const isFailed = data.status === "EMBED_FAILED";
  const keyValues: EvidencePackKeyValue[] = [];
  if (data.c2pa_embed_status) {
    keyValues.push({
      label: COPY.provenance4EmbeddingLabel,
      value: data.c2pa_embed_status,
      tone: isFailed ? "warning" : "mono",
    });
  }
  if (data.failure_reason) {
    keyValues.push({
      label: COPY.provenance4FailureReason,
      value: data.failure_reason,
    });
  }
  return {
    shell: {
      key: "provenance-record",
      index: 4,
      title: COPY.sectionProvenanceRecord,
      statusBadge: {
        label: isFailed
          ? COPY.badgeEmbedFailed
          : data.status === "COMPLETE"
            ? COPY.badgeComplete
            : data.status,
        tone: isFailed ? "warning" : data.status === "COMPLETE" ? "complete" : "muted",
      },
    },
    body: {
      kind: "provenance_record",
      statusLabel: data.embed_status_label ?? data.status,
      statusTone: isFailed ? "warning" : "complete",
      reason: data.failure_reason,
      keyValues,
      notApplicableRationale: data.not_applicable_rationale,
    },
  };
}

function buildBrandSuitabilitySection(
  data: EpBrandSuitabilityRecord,
): EvidencePackSectionData {
  const categories = data.categories.map((c) => ({
    key: c.category_key,
    label: c.category_label,
    ruleId: ruleIdForCategory(c.category_key),
    scoreLabel: typeof c.score === "number" ? c.score.toFixed(2) : "—",
    verdictLabel: c.verdict,
    verdictTone: brandCategoryVerdictTone(c.verdict),
    resolutionLabel: humaniseResolution(c.resolution),
    resolutionTone: brandResolutionTone(c.resolution, c.verdict),
    commentary: c.commentary,
    commentaryFooter: buildCommentaryFooter(c.commentary_by, c.commentary_at),
  }));

  const otherCount = data.other_categories_count ?? 0;
  const otherCategoriesCaption =
    otherCount > 0
      ? `${COPY.brand5OtherCategoriesLabel(otherCount)} — ${COPY.brand5OtherCategoriesNote}`
      : undefined;

  const isLegalApproved = data.status === "LEGAL_APPROVED";
  return {
    shell: {
      key: "brand-suitability-record",
      index: 5,
      title: COPY.sectionBrandSuitabilityRecord,
      statusBadge: {
        label: isLegalApproved
          ? COPY.badgeLegalApproved
          : data.status === "COMPLETE"
            ? COPY.badgeComplete
            : data.status,
        tone: isLegalApproved
          ? "danger"
          : data.status === "COMPLETE"
            ? "complete"
            : "muted",
      },
      secondaryBadge: isLegalApproved
        ? { label: COPY.brand5SecondaryOverrideOnRecord, tone: "approved" as const }
        : undefined,
    },
    body: {
      kind: "brand_suitability_record",
      categories,
      otherCategoriesCaption,
      legalCommentary: data.legal_commentary,
      legalCommentaryHeader: data.legal_commentary
        ? COPY.brand5LegalCommentaryHeader
        : undefined,
      overrideCommentary: data.override_commentary,
      overrideCommentaryHeader: data.override_commentary
        ? COPY.brand5OverrideCommentaryHeader
        : undefined,
    },
  };
}

function brandCategoryVerdictTone(verdict: string): EvidencePackSectionTone {
  switch (verdict) {
    case "BLOCKED":
      return "danger";
    case "FLAGGED":
      return "warning";
    case "ALL_CLEAR":
    case "ALLOWED":
      return "approved";
    default:
      return "muted";
  }
}

function humaniseResolution(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  return raw.replace(/^BRAND_SUITABILITY_LEGAL_APPROVED\b/, "Approved by Legal");
}

function brandResolutionTone(
  resolution: string | undefined,
  verdict: string,
): EvidencePackSectionTone | undefined {
  if (!resolution) return undefined;
  if (verdict === "BLOCKED" && /approved/i.test(resolution)) return "approved";
  if (verdict === "FLAGGED") return "approved";
  return "muted";
}

function buildCommentaryFooter(
  commentaryBy: string | undefined,
  commentaryAt: string | undefined,
): string | undefined {
  if (!commentaryBy && !commentaryAt) return undefined;
  const dateLabel = commentaryAt ? formatDateShort(commentaryAt) : undefined;
  if (commentaryBy && dateLabel) return `${commentaryBy}, ${dateLabel}`;
  return commentaryBy ?? dateLabel;
}

function ruleIdForCategory(key: string): string | undefined {
  switch (key) {
    case "alcohol":
      return "BSC_008";
    case "violence":
      return "BSC_012";
    case "nudity_suggestive":
      return "BSC_004";
    default:
      return undefined;
  }
}

function buildDisclosureSection(
  data: EpDisclosureRecord,
): EvidencePackSectionData {
  const isNotApplicable = data.status === "NOT_APPLICABLE";
  const keyValues: EvidencePackKeyValue[] = [];

  if (data.trigger) {
    keyValues.push({ label: COPY.disclosure6Trigger, value: data.trigger });
  }
  if (data.disclosure_text) {
    keyValues.push({
      label: data.disclosure_text_locked
        ? COPY.disclosure6FinalText
        : COPY.disclosure6FinalTextUnlocked,
      value: `"${data.disclosure_text}"`,
    });
  }
  if (data.placement) {
    const scope = data.scope ? `${capitalize(data.scope.toLowerCase())} scope` : undefined;
    keyValues.push({
      label: COPY.disclosure6Placement,
      value: scope ? `${data.placement}, ${scope}` : data.placement,
    });
  } else if (data.scope) {
    keyValues.push({
      label: COPY.disclosure6Scope,
      value: capitalize(data.scope.toLowerCase()),
    });
  }
  if (data.proof_type) {
    keyValues.push({ label: COPY.disclosure6ProofType, value: data.proof_type });
  }
  if (data.proof_hash) {
    keyValues.push({
      label: COPY.disclosure6ProofHash,
      value: data.proof_hash,
      tone: "mono",
      truncate: true,
    });
  }
  if (data.proof_uploaded_at) {
    keyValues.push({
      label: COPY.disclosure6ProofUploadedAt,
      value: formatDateTime(data.proof_uploaded_at),
    });
  }

  const isProofUploaded = data.status === "DISCLOSURE_PROOF_UPLOADED";

  return {
    shell: {
      key: "disclosure-record",
      index: 6,
      title: COPY.sectionDisclosureRecord,
      statusBadge: {
        label: isProofUploaded
          ? COPY.badgeComplete
          : isNotApplicable
            ? COPY.badgeNotApplicable
            : data.status,
        tone: isProofUploaded
          ? "complete"
          : isNotApplicable
            ? "muted"
            : "complete",
      },
    },
    body: {
      kind: "disclosure_record",
      keyValues,
      disclosureText: undefined,
      disclosureLocked: false,
      proofKeyValues: [],
      notApplicableRationale: isNotApplicable
        ? data.trigger ?? COPY.disclosure6NotApplicable
        : undefined,
    },
  };
}

function buildConsentSection(
  data: EpConsentRecord,
): EvidencePackSectionData {
  const isNotApplicable = data.status === "NOT_APPLICABLE";
  return {
    shell: {
      key: "consent-record",
      index: 7,
      title: COPY.sectionConsentRecord,
      statusBadge: {
        label: isNotApplicable ? COPY.badgeNotApplicable : data.status,
        tone: isNotApplicable ? "muted" : "complete",
      },
    },
    body: {
      kind: "consent_record",
      statusLabel: isNotApplicable ? COPY.badgeNotApplicable : data.status,
      statusTone: isNotApplicable ? "muted" : "complete",
      rationale: data.rationale ?? (isNotApplicable ? COPY.consent7DefaultRationale : undefined),
    },
  };
}

function buildAttestationSection(
  data: EpAttestationPage,
): EvidencePackSectionData {
  const keyValues: EvidencePackKeyValue[] = [];
  keyValues.push({
    label: COPY.attestation8AttestedBy,
    value: `${data.attested_by}${data.attested_by_role ? `, ${data.attested_by_role}` : ""}`,
  });
  keyValues.push({
    label: COPY.attestation8AttestationId,
    value: data.attestation_id,
    tone: "mono",
    truncate: true,
  });
  keyValues.push({
    label: COPY.attestation8AttestedAt,
    value: formatDateTime(data.attested_at, true),
  });
  keyValues.push({
    label: COPY.attestation8ApprovalId,
    value: data.approval_id,
    tone: "mono",
    truncate: true,
  });

  const isForcePass = Boolean(data.is_force_pass);
  const isLegalApproved = data.status === "LEGAL_APPROVED";
  return {
    shell: {
      key: "attestation-page",
      index: 8,
      title: COPY.sectionAttestationPage,
      statusBadge: {
        label: isLegalApproved
          ? COPY.badgeLegalApproved
          : data.status === "COMPLETE"
            ? COPY.badgeComplete
            : data.status,
        tone: isForcePass
          ? "force-pass"
          : isLegalApproved
            ? "approved"
            : data.status === "COMPLETE"
              ? "complete"
              : "muted",
      },
      secondaryBadge: { label: COPY.badgeWormStored, tone: "complete" },
    },
    body: {
      kind: "attestation_page",
      header: COPY.attestation8Header,
      keyValues,
      typedSignature: data.typed_signature,
      declarationText: data.declaration_text ?? COPY.attestation8DefaultDeclaration,
      overrideCommentary: data.override_commentary,
      overrideCommentaryHeader: data.override_commentary
        ? COPY.attestation8OverrideHeader
        : undefined,
      isForcePass,
      forcePassBadgeLabel: isForcePass ? COPY.attestation8ForcePassBadge : undefined,
    },
  };
}

function shortPackId(packId: string): string {
  if (!packId.startsWith("ep_")) return packId;
  const tail = packId.slice(3);
  if (tail.length <= 12) return packId;
  return `ep_${tail.slice(0, 4)}…${tail.slice(-4)}`;
}

function shortHash(hash: string): string {
  const value = hash.startsWith("sha256:") ? hash.slice(7) : hash;
  if (value.length <= 14) return hash;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function formatDateTime(iso: string, withSeconds = false): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const date = `${pad2(d.getUTCDate())} ${MONTH_SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    const seconds = withSeconds ? `:${pad2(d.getUTCSeconds())}` : "";
    const time = `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}${seconds}`;
    return `${date}, ${time} UTC`;
  } catch {
    return iso;
  }
}

function formatDateShort(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return `${pad2(d.getUTCDate())} ${MONTH_SHORT[d.getUTCMonth()]} ${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
  } catch {
    return iso;
  }
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIdx = 0;
  while (value >= 1024 && unitIdx < units.length - 1) {
    value /= 1024;
    unitIdx += 1;
  }
  const precision = unitIdx >= 2 ? 1 : 0;
  return `${value.toFixed(precision)} ${units[unitIdx]}`;
}

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}
