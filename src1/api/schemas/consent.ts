import { z } from "zod";

export const ConsentTriggerType = z.union([
  z.literal("TRIGGER_RPL_CONSENT_REQUIRED"),
  z.literal("TRIGGER_HUMAN_PRESENCE"),
  z.string(),
]);
export type ConsentTriggerType = z.infer<typeof ConsentTriggerType>;

export const RplConsentStatus = z.union([
  z.literal("RPL_CONSENT_REQUIRED"),
  z.literal("RPL_CONSENT_PENDING"),
  z.literal("RPL_CONSENT_ATTACHED"),
  z.literal("RPL_NO_CONSENT_BLOCK"),
  z.literal("NOT_APPLICABLE"),
  z.string(),
]);
export type RplConsentStatus = z.infer<typeof RplConsentStatus>;

export const HumanPresenceStatus = z.union([
  z.literal("HUMAN_PRESENCE_REQUIRED"),
  z.literal("HUMAN_PRESENCE_DECLARED"),
  z.literal("NOT_APPLICABLE"),
  z.string(),
]);
export type HumanPresenceStatus = z.infer<typeof HumanPresenceStatus>;

export const ConsentPath = z.union([
  z.literal("A"),
  z.literal("B"),
  z.literal("C"),
]);
export type ConsentPath = z.infer<typeof ConsentPath>;

export const RplConsentTypeOption = z.union([
  z.literal("TALENT_AGREEMENT"),
  z.literal("LICENSING_CONTRACT"),
  z.literal("MODEL_RELEASE"),
  z.literal("WRITTEN_AUTH_FROM_MGMT"),
  z.literal("OTHER"),
]);
export type RplConsentTypeOption = z.infer<typeof RplConsentTypeOption>;

export const HumanPresenceConsentTypeOption = z.union([
  z.literal("WRITTEN_RELEASE"),
  z.literal("VERBAL_DOCUMENTED"),
  z.literal("EMPLOYEE_CONTRACT"),
  z.literal("UGC_PUBLIC_PERMISSION"),
  z.literal("LICENSED_STOCK"),
  z.literal("OTHER"),
]);
export type HumanPresenceConsentTypeOption = z.infer<
  typeof HumanPresenceConsentTypeOption
>;

export const RplIdentity = z
  .object({
    identity_id: z.string(),
    name: z.string(),
    match_probability: z.number().min(0).max(1),
    source: z.string().optional(),
    detected_at: z.string().optional(),
    peak_frame_ms: z.number().int().nonnegative().optional(),
    peak_frame_timecode: z.string().optional(),
  })
  .passthrough();
export type RplIdentity = z.infer<typeof RplIdentity>;

export const RplSubmissionPathA = z
  .object({
    consent_path: z.literal("A"),
    document_filename: z.string(),
    document_size_bytes: z.number().int().nonnegative(),
    document_hash: z.string(),
    consent_type: RplConsentTypeOption,
    document_description: z.string(),
    declaration_confirmed: z.literal(true),
  })
  .passthrough();
export type RplSubmissionPathA = z.infer<typeof RplSubmissionPathA>;

export const RplSubmissionPathB = z
  .object({
    consent_path: z.literal("B"),
    timeline_note: z.string().min(20),
    declaration_confirmed: z.literal(true),
  })
  .passthrough();
export type RplSubmissionPathB = z.infer<typeof RplSubmissionPathB>;

export const RplSubmissionPathC = z
  .object({
    consent_path: z.literal("C"),
    reason: z.string().min(30),
    declaration_confirmed: z.literal(true),
  })
  .passthrough();
export type RplSubmissionPathC = z.infer<typeof RplSubmissionPathC>;

export const RplSubmission = z.discriminatedUnion("consent_path", [
  RplSubmissionPathA,
  RplSubmissionPathB,
  RplSubmissionPathC,
]);
export type RplSubmission =
  | RplSubmissionPathA
  | RplSubmissionPathB
  | RplSubmissionPathC;

export const RplSubmissionRecord = z
  .object({
    consent_path: ConsentPath,
    consent_type: RplConsentTypeOption.optional(),
    document_filename: z.string().optional(),
    document_size_bytes: z.number().int().nonnegative().optional(),
    document_hash: z.string().optional(),
    document_description: z.string().optional(),
    timeline_note: z.string().optional(),
    reason: z.string().optional(),
    declaration_confirmed: z.boolean(),
    submitted_at: z.string(),
    submitted_by: z.string().optional(),
    audit_trail_id: z.string().optional(),
  })
  .passthrough();
export type RplSubmissionRecord = z.infer<typeof RplSubmissionRecord>;

export const HumanPresenceSubmission = z
  .object({
    person_count_confirmed: z.number().int().min(1),
    consent_type: HumanPresenceConsentTypeOption,
    notes: z.string().optional(),
    declaration_confirmed: z.literal(true),
  })
  .passthrough();
export type HumanPresenceSubmission = z.infer<typeof HumanPresenceSubmission>;

export const HumanPresenceSubmissionRecord = z
  .object({
    person_count_detected: z.number().int().min(0),
    person_count_confirmed: z.number().int().min(1),
    consent_type: HumanPresenceConsentTypeOption,
    notes: z.string().optional(),
    declaration_confirmed: z.boolean(),
    submitted_at: z.string(),
    submitted_by: z.string().optional(),
    audit_trail_id: z.string().optional(),
  })
  .passthrough();
export type HumanPresenceSubmissionRecord = z.infer<
  typeof HumanPresenceSubmissionRecord
>;

export const RplSection = z
  .object({
    status: RplConsentStatus,
    rpl_identities_snapshot: z.array(RplIdentity).default([]),
    submission: RplSubmissionRecord.optional(),
  })
  .passthrough();
export type RplSection = z.infer<typeof RplSection>;

export const HumanPresenceSection = z
  .object({
    status: HumanPresenceStatus,
    estimated_person_count: z.number().int().min(0),
    submission: HumanPresenceSubmissionRecord.optional(),
  })
  .passthrough();
export type HumanPresenceSection = z.infer<typeof HumanPresenceSection>;

export const ConsentSpec = z
  .object({
    spec_id: z.string(),
    asset_id: z.string(),
    asset_filename: z.string().optional(),
    workspace_label: z.string().optional(),
    geo_label: z.string().optional(),
    triggers: z.array(ConsentTriggerType).default([]),
    organisation_name: z.string().optional(),
    rpl_section: RplSection.optional(),
    human_presence_section: HumanPresenceSection.optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
  })
  .passthrough();
export type ConsentSpec = z.infer<typeof ConsentSpec>;

export const SubmitRplConsentResponse = ConsentSpec;
export type SubmitRplConsentResponse = z.infer<typeof SubmitRplConsentResponse>;

export const SubmitHumanPresenceResponse = ConsentSpec;
export type SubmitHumanPresenceResponse = z.infer<
  typeof SubmitHumanPresenceResponse
>;
