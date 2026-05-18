import type { SuitabilityResults } from "@/api/schemas/suitability";
import { MOCK_ASSET_ID, MOCK_RUN_ID } from "../../constants";

export type SuitabilityScenarioId =
  | "mixed-blocked-flagged"
  | "clear"
  | "flagged-only"
  | "all-blocked"
  | "flagged-reviewed"
  | "withdrawn";

export const DEFAULT_SUITABILITY_SCENARIO: SuitabilityScenarioId =
  "mixed-blocked-flagged";

const POLICY_PACK_ID = "BRAND_SUITABILITY_CORE_v1.0";
const POLICY_PACK_VERSION = "v1.0.0";
const ASSET_FILENAME = "brand_event_video.mp4";
const ASSET_DURATION_MS = 48_000;
const EVALUATED_AT = "2026-04-18T11:08:00Z";

const PEAK_FRAME = (ms: number) => `https://placehold.co/240x135?text=${ms}ms`;

const alcoholContributions = [
  { timecode_ms: 8000, timecode_label: "0:08", score: 0.62, verdict: "BLOCKED" as const },
  { timecode_ms: 23000, timecode_label: "0:23", score: 0.71, verdict: "BLOCKED" as const },
  { timecode_ms: 41000, timecode_label: "0:41", score: 0.74, verdict: "BLOCKED" as const, is_peak: true },
];

const violenceContributions = [
  {
    timecode_ms: 34200,
    timecode_label: "0:34",
    score: 0.61,
    verdict: "FLAGGED" as const,
    sub_field: "violence.score",
    is_peak: true,
    thumbnail_url: PEAK_FRAME(34200),
  },
  {
    timecode_ms: 31800,
    timecode_label: "0:31",
    score: 0.54,
    verdict: "FLAGGED" as const,
    sub_field: "violence.score",
    thumbnail_url: PEAK_FRAME(31800),
  },
  {
    timecode_ms: 36100,
    timecode_label: "0:36",
    score: 0.47,
    verdict: "ALLOWED" as const,
    sub_field: "violence.score",
    thumbnail_url: PEAK_FRAME(36100),
  },
  {
    timecode_ms: 18400,
    timecode_label: "0:18",
    score: 0.18,
    verdict: "ALLOWED" as const,
    sub_field: "violence.firearm_threat",
    thumbnail_url: PEAK_FRAME(18400),
  },
];

const nudityContributions = [
  { timecode_ms: 19000, timecode_label: "0:19", score: 0.52, verdict: "FLAGGED" as const, is_peak: true },
];

const ALLOWED_LABELS = [
  "Sexual nudity",
  "Erotic nudity",
  "Minors",
  "Weapons",
  "Gore",
  "Drugs",
  "Tobacco",
  "Gambling",
  "Hate symbols",
  "Self harm",
  "Profanity",
  "Extremism",
];

function allowedRow(label: string) {
  const key = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_|_$)/g, "");
  return {
    category_key: key,
    category_label: label,
    verdict: "ALLOWED" as const,
    score: 0.08,
    flag_threshold: 0.5,
    block_threshold: 0.85,
    applied_threshold: { source: "SYSTEM_DEFAULT" as const },
    rule_id: `BSC_${key}`,
    policy_pack_id: POLICY_PACK_ID,
    policy_pack_version: POLICY_PACK_VERSION,
    flagged_frames: [],
    frame_contributions: [],
    sub_fields: [],
  };
}

const baseResults: SuitabilityResults = {
  preflight_run_id: MOCK_RUN_ID,
  asset_id: MOCK_ASSET_ID,
  asset_filename: ASSET_FILENAME,
  modality: "VIDEO",
  asset_duration_ms: ASSET_DURATION_MS,

  geo_context: ["EU", "DE"],
  active_geo_preset: "DE_STRICT",
  workspace_label: "Acme EU",

  policy_pack_id: POLICY_PACK_ID,
  policy_pack_version: POLICY_PACK_VERSION,
  evaluated_at: EVALUATED_AT,

  status: "BRAND_SUITABILITY_BLOCKED",
  routed_to_legal: true,

  counts: { blocked: 1, flagged: 2, allowed: 12 },

  category_results: [
    {
      category_key: "alcohol",
      category_label: "Alcohol",
      verdict: "BLOCKED",
      score: 0.74,
      flag_threshold: 0.4,
      block_threshold: 0.6,
      applied_threshold: { source: "GEO_PRESET", preset_id: "DE_STRICT" },
      rule_id: "BSC_008",
      policy_pack_id: POLICY_PACK_ID,
      policy_pack_version: POLICY_PACK_VERSION,
      score_source_path: "detection_scores.moderation.alcohol.score",
      peak_frame_ms: 41000,
      peak_frame_thumbnail_url: PEAK_FRAME(41000),
      flagged_frames: [
        { timecode_ms: 8000, timecode_label: "0:08", thumbnail_url: PEAK_FRAME(8000) },
        { timecode_ms: 23000, timecode_label: "0:23", thumbnail_url: PEAK_FRAME(23000) },
        { timecode_ms: 41000, timecode_label: "0:41", thumbnail_url: PEAK_FRAME(41000) },
      ],
      frame_contributions: alcoholContributions.map((c) => ({
        ...c,
        sub_field: "alcohol.score",
        thumbnail_url: PEAK_FRAME(c.timecode_ms),
      })),
      sub_fields: [],
      routing_message: "Routed to Legal · Reviewer view only",
      evidence_pack_section_ref:
        "Evidence Pack Section 5 (Brand Suitability): per-category verdict table with all scores, thresholds, and threshold source",
    },
    {
      category_key: "violence",
      category_label: "Violence",
      verdict: "FLAGGED",
      score: 0.61,
      flag_threshold: 0.5,
      block_threshold: 0.8,
      applied_threshold: { source: "SYSTEM_DEFAULT" },
      rule_id: "BSC_012",
      policy_pack_id: POLICY_PACK_ID,
      policy_pack_version: POLICY_PACK_VERSION,
      score_source_path: "detection_scores.moderation.violence.score",
      peak_frame_ms: 34200,
      peak_frame_thumbnail_url: PEAK_FRAME(34200),
      flagged_frames: [
        { timecode_ms: 34200, timecode_label: "0:34", thumbnail_url: PEAK_FRAME(34200) },
      ],
      frame_contributions: violenceContributions,
      sub_fields: [
        {
          key: "violence.firearm_threat",
          label: "violence.firearm_threat",
          score: 0.18,
          flag_threshold: 0.3,
          block_threshold: 0.6,
          verdict: "ALLOWED",
        },
      ],
      evidence_pack_section_ref:
        "Evidence Pack Section 5 (Brand Suitability): per-category verdict table with all scores, thresholds, and threshold source",
    },
    {
      category_key: "nudity_suggestive",
      category_label: "Suggestive nudity",
      verdict: "FLAGGED",
      score: 0.52,
      flag_threshold: 0.3,
      applied_threshold: {
        source: "GEO_PRESET",
        preset_id: "DE_STRICT",
        advisory_only: true,
      },
      rule_id: "BSC_003",
      policy_pack_id: POLICY_PACK_ID,
      policy_pack_version: POLICY_PACK_VERSION,
      score_source_path: "detection_scores.moderation.nudity_suggestive.score",
      peak_frame_ms: 19000,
      peak_frame_thumbnail_url: PEAK_FRAME(19000),
      flagged_frames: [
        { timecode_ms: 19000, timecode_label: "0:19", thumbnail_url: PEAK_FRAME(19000) },
      ],
      frame_contributions: nudityContributions.map((c) => ({
        ...c,
        sub_field: "nudity_suggestive.score",
        thumbnail_url: PEAK_FRAME(c.timecode_ms),
      })),
      sub_fields: [],
      evidence_pack_section_ref:
        "Evidence Pack Section 5 (Brand Suitability): per-category verdict table with all scores, thresholds, and threshold source",
    },
    ...ALLOWED_LABELS.map((l) => allowedRow(l)),
  ],
  allowed_summary: {
    categories: ALLOWED_LABELS,
    note: "all below flag threshold",
  },
  created_at: EVALUATED_AT,
  updated_at: EVALUATED_AT,
};

function clone(s: SuitabilityResults): SuitabilityResults {
  return JSON.parse(JSON.stringify(s)) as SuitabilityResults;
}

const clearResults: SuitabilityResults = (() => {
  const next = clone(baseResults);
  next.status = "BRAND_SUITABILITY_CLEAR";
  next.routed_to_legal = false;
  next.counts = { blocked: 0, flagged: 0, allowed: 15 };
  next.category_results = next.category_results.map((c) => ({
    ...c,
    verdict: "ALLOWED",
    score: 0.05,
    flagged_frames: [],
    frame_contributions: [],
    routing_message: undefined,
    sub_fields: [],
  }));
  next.allowed_summary = {
    categories: next.category_results.map((c) => c.category_label),
    note: "all below flag threshold",
  };
  return next;
})();

const flaggedOnlyResults: SuitabilityResults = (() => {
  const next = clone(baseResults);
  next.status = "BRAND_SUITABILITY_PENDING";
  next.routed_to_legal = false;
  next.counts = { blocked: 0, flagged: 2, allowed: 13 };
  next.category_results = next.category_results.map((c) => {
    if (c.category_key === "alcohol") {
      return {
        ...c,
        verdict: "ALLOWED",
        score: 0.12,
        flagged_frames: [],
        frame_contributions: [],
        routing_message: undefined,
        sub_fields: [],
      };
    }
    return c;
  });
  next.allowed_summary = {
    categories: next.category_results
      .filter((c) => c.verdict === "ALLOWED")
      .map((c) => c.category_label),
    note: "all below flag threshold",
  };
  return next;
})();

const allBlockedResults: SuitabilityResults = (() => {
  const next = clone(baseResults);
  next.status = "BRAND_SUITABILITY_BLOCKED";
  next.routed_to_legal = true;
  next.counts = { blocked: 3, flagged: 0, allowed: 12 };
  next.category_results = next.category_results.map((c) => {
    if (["alcohol", "violence", "nudity_suggestive"].includes(c.category_key)) {
      return {
        ...c,
        verdict: "BLOCKED",
        score: Math.max(c.score, 0.9),
        routing_message: "Routed to Legal · Reviewer view only",
      };
    }
    return c;
  });
  return next;
})();

const flaggedReviewedResults: SuitabilityResults = (() => {
  const next = clone(flaggedOnlyResults);
  next.status = "BRAND_SUITABILITY_FLAGGED_REVIEWED";
  next.acceptance = {
    accepted_at: "2026-04-18T11:24:00Z",
    accepted_by: "Reviewer (mock)",
    accepted_by_role: "Reviewer",
    declaration_confirmed: true,
    notes:
      "Reviewed against DE_STRICT preset. Flagged frames acceptable for branded campaign context.",
    audit_trail_id: "aud_demo_suit_accept_0001",
  };
  return next;
})();

const withdrawnResults: SuitabilityResults = (() => {
  const next = clone(baseResults);
  next.status = "BRAND_SUITABILITY_ASSET_WITHDRAWN";
  next.withdrawal = {
    withdrawn_at: "2026-04-18T11:31:00Z",
    withdrawn_by: "Reviewer (mock)",
    withdrawn_by_role: "Reviewer",
    reason: "Returning to creative for re-cut on alcohol scenes.",
    audit_trail_id: "aud_demo_suit_withdraw_0001",
  };
  return next;
})();

export const suitabilityScenarios: Record<
  SuitabilityScenarioId,
  SuitabilityResults
> = {
  "mixed-blocked-flagged": baseResults,
  clear: clearResults,
  "flagged-only": flaggedOnlyResults,
  "all-blocked": allBlockedResults,
  "flagged-reviewed": flaggedReviewedResults,
  withdrawn: withdrawnResults,
};

export function isSuitabilityScenarioId(
  value: unknown,
): value is SuitabilityScenarioId {
  return (
    value === "mixed-blocked-flagged" ||
    value === "clear" ||
    value === "flagged-only" ||
    value === "all-blocked" ||
    value === "flagged-reviewed" ||
    value === "withdrawn"
  );
}
