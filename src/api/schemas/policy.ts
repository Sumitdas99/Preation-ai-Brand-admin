import { z } from "zod";
import { Obligation } from "./obligations";

export const Verdict = z.union([
  z.literal("ALLOW"),
  z.literal("ALLOW_WITH_WARNINGS"),
  z.literal("BLOCK_UNTIL_REMEDIATED"),
  z.literal("BLOCK_NON_OVERRIDABLE"),
]);
export type Verdict = z.infer<typeof Verdict>;

export const BlockingReason = z.union([
  z.literal("SYSTEM_ERROR_POLICY_UNAVAILABLE"),
  z.literal("POLICY_PACK_EVALUATION_FAILED"),
  z.string(),
]);
export type BlockingReason = z.infer<typeof BlockingReason>;

export const PolicyDecision = z
  .object({
    policy_decision_id: z.string(),
    verdict: Verdict,
    obligations: z.array(Obligation).default([]),
    blocking_reason: BlockingReason.optional(),
    policy_pack_id: z.string().optional(),
    policy_pack_version: z.string().optional(),
    evaluated_at: z.string().optional(),
    incident_id: z.string().optional(),
  })
  .passthrough();
export type PolicyDecision = z.infer<typeof PolicyDecision>;
