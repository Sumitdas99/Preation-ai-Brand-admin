import { setMockScenario, type MockScenario } from "@/api/mockScenario";
import type {
  ApprovalDetail,
  ApprovalQueueItem,
  ApprovalState,
} from "@/api/schemas/approvals";
import type { EvidencePackPreview } from "@/api/schemas/evidencePackPreview";
import type {
  ConsentSpec,
  HumanPresenceSubmission,
  RplConsentStatus,
  RplSubmission,
  RplSubmissionRecord,
} from "@/api/schemas/consent";
import type {
  DisclosureSpec,
  UpdateDisclosureSpecRequest,
} from "@/api/schemas/disclosure";
import type {
  ProofSpec,
  SubmitProofPayload,
} from "@/api/schemas/proof";
import type {
  PatchWorkspaceSettingsRequest,
  WorkspaceSettings,
} from "@/api/schemas/policyThresholds";
import type {
  AcceptFlaggedRequest,
  SuitabilityResults,
  WithdrawRequest,
} from "@/api/schemas/suitability";
import {
  consentScenarios,
  DEFAULT_CONSENT_SCENARIO,
  type ConsentScenarioId,
} from "./scenarios/consent";
import {
  computeValidationChecks,
  disclosureScenarios,
} from "./scenarios/disclosure";
import { findTemplateById } from "./scenarios/disclosure/templates";
import { proofScenarios } from "./scenarios/proof";
import {
  DEFAULT_POLICY_THRESHOLDS_SCENARIO,
  isPolicyThresholdsScenarioId,
  policyPresetItems,
  policyThresholdsScenarios,
  type PolicyThresholdsScenarioId,
} from "./scenarios/policyThresholds";
import {
  DEFAULT_SUITABILITY_SCENARIO,
  isSuitabilityScenarioId,
  suitabilityScenarios,
  type SuitabilityScenarioId,
} from "./scenarios/suitability";
import {
  DEFAULT_LEGAL_REVIEW_SCENARIO,
  findLegalAsset,
  findLegalDisclosureBySpecId,
  findLegalFixtureByApprovalId,
  findLegalFixtureByRunId,
  isLegalReviewScenarioId,
  legalReviewScenarios,
  type LegalReviewScenarioId,
} from "./scenarios/legalReview";
import { legalQueueFixtures } from "./scenarios/legalQueue";
import { evidencePackPreviewFixtures } from "./scenarios/evidencePackPreview";

interface MockState {
  activeScenarioOverride: MockScenario | null;
  approval: ApprovalDetail | null;
  evidencePackGenerated: boolean;
  c2paEmbedInFlight: boolean;
  disclosureDraft: DisclosureSpec | null;
  consentDraftByScenario: Partial<Record<ConsentScenarioId, ConsentSpec>>;
  proofDraftByScenario: Partial<Record<MockScenario, ProofSpec>>;
  policyThresholdDraftByScenario: Partial<
    Record<PolicyThresholdsScenarioId, WorkspaceSettings>
  >;
  suitabilityDraftByScenario: Partial<
    Record<SuitabilityScenarioId, SuitabilityResults>
  >;
  legalApprovalOverrides: Record<string, Partial<ApprovalDetail>>;
}

const initialState = (): MockState => ({
  activeScenarioOverride: null,
  approval: null,
  evidencePackGenerated: false,
  c2paEmbedInFlight: false,
  disclosureDraft: null,
  consentDraftByScenario: {},
  proofDraftByScenario: {},
  policyThresholdDraftByScenario: {},
  suitabilityDraftByScenario: {},
  legalApprovalOverrides: {},
});

let store: MockState = initialState();

export function resolveScenario(headerValue: string | null): MockScenario {
  if (store.activeScenarioOverride) return store.activeScenarioOverride;
  if (isScenario(headerValue)) return headerValue;
  return "in-progress";
}

function isScenario(value: string | null): value is MockScenario {
  return (
    value === "in-progress" ||
    value === "block" ||
    value === "challenge-pending" ||
    value === "system-error" ||
    value === "allow-with-warnings" ||
    value === "allow" ||
    value === "approved-pending-proof" ||
    value === "publish-cleared"
  );
}

export function getApproval(): ApprovalDetail | null {
  return store.approval;
}

export function setApproval(approval: ApprovalDetail): void {
  store.approval = approval;
}

export function updateApprovalState(
  approvalId: string,
  next: Partial<ApprovalDetail>,
): ApprovalDetail | null {
  if (!store.approval || store.approval.approval_id !== approvalId) return null;
  store.approval = { ...store.approval, ...next };
  return store.approval;
}

export function markEvidencePackGenerated(): void {
  store.evidencePackGenerated = true;
}

export function hasEvidencePack(): boolean {
  return store.evidencePackGenerated;
}

export function markC2paEmbedding(): void {
  store.c2paEmbedInFlight = true;
}

export function applyTransition(to: MockScenario): void {
  store.activeScenarioOverride = to;
  setMockScenario(to);
}

export function clearScenarioOverride(): void {
  store.activeScenarioOverride = null;
}

export function resetMockState(): void {
  store = initialState();
}

const APPROVAL_STATE_TRANSITIONS: Record<string, ApprovalState> = {
  approve: "APPROVED",
  "force-pass": "FORCE_PASSED",
  reject: "REJECTED",
};

export function approvalStateForAction(
  action: keyof typeof APPROVAL_STATE_TRANSITIONS,
): ApprovalState {
  return APPROVAL_STATE_TRANSITIONS[action] ?? "PENDING_REVIEW";
}

function seedDisclosureDraft(scenario: MockScenario): DisclosureSpec | null {
  const fromScenario = disclosureScenarios[scenario];
  if (!fromScenario) return null;
  return JSON.parse(JSON.stringify(fromScenario)) as DisclosureSpec;
}

export function getDisclosureDraft(
  scenario: MockScenario,
): DisclosureSpec | null {
  if (!store.disclosureDraft) {
    store.disclosureDraft = seedDisclosureDraft(scenario);
  }
  return store.disclosureDraft;
}

export function setDisclosureDraft(next: DisclosureSpec): void {
  store.disclosureDraft = next;
}

export function clearDisclosureDraft(): void {
  store.disclosureDraft = null;
}

export function mergeDisclosureForm(
  scenario: MockScenario,
  body: UpdateDisclosureSpecRequest,
): DisclosureSpec | null {
  const current = getDisclosureDraft(scenario);
  if (!current) return null;
  const nextForm = {
    ...(current.form ?? { final_text: "", language: "en", full_duration_confirmed: false }),
    ...body,
  };
  const nextTemplate = body.template_id
    ? findTemplateById(body.template_id) ?? current.template
    : current.template;
  const next: DisclosureSpec = {
    ...current,
    form: nextForm,
    template: nextTemplate,
    validation_checks: computeValidationChecks(
      nextForm,
      current.asset_duration_ms,
    ),
    updated_at: new Date().toISOString(),
  };
  store.disclosureDraft = next;
  return next;
}

export function lockDisclosureDraft(
  scenario: MockScenario,
): DisclosureSpec | null {
  const current = getDisclosureDraft(scenario);
  if (!current) return null;
  const allPass = (current.validation_checks ?? []).every(
    (c) => c.status === "PASS" || c.status === "NOT_APPLICABLE",
  );
  if (!allPass) return null;
  const locked: DisclosureSpec = {
    ...current,
    status: "DISCLOSURE_SPEC_LOCKED",
    locked_at: new Date().toISOString(),
    locked_hash: `sha256:demo-${Date.now().toString(16)}`,
    updated_at: new Date().toISOString(),
  };
  store.disclosureDraft = locked;
  return locked;
}

function cloneConsentSpec(spec: ConsentSpec): ConsentSpec {
  return JSON.parse(JSON.stringify(spec)) as ConsentSpec;
}

export function resolveConsentScenario(
  headerValue: string | null,
): ConsentScenarioId {
  if (headerValue && headerValue in consentScenarios) {
    return headerValue as ConsentScenarioId;
  }
  return DEFAULT_CONSENT_SCENARIO;
}

export function getConsentDraft(scenario: ConsentScenarioId): ConsentSpec {
  const existing = store.consentDraftByScenario[scenario];
  if (existing) return existing;
  const seeded = cloneConsentSpec(consentScenarios[scenario]);
  store.consentDraftByScenario[scenario] = seeded;
  return seeded;
}

export function clearConsentDraft(scenario: ConsentScenarioId): void {
  delete store.consentDraftByScenario[scenario];
}

export function applyRplSubmission(
  scenario: ConsentScenarioId,
  body: RplSubmission,
): ConsentSpec | null {
  const current = getConsentDraft(scenario);
  if (!current.rpl_section) return null;

  const submittedAt = new Date().toISOString();
  const baseRecord: RplSubmissionRecord = {
    consent_path: body.consent_path,
    declaration_confirmed: body.declaration_confirmed,
    submitted_at: submittedAt,
    submitted_by: "Reviewer (mock)",
    audit_trail_id: `aud_demo_rpl_${body.consent_path.toLowerCase()}_${Date.now().toString(16)}`,
  };

  let record: RplSubmissionRecord;
  let nextStatus: RplConsentStatus;

  if (body.consent_path === "A") {
    record = {
      ...baseRecord,
      consent_type: body.consent_type,
      document_filename: body.document_filename,
      document_size_bytes: body.document_size_bytes,
      document_hash: body.document_hash,
      document_description: body.document_description,
    };
    nextStatus = "RPL_CONSENT_ATTACHED";
  } else if (body.consent_path === "B") {
    record = { ...baseRecord, timeline_note: body.timeline_note };
    nextStatus = "RPL_CONSENT_REQUIRED";
  } else {
    record = { ...baseRecord, reason: body.reason };
    nextStatus = "RPL_NO_CONSENT_BLOCK";
  }

  const next: ConsentSpec = {
    ...current,
    rpl_section: {
      ...current.rpl_section,
      status: nextStatus,
      submission: record,
    },
    updated_at: submittedAt,
  };
  store.consentDraftByScenario[scenario] = next;
  return next;
}

function cloneProofSpec(spec: ProofSpec): ProofSpec {
  return JSON.parse(JSON.stringify(spec)) as ProofSpec;
}

function seedProofDraft(scenario: MockScenario): ProofSpec | null {
  const seed = proofScenarios[scenario];
  if (!seed) return null;
  return cloneProofSpec(seed);
}

export function getProofDraft(scenario: MockScenario): ProofSpec | null {
  const existing = store.proofDraftByScenario[scenario];
  if (existing) return existing;
  const seeded = seedProofDraft(scenario);
  if (seeded) {
    store.proofDraftByScenario[scenario] = seeded;
  }
  return seeded;
}

export function applyProofSubmission(
  scenario: MockScenario,
  body: SubmitProofPayload,
): ProofSpec | null {
  const current = getProofDraft(scenario);
  if (!current) return null;
  const submittedAt = new Date().toISOString();
  const next: ProofSpec = {
    ...current,
    status: "DISCLOSURE_PROOF_UPLOADED",
    validation_checks: current.validation_checks.map((check) => {
      if (check.status === "NOT_APPLICABLE") return check;
      return { ...check, status: "PASS" as const };
    }),
    submission: {
      proof_method: body.proof_method,
      filename: body.filename,
      size_bytes: body.size_bytes,
      hash: body.hash ?? "sha256:demo",
      attestation_confirmed:
        body.proof_method === "SCREENSHOT"
          ? body.attestation_confirmed
          : undefined,
      submitted_at: submittedAt,
      submitted_by: "Reviewer (mock)",
      audit_trail_id: `aud_demo_proof_${Date.now().toString(16)}`,
    },
    updated_at: submittedAt,
  };
  store.proofDraftByScenario[scenario] = next;
  store.proofDraftByScenario["publish-cleared"] = next;
  return next;
}

function clonePolicyThresholdSettings(s: WorkspaceSettings): WorkspaceSettings {
  return JSON.parse(JSON.stringify(s)) as WorkspaceSettings;
}

export function resolvePolicyThresholdsScenario(
  headerValue: string | null,
): PolicyThresholdsScenarioId {
  if (isPolicyThresholdsScenarioId(headerValue)) return headerValue;
  return DEFAULT_POLICY_THRESHOLDS_SCENARIO;
}

export function getPolicyThresholdDraft(
  scenario: PolicyThresholdsScenarioId,
): WorkspaceSettings {
  const existing = store.policyThresholdDraftByScenario[scenario];
  if (existing) return existing;
  const seeded = clonePolicyThresholdSettings(policyThresholdsScenarios[scenario]);
  store.policyThresholdDraftByScenario[scenario] = seeded;
  return seeded;
}

export function patchPolicyThresholdDraft(
  scenario: PolicyThresholdsScenarioId,
  body: PatchWorkspaceSettingsRequest,
): WorkspaceSettings {
  const current = getPolicyThresholdDraft(scenario);
  const overrideMap = new Map(
    (body.threshold_overrides ?? []).map((override) => [
      override.category_key,
      override.value,
    ]),
  );

  const nextPresetId = body.geo_preset ?? current.geo_preset;
  const presetChanged = nextPresetId !== current.geo_preset;
  const presetBaselines = presetChanged
    ? policyPresetItems.find((p) => p.preset_id === nextPresetId)
        ?.threshold_baselines ?? {}
    : null;

  const next: WorkspaceSettings = {
    ...current,
    geo_preset: nextPresetId,
    provenance_embed_on_human_generated:
      body.provenance_embed_on_human_generated ??
      current.provenance_embed_on_human_generated,
    threshold_rows: current.threshold_rows.map((row) => {
      let updated = overrideMap.has(row.category_key)
        ? { ...row, workspace_override: overrideMap.get(row.category_key) }
        : { ...row };

      if (presetBaselines) {
        const newBaseline = Object.prototype.hasOwnProperty.call(
          presetBaselines,
          row.category_key,
        )
          ? presetBaselines[row.category_key]
          : row.system_default;
        updated.geo_preset_baseline = newBaseline;

        if (
          updated.workspace_override != null &&
          newBaseline != null &&
          updated.workspace_override > newBaseline
        ) {
          updated.workspace_override = newBaseline;
        }
      }

      return updated;
    }),
    updated_at: new Date().toISOString(),
  };
  store.policyThresholdDraftByScenario[scenario] = next;
  return next;
}

function cloneSuitabilityResults(s: SuitabilityResults): SuitabilityResults {
  return JSON.parse(JSON.stringify(s)) as SuitabilityResults;
}

export function resolveSuitabilityScenario(
  headerValue: string | null,
): SuitabilityScenarioId {
  if (isSuitabilityScenarioId(headerValue)) return headerValue;
  return DEFAULT_SUITABILITY_SCENARIO;
}

export function getSuitabilityDraft(
  scenario: SuitabilityScenarioId,
): SuitabilityResults {
  const existing = store.suitabilityDraftByScenario[scenario];
  if (existing) return existing;
  const seeded = cloneSuitabilityResults(suitabilityScenarios[scenario]);
  store.suitabilityDraftByScenario[scenario] = seeded;
  return seeded;
}

export function applySuitabilityAcceptFlagged(
  scenario: SuitabilityScenarioId,
  body: AcceptFlaggedRequest,
): SuitabilityResults | null {
  const current = getSuitabilityDraft(scenario);
  if (current.counts.flagged === 0) return null;
  if (current.acceptance) return null;
  if (current.status === "BRAND_SUITABILITY_ASSET_WITHDRAWN") return null;

  const acceptedAt = new Date().toISOString();
  const next: SuitabilityResults = {
    ...current,
    status: "BRAND_SUITABILITY_FLAGGED_REVIEWED",
    acceptance: {
      accepted_at: acceptedAt,
      accepted_by: "Reviewer (mock)",
      accepted_by_role: "Reviewer",
      declaration_confirmed: true,
      notes: body.notes,
      audit_trail_id: `aud_demo_suit_accept_${Date.now().toString(16)}`,
    },
    updated_at: acceptedAt,
  };
  store.suitabilityDraftByScenario[scenario] = next;
  return next;
}

export function applySuitabilityWithdraw(
  scenario: SuitabilityScenarioId,
  body: WithdrawRequest,
): SuitabilityResults {
  const current = getSuitabilityDraft(scenario);
  const withdrawnAt = new Date().toISOString();
  const next: SuitabilityResults = {
    ...current,
    status: "BRAND_SUITABILITY_ASSET_WITHDRAWN",
    withdrawal: {
      withdrawn_at: withdrawnAt,
      withdrawn_by: "Reviewer (mock)",
      withdrawn_by_role: "Reviewer",
      reason: body.reason,
      audit_trail_id: `aud_demo_suit_withdraw_${Date.now().toString(16)}`,
    },
    updated_at: withdrawnAt,
  };
  store.suitabilityDraftByScenario[scenario] = next;
  return next;
}

export function resolveLegalScenario(
  headerValue: string | null,
): LegalReviewScenarioId {
  if (isLegalReviewScenarioId(headerValue)) return headerValue;
  return DEFAULT_LEGAL_REVIEW_SCENARIO;
}

function applyLegalOverride(approval: ApprovalDetail): ApprovalDetail {
  const override = store.legalApprovalOverrides[approval.approval_id];
  return override ? { ...approval, ...override } : approval;
}

function applyLegalOverrideToQueue(
  item: ApprovalQueueItem,
): ApprovalQueueItem {
  const override = store.legalApprovalOverrides[item.approval_id];
  return override ? { ...item, ...override } : item;
}

export function getLegalFixture(scenario: LegalReviewScenarioId) {
  return legalReviewScenarios[scenario];
}

export function getLegalFixtureByRunId(runId: string) {
  return findLegalFixtureByRunId(runId);
}

export function getLegalAsset(assetId: string) {
  return findLegalAsset(assetId);
}

export function getLegalDisclosure(specId: string) {
  return findLegalDisclosureBySpecId(specId);
}

export function getLegalApprovalById(approvalId: string): ApprovalDetail | null {
  const fromQueue = [
    ...legalQueueFixtures.pendingReview,
    ...legalQueueFixtures.reviewed,
    ...legalQueueFixtures.reviewerSubmissions,
  ].find((q) => q.approval_id === approvalId);
  if (fromQueue) {
    const detail: ApprovalDetail = {
      approval_id: fromQueue.approval_id,
      state: fromQueue.state,
      asset_id: fromQueue.asset_id,
      preflight_run_id: fromQueue.preflight_run_id,
      workspace_id: fromQueue.workspace_id,
      submitted_at: fromQueue.submitted_at,
      submitted_by: fromQueue.submitted_by,
      submitted_by_name: fromQueue.submitted_by_name,
      resolved_at: fromQueue.resolved_at,
      resolved_by_name: fromQueue.resolved_by_name,
      policy_verdict: fromQueue.policy_verdict,
      pack_status: fromQueue.pack_status,
      pack_download_url: fromQueue.pack_download_url,
      evidence_pack_id: fromQueue.evidence_pack_id,
      is_force_pass: fromQueue.is_force_pass,
      rejection_notes: fromQueue.rejection_notes,
    };
    return applyLegalOverride(detail);
  }
  const fixture = findLegalFixtureByApprovalId(approvalId);
  if (fixture) return applyLegalOverride(fixture.approval);
  return null;
}

interface QueueQuery {
  preflight_run_id?: string;
  status?: string;
  workspace_id?: string;
  submitted_by?: string;
  approver_id?: string;
  since?: string;
  until?: string;
  state?: string;
}

const PENDING_STATES = new Set([
  "PENDING_REVIEW",
  "SUBMITTED_FOR_APPROVAL",
  "UNDER_REVIEW",
]);

const REVIEWED_STATES = new Set([
  "APPROVED",
  "APPROVED_PENDING_PROOF",
  "OVERRIDE_APPROVED",
  "FORCE_PASSED",
  "REJECTED",
  "REJECTED_BACK_TO_REVIEWER",
]);

export function queryLegalQueue(params: QueueQuery): ApprovalQueueItem[] {
  if (params.submitted_by) {
    return legalQueueFixtures.reviewerSubmissions
      .filter((i) => i.submitted_by === params.submitted_by)
      .map(applyLegalOverrideToQueue);
  }
  const status = params.status ?? params.state;
  let pool: readonly ApprovalQueueItem[];
  if (status === "PENDING_REVIEW" || status === "UNDER_REVIEW") {
    pool = legalQueueFixtures.pendingReview;
  } else if (status === "REVIEWED" || status === "APPROVED") {
    pool = legalQueueFixtures.reviewed;
  } else if (status && REVIEWED_STATES.has(status)) {
    pool = legalQueueFixtures.reviewed.filter((i) => i.state === status);
  } else if (status && PENDING_STATES.has(status)) {
    pool = legalQueueFixtures.pendingReview.filter((i) => i.state === status);
  } else {
    pool = [
      ...legalQueueFixtures.pendingReview,
      ...legalQueueFixtures.reviewed,
    ];
  }
  let items = pool.map(applyLegalOverrideToQueue);
  if (params.preflight_run_id) {
    items = items.filter(
      (i) => i.preflight_run_id === params.preflight_run_id,
    );
  }
  if (params.workspace_id) {
    items = items.filter((i) => i.workspace_id === params.workspace_id);
  }
  if (params.since) {
    const sinceMs = Date.parse(params.since);
    if (!Number.isNaN(sinceMs)) {
      items = items.filter((i) => {
        const at = i.resolved_at ?? i.submitted_at;
        return at ? Date.parse(at) >= sinceMs : true;
      });
    }
  }
  if (params.until) {
    const untilMs = Date.parse(params.until);
    if (!Number.isNaN(untilMs)) {
      items = items.filter((i) => {
        const at = i.resolved_at ?? i.submitted_at;
        return at ? Date.parse(at) <= untilMs : true;
      });
    }
  }
  return items;
}

export const legalQueueCounts = legalQueueFixtures.counts;

export function applyLegalApprovalMutation(
  approvalId: string,
  patch: Partial<ApprovalDetail>,
): ApprovalDetail | null {
  const current = getLegalApprovalById(approvalId);
  if (!current) return null;
  store.legalApprovalOverrides[approvalId] = {
    ...store.legalApprovalOverrides[approvalId],
    ...patch,
  };
  return { ...current, ...patch };
}

export function getEvidencePackPreviewFixture(
  packId: string,
): EvidencePackPreview | null {
  return evidencePackPreviewFixtures[packId] ?? null;
}

export type { LegalReviewScenarioId };

export function applyHumanPresenceSubmission(
  scenario: ConsentScenarioId,
  body: HumanPresenceSubmission,
): ConsentSpec | null {
  const current = getConsentDraft(scenario);
  if (!current.human_presence_section) return null;

  const submittedAt = new Date().toISOString();
  const next: ConsentSpec = {
    ...current,
    human_presence_section: {
      ...current.human_presence_section,
      status: "HUMAN_PRESENCE_DECLARED",
      submission: {
        person_count_detected:
          current.human_presence_section.estimated_person_count,
        person_count_confirmed: body.person_count_confirmed,
        consent_type: body.consent_type,
        notes: body.notes,
        declaration_confirmed: body.declaration_confirmed,
        submitted_at: submittedAt,
        submitted_by: "Reviewer (mock)",
        audit_trail_id: `aud_demo_hp_${Date.now().toString(16)}`,
      },
    },
    updated_at: submittedAt,
  };
  store.consentDraftByScenario[scenario] = next;
  return next;
}
