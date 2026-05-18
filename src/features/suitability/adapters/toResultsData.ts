import type {
  SuitabilityCategoryResult,
  SuitabilityResults,
} from "@/api/schemas/suitability";
import type {
  AcceptanceRecordView,
  AppliedThresholdView,
  AssetContextStripView,
  BlockedNoteView,
  FrameThumbView,
  ReviewerActionsView,
  SuitabilityCategoryRowView,
  SuitabilityResultsPageData,
  ThresholdsView,
  VerdictBannerView,
  WithdrawalRecordView,
} from "@/components/suitability/types";
import {
  MODALITY_LABELS,
  SUITABILITY_RESULTS_COPY,
  THRESHOLD_SOURCE_LABELS,
} from "./copy";

export function toResultsData(
  results: SuitabilityResults,
): SuitabilityResultsPageData {
  const topBar = {
    assetFilename: results.asset_filename ?? results.asset_id,
    workspaceLabel: results.workspace_label,
    geoLabel: formatGeoLabel(results),
    policyPackLabel: formatPolicyPackLabel(results),
    evaluatedAtLabel: results.evaluated_at
      ? formatEvaluatedAt(results.evaluated_at)
      : undefined,
  };

  const contextStrip = toContextStrip(results);

  const blockedRows: SuitabilityCategoryRowView[] = [];
  const flaggedRows: SuitabilityCategoryRowView[] = [];

  for (const cat of results.category_results) {
    if (cat.verdict === "ALLOWED") continue;
    const row = toRow(cat, results.preflight_run_id);
    if (cat.verdict === "BLOCKED") blockedRows.push(row);
    else flaggedRows.push(row);
  }

  const allowedCategories =
    results.allowed_summary?.categories ??
    results.category_results
      .filter((c) => c.verdict === "ALLOWED")
      .map((c) => c.category_label);

  const allowed = {
    count: results.counts.allowed,
    categories: allowedCategories,
    note:
      results.allowed_summary?.note ?? SUITABILITY_RESULTS_COPY.allowedDefaultNote,
    badgeLabel: SUITABILITY_RESULTS_COPY.allowedBadgeLabel,
  };

  const verdict = toVerdictBanner(results);
  const actions = toReviewerActions(results, blockedRows, flaggedRows);
  const withdrawalRecord = toWithdrawalRecord(results);

  return {
    raw: results,
    status: results.status,
    topBar,
    contextStrip,
    verdict,
    blockedRows,
    flaggedRows,
    allowed,
    actions,
    withdrawalRecord,
  };
}

function toContextStrip(results: SuitabilityResults): AssetContextStripView {
  const modalityLabel = results.modality
    ? MODALITY_LABELS[results.modality as keyof typeof MODALITY_LABELS] ??
      String(results.modality)
    : undefined;
  return {
    assetLabel: results.asset_filename ?? results.asset_id,
    modalityLabel,
    durationLabel:
      results.asset_duration_ms !== undefined
        ? msToTimecode(results.asset_duration_ms)
        : undefined,
    geoLabel: results.geo_context?.length
      ? results.geo_context.join(" · ")
      : undefined,
    geoPresetLabel: results.active_geo_preset,
    policyPackLabel: formatPolicyPackLabel(results),
    evaluatedAtLabel: results.evaluated_at
      ? formatEvaluatedAt(results.evaluated_at)
      : undefined,
  };
}

function toRow(
  cat: SuitabilityCategoryResult,
  runId: string,
): SuitabilityCategoryRowView {
  const thresholds = toThresholds(cat);
  const isBlocked = cat.verdict === "BLOCKED";
  const chipText = isBlocked
    ? SUITABILITY_RESULTS_COPY.blockedRowChipPrefix
    : SUITABILITY_RESULTS_COPY.flaggedRowChipPrefix;

  const thumbnails: FrameThumbView[] = isBlocked
    ? cat.flagged_frames.slice(0, 3).map((f) => ({
        timecodeMs: f.timecode_ms,
        timecodeLabel: f.timecode_label,
        thumbnailUrl: f.thumbnail_url,
      }))
    : cat.peak_frame_ms !== undefined
      ? [
          {
            timecodeMs: cat.peak_frame_ms,
            timecodeLabel: msToTimecode(cat.peak_frame_ms),
            thumbnailUrl: cat.peak_frame_thumbnail_url,
          },
        ]
      : [];

  return {
    categoryKey: cat.category_key,
    categoryLabel: cat.category_label,
    verdict: cat.verdict,
    score: cat.score,
    thresholds,
    ruleId: cat.rule_id,
    policyPackLabel: formatPolicyPackTag(cat),
    routingMessage: cat.routing_message,
    chipText,
    thumbnails,
    thumbnailLabel: isBlocked
      ? SUITABILITY_RESULTS_COPY.flaggedFramesLabel
      : SUITABILITY_RESULTS_COPY.peakFrameLabel,
    detailHref: `/suitability/${encodeURIComponent(runId)}/category/${encodeURIComponent(cat.category_key)}`,
    hasDetail: cat.frame_contributions.length > 0 || Boolean(cat.peak_frame_ms),
  };
}

export function toThresholds(cat: SuitabilityCategoryResult): ThresholdsView {
  const advisory = cat.applied_threshold.advisory_only === true;
  const applied: AppliedThresholdView = {
    source: cat.applied_threshold.source,
    sourceLabel: THRESHOLD_SOURCE_LABELS[cat.applied_threshold.source],
    presetId: cat.applied_threshold.preset_id,
    workspaceLabel: cat.applied_threshold.workspace_label,
    advisoryOnly: advisory,
  };
  return {
    flag: cat.flag_threshold,
    block: advisory ? undefined : cat.block_threshold,
    applied,
  };
}

function toVerdictBanner(results: SuitabilityResults): VerdictBannerView {
  const counts = results.counts;
  if (results.status === "BRAND_SUITABILITY_ASSET_WITHDRAWN") {
    return {
      tone: "withdrawn",
      title: SUITABILITY_RESULTS_COPY.bannerWithdrawnTitle,
      description: SUITABILITY_RESULTS_COPY.bannerWithdrawnDescription,
      counts,
    };
  }
  if (counts.blocked > 0) {
    return {
      tone: "blocked",
      title: SUITABILITY_RESULTS_COPY.bannerBlockedTitle,
      description: SUITABILITY_RESULTS_COPY.bannerBlockedDescription,
      counts,
    };
  }
  if (results.status === "BRAND_SUITABILITY_FLAGGED_REVIEWED") {
    return {
      tone: "flagged",
      title: SUITABILITY_RESULTS_COPY.bannerReviewedTitle,
      description: SUITABILITY_RESULTS_COPY.bannerReviewedDescription,
      counts,
    };
  }
  if (counts.flagged > 0) {
    return {
      tone: "flagged",
      title: SUITABILITY_RESULTS_COPY.bannerFlaggedTitle,
      description: SUITABILITY_RESULTS_COPY.bannerFlaggedDescription,
      counts,
    };
  }
  return {
    tone: "clear",
    title: SUITABILITY_RESULTS_COPY.bannerClearTitle,
    description: SUITABILITY_RESULTS_COPY.bannerClearDescription,
    counts,
  };
}

function toReviewerActions(
  results: SuitabilityResults,
  blockedRows: SuitabilityCategoryRowView[],
  flaggedRows: SuitabilityCategoryRowView[],
): ReviewerActionsView {
  const alreadyAccepted = Boolean(results.acceptance);
  const alreadyWithdrawn =
    Boolean(results.withdrawal) ||
    results.status === "BRAND_SUITABILITY_ASSET_WITHDRAWN";
  const hasBlocked = blockedRows.length > 0;
  const hasFlagged = flaggedRows.length > 0;
  const routedToLegal = Boolean(results.routed_to_legal);

  const canAcceptFlagged = !alreadyAccepted && !alreadyWithdrawn && hasFlagged;
  const canWithdraw = !alreadyWithdrawn;

  let acceptDisabledReason: string | undefined;
  if (alreadyAccepted)
    acceptDisabledReason = "Flagged categories already accepted.";
  else if (alreadyWithdrawn) acceptDisabledReason = "Asset has been withdrawn.";
  else if (!hasFlagged)
    acceptDisabledReason = "No flagged categories require acceptance.";

  const flaggedCategoryLabels = flaggedRows.map((r) => r.categoryLabel);
  const blockedCategoryLabels = blockedRows.map((r) => r.categoryLabel);

  const acceptHeading =
    flaggedCategoryLabels.length > 0
      ? SUITABILITY_RESULTS_COPY.acceptHeadingTemplate(flaggedCategoryLabels)
      : SUITABILITY_RESULTS_COPY.acceptHeadingEmpty;

  const blockedNote: BlockedNoteView | undefined =
    hasBlocked && hasFlagged && !alreadyWithdrawn
      ? {
          title:
            SUITABILITY_RESULTS_COPY.blockedNoteTitleTemplate(blockedCategoryLabels),
          body: SUITABILITY_RESULTS_COPY.blockedNoteBodyTemplate(
            blockedCategoryLabels,
          ),
        }
      : undefined;

  const acceptanceRecord: AcceptanceRecordView | undefined = results.acceptance
    ? {
        acceptedAtLabel: formatEvaluatedAt(results.acceptance.accepted_at),
        acceptedBy: results.acceptance.accepted_by,
        notes: results.acceptance.notes,
      }
    : undefined;

  const allClear =
    !hasBlocked && !hasFlagged && !alreadyAccepted && !alreadyWithdrawn;

  return {
    visible: !alreadyWithdrawn,
    canAcceptFlagged,
    canWithdraw,
    acceptDisabledReason,
    routedToLegal,
    alreadyAccepted,
    alreadyWithdrawn,
    allClear,
    acceptHeading,
    flaggedCategoryLabels,
    acceptanceSystemCaption: SUITABILITY_RESULTS_COPY.acceptanceCaption,
    withdrawalSystemCaption: SUITABILITY_RESULTS_COPY.withdrawalCaption,
    blockedNote,
    acceptanceRecord,
  };
}

function toWithdrawalRecord(
  results: SuitabilityResults,
): WithdrawalRecordView | undefined {
  if (!results.withdrawal) return undefined;
  return {
    withdrawnAtLabel: formatEvaluatedAt(results.withdrawal.withdrawn_at),
    withdrawnBy: results.withdrawal.withdrawn_by,
    reason: results.withdrawal.reason,
  };
}

function formatGeoLabel(results: SuitabilityResults): string | undefined {
  if (results.active_geo_preset) return results.active_geo_preset;
  if (results.geo_context?.length) return results.geo_context.join(" · ");
  return undefined;
}

function formatPolicyPackLabel(
  results: SuitabilityResults,
): string | undefined {
  if (!results.policy_pack_id) return undefined;
  return results.policy_pack_id;
}

function formatPolicyPackTag(
  cat: SuitabilityCategoryResult,
): string | undefined {
  if (!cat.policy_pack_id) return undefined;
  if (cat.policy_pack_version) {
    return `${cat.policy_pack_id} · ${cat.policy_pack_version}`;
  }
  return cat.policy_pack_id;
}

function formatEvaluatedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = d.getUTCDate();
  const month = d.toLocaleString("en-GB", {
    month: "short",
    timeZone: "UTC",
  });
  const year = d.getUTCFullYear();
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${day} ${month} ${year} at ${hh}:${mm} UTC`;
}

function msToTimecode(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
