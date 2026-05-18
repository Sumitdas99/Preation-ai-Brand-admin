import { z } from "zod";

export const EvaluationStatus = z.union([
  z.literal("COMPLETE"),
  z.literal("EVALUATION_FAILED"),
  z.literal("NOT_APPLICABLE"),
]);
export type EvaluationStatus = z.infer<typeof EvaluationStatus>;

export const ConfidenceBand = z.union([
  z.literal("BELOW_THRESHOLD"),
  z.literal("FLAG_BAND"),
  z.literal("BLOCK_BAND"),
]);
export type ConfidenceBand = z.infer<typeof ConfidenceBand>;

export const ModerationVerdict = z.union([
  z.literal("ALLOW"),
  z.literal("FLAG"),
  z.literal("BLOCK"),
  z.string(),
]);

export const SyntheticScores = z
  .object({
    ai_generated_score: z.number().min(0).max(1),
    deepfake_score: z.number().min(0).max(1),
    confidence_band: ConfidenceBand,
    source_detectors: z.array(z.string()).default([]),
    evaluation_status: EvaluationStatus,
  })
  .passthrough();
export type SyntheticScores = z.infer<typeof SyntheticScores>;

const simpleModerationCategorySchema = z
  .object({
    score: z.number().min(0).max(1).optional(),
    verdict: ModerationVerdict.optional(),
  })
  .passthrough();

export const ModerationScores = z
  .object({
    nudity: z
      .object({
        score: z.number().min(0).max(1).optional(),
        sub_scores: z.record(z.string(), z.number()).optional(),
        verdict: ModerationVerdict.optional(),
      })
      .passthrough(),
    alcohol: z
      .object({
        score: z.number().min(0).max(1).optional(),
        presence_level: z
          .union([
            z.literal("PROMINENT"),
            z.literal("FEATURED"),
            z.literal("BACKGROUND_ONLY"),
            z.literal("NONE"),
          ])
          .optional(),
        verdict: ModerationVerdict.optional(),
      })
      .passthrough(),
    minors: z
      .object({
        detected: z.boolean().optional(),
        confidence: z.number().min(0).max(1).optional(),
        verdict: ModerationVerdict.optional(),
      })
      .passthrough(),
    violence: simpleModerationCategorySchema,
    hate_symbols: simpleModerationCategorySchema,
    weapons: simpleModerationCategorySchema,
    drugs: simpleModerationCategorySchema,
    gambling: simpleModerationCategorySchema,
    tobacco: simpleModerationCategorySchema,
    evaluation_status: EvaluationStatus,
  })
  .passthrough();
export type ModerationScores = z.infer<typeof ModerationScores>;

export const ProvenanceScores = z
  .object({
    manifest_status: z.union([
      z.literal("PRESENT"),
      z.literal("ABSENT"),
      z.literal("INVALID"),
      z.literal("STRIPPED"),
    ]),
    signature_valid: z.boolean().optional(),
    strip_detected: z.boolean().default(false),
    evaluation_status: EvaluationStatus.optional(),
  })
  .passthrough();
export type ProvenanceScores = z.infer<typeof ProvenanceScores>;

export const ConsentScores = z
  .object({
    rpl_detected: z.boolean(),
    rpl_identities: z.array(z.string()).default([]),
    human_presence_detected: z.boolean(),
    estimated_person_count: z.number().int().nonnegative().default(0),
    evaluation_status: EvaluationStatus,
  })
  .passthrough();
export type ConsentScores = z.infer<typeof ConsentScores>;

export const DetectionScores = z
  .object({
    synthetic: SyntheticScores.optional(),
    moderation: ModerationScores.optional(),
    provenance: ProvenanceScores.optional(),
    consent: ConsentScores.optional(),
  })
  .passthrough();
export type DetectionScores = z.infer<typeof DetectionScores>;

export type ModerationCategoryKey = Exclude<
  keyof ModerationScores,
  "evaluation_status"
>;

export const MODERATION_CATEGORY_KEYS: ModerationCategoryKey[] = [
  "nudity",
  "alcohol",
  "minors",
  "violence",
  "hate_symbols",
  "weapons",
  "drugs",
  "gambling",
  "tobacco",
];
