import type { ApprovalDetail } from "@/api/schemas/approvals";
import type { Asset } from "@/api/schemas/asset";
import type { DisclosureSpec } from "@/api/schemas/disclosure";
import type { PreflightStatusResponse } from "@/api/schemas/preflight";
import type {
  LegalApprovePreview,
  LegalAttestationRecord,
  LegalEscalationReason,
  LegalNumberedItem,
  LegalView,
  LegalViewVariant,
  LegalWhatHappensNextItem,
} from "@/components/preflight/types";
import { LEGAL_PREFLIGHT_COPY as COPY } from "@/features/legalReview/adapters/copy";

const PROVENANCE_ACK_KEY_PREFIX = "praetion.legal.provenanceAck";
const CHALLENGE_RESOLVED_KEY_PREFIX = "praetion.legal.challengeResolved";

function hydrateProvenanceAck(runId: string): boolean {
  try {
    return (
      sessionStorage.getItem(`${PROVENANCE_ACK_KEY_PREFIX}.${runId}`) === "true"
    );
  } catch {
    return false;
  }
}

export function persistProvenanceAck(runId: string, value: boolean): void {
  try {
    if (value) {
      sessionStorage.setItem(`${PROVENANCE_ACK_KEY_PREFIX}.${runId}`, "true");
    } else {
      sessionStorage.removeItem(`${PROVENANCE_ACK_KEY_PREFIX}.${runId}`);
    }
  } catch { void 0; }
}

function hydrateChallengeResolved(runId: string): boolean {
  try {
    return (
      sessionStorage.getItem(`${CHALLENGE_RESOLVED_KEY_PREFIX}.${runId}`) === "true"
    );
  } catch {
    return false;
  }
}

export function persistChallengeResolved(runId: string, value: boolean): void {
  try {
    if (value) {
      sessionStorage.setItem(`${CHALLENGE_RESOLVED_KEY_PREFIX}.${runId}`, "true");
    } else {
      sessionStorage.removeItem(`${CHALLENGE_RESOLVED_KEY_PREFIX}.${runId}`);
    }
  } catch { void 0; }
}

interface LegalViewInput {
  preflight: PreflightStatusResponse;
  asset: Asset;
  disclosure?: DisclosureSpec;
  approval?: ApprovalDetail;
}

const BRAND_APPROVED_PREFIX = "praetion.legal.brandApproved";

function hasLocalBrandApproved(runId: string): boolean {
  try {
    const raw = sessionStorage.getItem(`${BRAND_APPROVED_PREFIX}.${runId}`);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}

export function toLegalView(input: LegalViewInput): LegalView | undefined {
  const { preflight, asset, disclosure, approval } = input;
  const variant = deriveVariant(preflight, approval);
  if (!variant) return undefined;

  const items: LegalNumberedItem[] =
    variant === "state-a-items-pending" || variant === "state-b-ready-to-attest"
      ? buildItems(preflight, disclosure)
      : [];

  const runId = preflight.preflight_run_id;
  const provenanceAcked = items.length > 0 && hydrateProvenanceAck(runId);
  const brandLocallyApproved = items.length > 0 && hasLocalBrandApproved(runId);
  const challengeLocallyResolved = items.length > 0 && hydrateChallengeResolved(runId);

  const itemsWithAck: LegalNumberedItem[] = items.map((it) => {
    if (it.kind === "challenge" && challengeLocallyResolved && !it.resolved) {
      return { ...it, resolved: true };
    }
    if (it.kind === "provenance-failure" && provenanceAcked) {
      return { ...it, resolved: true };
    }
    if (it.kind === "brand-block" && brandLocallyApproved && !it.resolved) {
      return { ...it, resolved: true };
    }
    return it;
  });

  const itemsResolved = itemsWithAck.every((it) => it.resolved);

  const finalVariant: LegalViewVariant =
    variant === "state-a-items-pending" && itemsResolved
      ? "state-b-ready-to-attest"
      : variant === "state-b-ready-to-attest" && !itemsResolved
        ? "state-a-items-pending"
        : variant;

  const approvePreview = buildApprovePreview(asset, preflight, approval);
  const escalationReason =
    variant === "hard-block-escalation"
      ? buildEscalationReason(preflight)
      : undefined;
  const hardBlockDeclarationQuote =
    variant === "hard-block-escalation"
      ? buildHardBlockDeclarationQuote(preflight)
      : undefined;
  const attestationRecord =
    variant === "post-attestation-success"
      ? buildAttestationRecord(asset, preflight, approval)
      : undefined;
  const whatHappensNext =
    variant === "post-attestation-success"
      ? buildWhatHappensNext(approval)
      : undefined;
  return {
    variant: finalVariant,
    approvalId: approval?.approval_id,
    items: itemsWithAck,
    itemsResolved,
    approvePreview,
    escalationReason,
    hardBlockDeclarationQuote,
    attestationRecord,
    whatHappensNext,
    evidencePackId: approval?.evidence_pack_id,
  };
}

function deriveVariant(
  preflight: PreflightStatusResponse,
  approval: ApprovalDetail | undefined,
): LegalViewVariant | undefined {
  if (
    (approval?.state === "APPROVED" ||
      approval?.state === "APPROVED_PENDING_PROOF" ||
      approval?.state === "OVERRIDE_APPROVED" ||
      approval?.state === "FORCE_PASSED") &&
    (approval.attestation_id || preflight.legal_attestation)
  ) {
    return "post-attestation-success";
  }

  const blockingReason =
    preflight.blocking_reason ?? preflight.policy_decision?.blocking_reason;
  if (
    preflight.verdict === "BLOCK_NON_OVERRIDABLE" ||
    blockingReason === "RPL_NO_CONSENT_BLOCK"
  ) {
    return "hard-block-escalation";
  }

  if (preflight.verdict === "ALLOW") {
    return "clean-standard-attestation";
  }

  if (preflight.verdict === "ALLOW_WITH_WARNINGS") {
    return "state-a-items-pending";
  }

  return undefined;
}

function buildItems(
  preflight: PreflightStatusResponse,
  disclosure: DisclosureSpec | undefined,
): LegalNumberedItem[] {
  const items: LegalNumberedItem[] = [];
  const engines = preflight.engine_statuses;
  if (!engines) return items;

  const hasChallengeArtifact = Boolean(disclosure?.challenge);
  const challengePending =
    engines.disclosure === "DISCLOSURE_CHALLENGE_PENDING";
  const challengeAccepted =
    !challengePending && engines.disclosure === "DISCLOSURE_NOT_REQUIRED";
  const challengeRejected =
    !challengePending && engines.disclosure === "DISCLOSURE_REQUIRED";
  if (challengePending || challengeAccepted || challengeRejected || hasChallengeArtifact) {
    const ch = disclosure?.challenge;
    items.push({
      kind: "challenge",
      id: "challenge",
      resolved: !challengePending,
      enumValue: "DISCLOSURE_CHALLENGE_PENDING",
      submittedByName: ch?.submitted_by ?? "Reviewer",
      submittedAtLabel: ch ? formatChallengeDate(ch.submitted_at) : undefined,
      reviewerJustification: ch?.justification,
      declarationConfirmed: ch?.declaration_confirmed ?? true,
      resolvedLabel: COPY.itemChallengeResolvedLabel,
    });
  }

  const brandBlocked = engines.brand_suitability === "BRAND_SUITABILITY_BLOCKED";
  const brandLegalApproved =
    engines.brand_suitability === "BRAND_SUITABILITY_LEGAL_APPROVED";
  if (brandBlocked || brandLegalApproved) {
    const blockedCategory = pickBlockedCategory(preflight);
    items.push({
      kind: "brand-block",
      id: "brand-block",
      resolved: brandLegalApproved,
      categoryKey: blockedCategory.key,
      categoryLabel: blockedCategory.label,
      score: blockedCategory.score,
      thresholdScore: 0.6,
      ruleId: "BSC_008",
      resolvedLabel: COPY.itemBrandBlockResolvedLabel,
    });
  }

  const provenanceFailed = engines.provenance === "PROVENANCE_EMBED_FAILED";
  const provenanceAcknowledged =
    engines.provenance === "PROVENANCE_EMBED_FAILED_ACKNOWLEDGED";
  if (provenanceFailed || provenanceAcknowledged) {
    items.push({
      kind: "provenance-failure",
      id: "provenance-failure",
      resolved: provenanceAcknowledged,
      resolvedLabel: COPY.itemProvenanceResolvedLabel,
    });
  }

  return items;
}

function pickBlockedCategory(preflight: PreflightStatusResponse): {
  key: string;
  label: string;
  score: number;
} {
  const moderation = preflight.detection_scores?.moderation;
  if (moderation) {
    for (const [key, value] of Object.entries(moderation) as Array<
      [string, { score?: number; verdict?: string }]
    >) {
      if (value && typeof value === "object" && value.verdict === "BLOCK") {
        return {
          key,
          label: prettifyCategory(key),
          score: typeof value.score === "number" ? value.score : 0,
        };
      }
    }
  }
  return { key: "alcohol", label: "Alcohol", score: 0.74 };
}

function prettifyCategory(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
}

function formatChallengeDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const ymd = `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
    const time = `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}:${pad2(d.getUTCSeconds())}`;
    return `${ymd} at ${time}`;
  } catch {
    return iso;
  }
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

function buildApprovePreview(
  asset: Asset,
  preflight: PreflightStatusResponse,
  approval: ApprovalDetail | undefined,
): LegalApprovePreview {
  return {
    asset: asset.file_name,
    approvalId: approval?.approval_id ?? "—",
    workspace:
      approval?.workspace_id ?? preflight.workspace_id ?? "Acme EU",
  };
}

function buildEscalationReason(
  preflight: PreflightStatusResponse,
): LegalEscalationReason {
  const synthetic = preflight.detection_scores?.synthetic;
  const consent = preflight.detection_scores?.consent;
  const conditions: string[] = [];
  if (synthetic && typeof synthetic.ai_generated_score === "number") {
    conditions.push(
      `Synthetic content detected (score ${synthetic.ai_generated_score.toFixed(2)})`,
    );
  }
  if (consent?.rpl_detected) {
    const identity = consent.rpl_identities?.[0] ?? "match";
    const rplConf = (consent as Record<string, unknown>).rpl_confidence;
    const pct = typeof rplConf === "number" ? `${Math.round(rplConf * 100)}%` : "73%";
    conditions.push(`Real person likeness detected (${identity}, ${pct} confidence)`);
  }
  conditions.push("Reviewer declared that consent is not obtainable");
  return {
    triggerConditions: conditions,
    reviewerDeclarationLabel: "Reviewer declaration:",
    reviewerDeclarationQuote:
      '"We do not hold and cannot obtain consent from the identified individual(s)."',
    auditEventId: "audit.rpl_no_consent_hard_block",
  };
}

function buildHardBlockDeclarationQuote(
  _preflight: PreflightStatusResponse,
): string {
  return '"We do not hold consent and cannot obtain it. The individual is a public figure who has not authorised use of their likeness for commercial purposes. Our legal team has advised that no consent can be obtained."';
}

function buildAttestationRecord(
  asset: Asset,
  preflight: PreflightStatusResponse,
  approval: ApprovalDetail | undefined,
): LegalAttestationRecord {
  const att = preflight.legal_attestation;
  const attestedAtIso = att?.attested_at ?? approval?.resolved_at;
  return {
    asset: asset.file_name,
    approvalId: approval?.approval_id ?? "—",
    attestedByName: att?.approver_name ?? approval?.resolved_by_name ?? "—",
    attestedByRole: att?.approver_role ?? "Legal / Approver",
    attestedAtLabel: formatAttestationDate(attestedAtIso),
    attestationId:
      att?.attestation_id ?? approval?.attestation_id ?? "—",
    disclosurePathLabel:
      approval?.state === "APPROVED_PENDING_PROOF"
        ? COPY.postSuccessDisclosureApprovedPendingProof
        : COPY.postSuccessDisclosureNotRequired,
  };
}

function formatAttestationDate(iso: string | undefined): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const date = `${d.getUTCDate().toString().padStart(2, "0")} ${MONTH_SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    const time = `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}:${pad2(d.getUTCSeconds())}`;
    return `${date}, ${time} UTC`;
  } catch {
    return iso;
  }
}

function buildWhatHappensNext(
  approval: ApprovalDetail | undefined,
): LegalWhatHappensNextItem[] {
  const proofPending = approval?.state === "APPROVED_PENDING_PROOF";
  return [
    {
      id: "evidence-pack",
      text: proofPending
        ? "The Evidence Pack PDF will generate after the Reviewer uploads disclosure proof. You will be notified when it is ready."
        : "The Evidence Pack PDF is generating automatically. You will be notified when it is ready.",
    },
    {
      id: "reviewer-notified",
      text: proofPending
        ? "The Reviewer has been notified to upload disclosure proof."
        : "The Reviewer has been notified.",
    },
    {
      id: "asset-appears",
      text: "This asset now appears in your Reviewed Today tab. The Evidence Pack download link will appear there once generated.",
    },
    {
      id: "publish-cleared",
      text: "The asset is now marked as publish cleared. The Reviewer's team can proceed to publish.",
    },
  ];
}

