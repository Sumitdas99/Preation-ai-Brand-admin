import type {
  CategorySubField,
  SuitabilityCategoryResult,
  SuitabilityResults,
} from "@/api/schemas/suitability";
import type {
  AxisTickView,
  CategoryDetailTone,
  CategoryDotView,
  CategoryHeaderView,
  CategoryStatBoxView,
  FrameContributionRowView,
  NextCategoryView,
  PerTimecodeView,
  PolicyReferenceAppliedToRow,
  PolicyReferenceView,
  ScoreDetailView,
  ScoreExplanationView,
  ScoreLegendItem,
  SubFieldRowView,
  SuitabilityCategoryDetailPageData,
  SuitabilityTopBar,
} from "@/components/suitability/types";
import { SUITABILITY_DETAIL_COPY } from "./copy";
import { resolveSubFieldLabel } from "./subFieldLabels";
import { toThresholds } from "./toResultsData";

const DETAIL_VERDICTS = new Set(["FLAGGED", "BLOCKED"]);

export function findCategory(
  results: SuitabilityResults,
  categoryKey: string,
): SuitabilityCategoryResult | undefined {
  return results.category_results.find((c) => c.category_key === categoryKey);
}

export function toCategoryDetailData(
  results: SuitabilityResults,
  category: SuitabilityCategoryResult,
): SuitabilityCategoryDetailPageData {
  const tone: CategoryDetailTone =
    category.verdict === "BLOCKED" ? "blocked" : "flagged";

  const topBar: SuitabilityTopBar = {
    assetFilename: results.asset_filename ?? results.asset_id,
    workspaceLabel: results.workspace_label,
    geoLabel: results.active_geo_preset ?? results.geo_context.join(" · "),
    policyPackLabel: formatPolicyPackLabel(results),
  };

  const subFields: SubFieldRowView[] = category.sub_fields.map(toSubFieldRow);
  const thresholds = toThresholds(category);

  return {
    raw: category,
    parent: {
      runId: results.preflight_run_id,
      assetFilename: results.asset_filename ?? results.asset_id,
      resultsHref: `/suitability/${results.preflight_run_id}/results`,
    },
    topBar,
    breadcrumbTail: category.category_label,
    header: buildHeader(results, category, tone),
    scoreDetail: buildScoreDetail(category, subFields),
    perTimecode: buildPerTimecode(results, category),
    policyReference: buildPolicyReference(category, subFields),
    nextCategory: buildNextCategory(results, category),
    categoryDots: buildCategoryDots(results, category),
    subFields,
  };
}


function buildHeader(
  results: SuitabilityResults,
  category: SuitabilityCategoryResult,
  tone: CategoryDetailTone,
): CategoryHeaderView {
  const peers = results.category_results.filter(
    (c) => c.verdict === category.verdict,
  );
  const positionIndex =
    peers.findIndex((c) => c.category_key === category.category_key) + 1;
  const positionLabel =
    DETAIL_VERDICTS.has(category.verdict) && peers.length > 0
      ? SUITABILITY_DETAIL_COPY.positionTemplate(
          positionIndex,
          peers.length,
          tone,
        )
      : "";

  return {
    tone,
    verdict: category.verdict,
    verdictLabel: category.verdict,
    categoryLabel: category.category_label,
    positionLabel,
    subContext: buildSubContext(results),
    statBoxes: buildStatBoxes(category),
  };
}

function buildSubContext(results: SuitabilityResults): string {
  const parts: string[] = [SUITABILITY_DETAIL_COPY.subContextPrefix];
  if (results.asset_filename) parts.push(results.asset_filename);
  const modality = formatModality(results.modality);
  const duration = formatDuration(results.asset_duration_ms);
  if (modality && duration) parts.push(`${modality} · ${duration}`);
  else if (modality) parts.push(modality);
  if (results.geo_context.length > 0) {
    parts.push(`Geo: ${results.geo_context.join(", ")}`);
  }
  if (results.active_geo_preset) {
    parts.push(`Preset: ${results.active_geo_preset}`);
  }
  return parts.join(" · ");
}

function buildStatBoxes(
  category: SuitabilityCategoryResult,
): CategoryStatBoxView[] {
  const advisory = category.applied_threshold.advisory_only === true;
  return [
    {
      label: SUITABILITY_DETAIL_COPY.statScoreLabel,
      value: category.score.toFixed(2),
    },
    {
      label: SUITABILITY_DETAIL_COPY.statFlagThresholdLabel,
      value: category.flag_threshold.toFixed(2),
    },
    {
      label: SUITABILITY_DETAIL_COPY.statBlockThresholdLabel,
      value: advisory
        ? SUITABILITY_DETAIL_COPY.statBlockThresholdAdvisoryValue
        : category.block_threshold !== undefined
          ? category.block_threshold.toFixed(2)
          : SUITABILITY_DETAIL_COPY.statBlockThresholdAdvisoryValue,
      tone: advisory ? "muted" : "default",
    },
    {
      label: SUITABILITY_DETAIL_COPY.statThresholdSourceLabel,
      value: formatThresholdSourceShort(category),
    },
  ];
}


function buildScoreDetail(
  category: SuitabilityCategoryResult,
  subFields: SubFieldRowView[],
): ScoreDetailView {
  const advisory = category.applied_threshold.advisory_only === true;
  const blockThreshold = advisory ? undefined : category.block_threshold;

  const legend: ScoreLegendItem[] = [
    {
      swatch: "allowed",
      label: SUITABILITY_DETAIL_COPY.legendAllowedLabel,
      value: SUITABILITY_DETAIL_COPY.legendAllowedValue(category.flag_threshold),
    },
    {
      swatch: "flag",
      label: SUITABILITY_DETAIL_COPY.legendFlagLabel,
      value: SUITABILITY_DETAIL_COPY.legendFlagValue(category.flag_threshold),
    },
  ];
  if (blockThreshold !== undefined) {
    legend.push({
      swatch: "block",
      label: SUITABILITY_DETAIL_COPY.legendBlockLabel,
      value: SUITABILITY_DETAIL_COPY.legendBlockValue(blockThreshold),
    });
  }

  const explanation: ScoreExplanationView = {
    primarySentence: explainPrimary(category, blockThreshold),
    subFieldNote:
      subFields.length > 0
        ? subFields
            .map((sub) =>
              SUITABILITY_DETAIL_COPY.subFieldNoteTemplate(
                category.category_label,
                {
                  label: sub.label,
                  flag: sub.flagThreshold,
                  block: sub.blockThreshold,
                  score: sub.score,
                  verdict: sub.verdict,
                },
              ),
            )
            .join(" ")
        : undefined,
  };

  return {
    scoreLabel: category.score.toFixed(2),
    scoreNumeric: category.score,
    flagThreshold: category.flag_threshold,
    blockThreshold,
    legend,
    explanation,
  };
}

function explainPrimary(
  category: SuitabilityCategoryResult,
  blockThreshold: number | undefined,
): string {
  if (category.verdict === "FLAGGED" && blockThreshold !== undefined) {
    return SUITABILITY_DETAIL_COPY.scoreExplanationFlagged(
      category.score,
      category.flag_threshold,
      blockThreshold,
    );
  }
  if (category.verdict === "BLOCKED" && blockThreshold !== undefined) {
    return SUITABILITY_DETAIL_COPY.scoreExplanationBlocked(
      category.score,
      blockThreshold,
    );
  }
  return SUITABILITY_DETAIL_COPY.scoreExplanationAllowed(
    category.score,
    category.flag_threshold,
  );
}


function buildPerTimecode(
  results: SuitabilityResults,
  category: SuitabilityCategoryResult,
): PerTimecodeView {
  const contributions: FrameContributionRowView[] =
    category.frame_contributions.map((f) => ({
      frameIndex: f.frame_index,
      timecodeLabel: f.timecode_label,
      timecodeMs: f.timecode_ms,
      score: f.score,
      verdict: f.verdict,
      subFieldLabel: resolveSubFieldLabel(f.sub_field, f.sub_field_label),
      isPeak: f.is_peak,
      thumbnailUrl: f.thumbnail_url,
    } as FrameContributionRowView));

  return {
    heading: SUITABILITY_DETAIL_COPY.perTimecodeHeader,
    scrubberLabel: SUITABILITY_DETAIL_COPY.scrubberLabel,
    durationMs: results.asset_duration_ms,
    peakMs: category.peak_frame_ms,
    axisTicks: buildAxisTicks(results.asset_duration_ms),
    contributions,
    footerNote: SUITABILITY_DETAIL_COPY.perTimecodeFooterNoteTemplate(
      category.score,
    ),
  };
}

function buildAxisTicks(durationMs: number | undefined): AxisTickView[] {
  if (!durationMs || durationMs <= 0) return [];
  const ticks: AxisTickView[] = [];
  const step = chooseTickStep(durationMs);
  for (let ms = 0; ms <= durationMs; ms += step) {
    ticks.push({ ms, label: formatTimecode(ms) });
  }
  if (ticks[ticks.length - 1]?.ms !== durationMs) {
    ticks.push({ ms: durationMs, label: formatTimecode(durationMs) });
  }
  return ticks;
}

function chooseTickStep(durationMs: number): number {
  if (durationMs <= 60_000) return 12_000;
  if (durationMs <= 300_000) return 60_000;
  return 300_000;
}


function buildPolicyReference(
  category: SuitabilityCategoryResult,
  subFields: SubFieldRowView[],
): PolicyReferenceView {
  const appliedTo: PolicyReferenceAppliedToRow[] = [
    {
      field: SUITABILITY_DETAIL_COPY.policyAppliedAssetScoreField,
      thresholds: SUITABILITY_DETAIL_COPY.policyAppliedRowTemplate(
        "",
        category.flag_threshold,
        category.applied_threshold.advisory_only
          ? undefined
          : category.block_threshold,
      ).replace(/^ \(/, "(").trim(),
    },
    ...subFields.map((sub) => ({
      field: sub.label,
      thresholds: SUITABILITY_DETAIL_COPY.policyAppliedRowTemplate(
        "",
        sub.flagThreshold,
        sub.blockThreshold,
      )
        .replace(/^ \(/, "(")
        .trim(),
    })),
  ];

  return {
    ruleId: category.rule_id,
    policyPackLabel: formatPolicyPackLabelFromCategory(category),
    thresholdSourceText:
      SUITABILITY_DETAIL_COPY.policyThresholdSourceTextTemplate(
        category.applied_threshold.source,
        category.applied_threshold.preset_id,
        category.applied_threshold.advisory_only === true,
      ),
    appliedTo,
    evidencePackRef:
      category.evidence_pack_section_ref ??
      "Evidence Pack reference unavailable for this category.",
  };
}


function buildNextCategory(
  results: SuitabilityResults,
  category: SuitabilityCategoryResult,
): NextCategoryView | undefined {
  const detailCategories = results.category_results.filter((c) =>
    DETAIL_VERDICTS.has(c.verdict),
  );
  if (detailCategories.length <= 1) return undefined;
  const idx = detailCategories.findIndex(
    (c) => c.category_key === category.category_key,
  );
  if (idx === -1) return undefined;
  const next = detailCategories[(idx + 1) % detailCategories.length];
  if (next.category_key === category.category_key) return undefined;
  return {
    categoryKey: next.category_key,
    categoryLabel: next.category_label,
    verdict: next.verdict,
    href: `/suitability/${results.preflight_run_id}/category/${encodeURIComponent(
      next.category_key,
    )}`,
  };
}

function buildCategoryDots(
  results: SuitabilityResults,
  current: SuitabilityCategoryResult,
): CategoryDotView[] {
  const detailCategories = results.category_results.filter((c) =>
    DETAIL_VERDICTS.has(c.verdict),
  );
  if (detailCategories.length <= 1) return [];
  return detailCategories.map((c) => ({
    categoryKey: c.category_key,
    categoryLabel: c.category_label,
    verdict: c.verdict,
    href: `/suitability/${results.preflight_run_id}/category/${encodeURIComponent(
      c.category_key,
    )}`,
    isCurrent: c.category_key === current.category_key,
  }));
}


function toSubFieldRow(s: CategorySubField): SubFieldRowView {
  return {
    key: s.key,
    label: resolveSubFieldLabel(s.key, s.label) ?? s.label,
    score: s.score,
    flagThreshold: s.flag_threshold,
    blockThreshold: s.block_threshold,
    verdict: s.verdict,
  };
}

function formatPolicyPackLabel(
  results: SuitabilityResults,
): string | undefined {
  if (!results.policy_pack_id) return undefined;
  if (results.policy_pack_version) {
    return `${results.policy_pack_id} (${results.policy_pack_version})`;
  }
  return results.policy_pack_id;
}

function formatPolicyPackLabelFromCategory(
  category: SuitabilityCategoryResult,
): string {
  if (!category.policy_pack_id) return "—";
  if (category.policy_pack_version) {
    return `${category.policy_pack_id} (${category.policy_pack_version})`;
  }
  return category.policy_pack_id;
}

function formatModality(modality: string | undefined): string | undefined {
  if (!modality) return undefined;
  if (modality === "VIDEO") return "Video";
  if (modality === "IMAGE") return "Image";
  if (modality === "AUDIO") return "Audio";
  return modality;
}

function formatDuration(ms: number | undefined): string | undefined {
  if (ms === undefined) return undefined;
  return formatTimecode(ms);
}

function formatTimecode(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatThresholdSourceShort(
  category: SuitabilityCategoryResult,
): string {
  const { source, preset_id, advisory_only } = category.applied_threshold;
  if (source === "GEO_PRESET") {
    const base = preset_id ? `Geo preset (${preset_id})` : "Geo preset";
    return advisory_only ? `${base}, advisory only` : base;
  }
  if (source === "SYSTEM_DEFAULT") return "System default";
  if (source === "WORKSPACE_OVERRIDE") return "Workspace override";
  return source;
}
