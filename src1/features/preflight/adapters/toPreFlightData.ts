import type { ApprovalDetail } from "@/api/schemas/approvals";
import type { Asset } from "@/api/schemas/asset";
import type { DisclosureSpec } from "@/api/schemas/disclosure";
import type { PreflightStatusResponse } from "@/api/schemas/preflight";
import type { Banner, LegalView, PreFlightData } from "@/components/preflight/types";
import type { ViewerRole } from "@/components/preflight/viewerRole";
import { LEGAL_PREFLIGHT_COPY as LEGAL_COPY } from "@/features/legalReview/adapters/copy";
import { AUDIT_FOOTER_TEXT } from "./copy";
import { deriveUIState } from "./deriveUIState";
import { toActionSections } from "./sections/toActionSections";
import { toAssetDetails, toVideoThumbnail } from "./sections/toAssetDetails";
import { toAssetVersions } from "./sections/toAssetVersions";
import { toBanner } from "./sections/toBanner";
import {
  isSyntheticDetected,
  toChallengePanel,
} from "./sections/toChallengePanel";
import { toComplianceChecksList } from "./sections/toComplianceChecksList";
import { toDetectionRows } from "./sections/toDetectionRows";
import { toEngineTiles } from "./sections/toEngineTiles";
import { toEvidencePackPanel } from "./sections/toEvidencePackPanel";
import { toLegalApprovalRecord } from "./sections/toLegalApprovalRecord";
import { toLegalView } from "./sections/toLegalView";
import { toModalityProgress } from "./sections/toModalityProgress";
import { toSystemErrorDetails } from "./sections/toSystemErrorDetails";
import { toTopBar } from "./sections/toTopBar";
import { toVerdictSection } from "./sections/toVerdictSection";
import { toWhatHappensNext } from "./sections/toWhatHappensNext";

export interface ToPreFlightDataResult {
  data: PreFlightData;
  forcePassDisabled: boolean;
  mandatoryObligationsResolved: boolean;
  approvalId?: string;
  disclosureSpecId?: string;
  consentSpecId?: string;
  proofSpecId?: string;
}

export function toPreFlightData(
  preflight: PreflightStatusResponse,
  asset: Asset,
  disclosure: DisclosureSpec | undefined,
  role: ViewerRole = "Reviewer",
  approval?: ApprovalDetail,
): ToPreFlightDataResult {
  const derived = deriveUIState(preflight);
  const { state, forcePassDisabled } = derived;

  const policyPackLabel = buildPolicyPackLabel(preflight);
  const mandatoryCount = preflight.obligations.filter(
    (o) => o.severity === "MANDATORY",
  ).length;
  const advisoryCount = preflight.obligations.filter(
    (o) => o.severity === "ADVISORY",
  ).length;

  const challengeAlreadySubmitted = Boolean(disclosure?.challenge);
  const consentSpecId = extractConsentSpecId(preflight);
  const consentRequired = isConsentRequired(preflight);
  const syntheticDetected = isSyntheticDetected(preflight);

  const baseBanner = toBanner(state, mandatoryCount);
  const topBar = toTopBar(asset, role);
  const assetDetails = toAssetDetails(asset, preflight, state, disclosure);
  const videoThumbnail = toVideoThumbnail(asset);
  const modalityProgress = toModalityProgress(preflight);
  const assetVersions = toAssetVersions(asset, preflight, role, state);
  const systemErrorDetails = toSystemErrorDetails(preflight);
  const isLegal = role === "Legal";
  const detectionResults = stateHidesDetection(state)
    ? undefined
    : toDetectionRows(preflight.detection_scores, {
        challengeSubmitted: challengeAlreadySubmitted,
        legalMode: isLegal,
        engineStatuses: preflight.engine_statuses,
      });
  const legalApprovalRecord = toLegalApprovalRecord(preflight, state);
  const evidencePackPanel = toEvidencePackPanel(preflight, asset, state);
  const complianceChecksList = toComplianceChecksList(
    preflight,
    disclosure,
    state,
  );
  const whatHappensNext = toWhatHappensNext(state);
  const engines = toEngineTiles(state, preflight.engine_statuses, isLegal);
  const verdict = toVerdictSection({
    state,
    preflight,
    disclosure,
    policyPackLabel,
  });
  const actionSections = toActionSections({
    state,
    forcePassDisabled,
    challengeAlreadySubmitted,
    advisoryCount,
    consentRequired,
    syntheticDetected,
  });
  const challengePanel = toChallengePanel({
    state,
    role,
    preflight,
    disclosure,
    challengeAlreadySubmitted,
  });
  const legalView =
    role === "Legal"
      ? toLegalView({ preflight, asset, disclosure, approval })
      : undefined;
  const banner = legalView
    ? overrideBannerForLegal(baseBanner, legalView, approval, asset)
    : baseBanner;

  const data: PreFlightData = {
    state,
    topBar,
    banner,
    videoThumbnail,
    assetDetails,
    modalityProgress,
    assetVersions,
    systemErrorDetails,
    auditFooterText: assetVersions ? AUDIT_FOOTER_TEXT : undefined,
    detectionResults,
    legalApprovalRecord,
    evidencePackPanel,
    complianceChecksList,
    whatHappensNext,
    engines,
    verdict,
    actionSections,
    challengePanel,
    legalView,
  };

  const disclosureSpecId = extractDisclosureSpecId(preflight, disclosure);
  const proofSpecId = preflight.proof_spec_id ?? disclosureSpecId;

  return {
    data,
    forcePassDisabled,
    mandatoryObligationsResolved: mandatoryCount === 0,
    disclosureSpecId,
    consentSpecId,
    proofSpecId,
  };
}

function buildPolicyPackLabel(preflight: PreflightStatusResponse): string {
  const pack = preflight.policy_decision?.policy_pack_id;
  const version = preflight.policy_decision?.policy_pack_version;
  if (!pack) return "Policy pack";
  return `${pack.toUpperCase().replace(/_/g, " ")}${version ? ` pack v${version}` : ""}`;
}

function extractDisclosureSpecId(
  preflight: PreflightStatusResponse,
  disclosure?: DisclosureSpec,
): string | undefined {
  if (disclosure?.spec_id) return disclosure.spec_id;
  const disclosureObligation = preflight.obligations.find(
    (o) => o.type === "DISCLOSURE_REQUIRED" && o.spec_id,
  );
  return disclosureObligation?.spec_id;
}

function extractConsentSpecId(
  preflight: PreflightStatusResponse,
): string | undefined {
  const consentObligation = preflight.obligations.find(
    (o) =>
      o.type === "CONSENT_OR_SYNTHETIC_ATTESTATION_REQUIRED" && o.spec_id,
  );
  return consentObligation?.spec_id;
}

function stateHidesDetection(state: ReturnType<typeof deriveUIState>["state"]): boolean {
  return state === "APPROVED_PENDING_PROOF" || state === "PUBLISH_CLEARED";
}

function isConsentRequired(preflight: PreflightStatusResponse): boolean {
  const consent = preflight.detection_scores?.consent;
  if (!consent) return false;
  if (consent.evaluation_status !== "COMPLETE") return false;
  return Boolean(consent.human_presence_detected || consent.rpl_detected);
}

function overrideBannerForLegal(
  base: Banner,
  legal: LegalView,
  approval: ApprovalDetail | undefined,
  asset: Asset,
): Banner {
  switch (legal.variant) {
    case "state-a-items-pending": {
      const pendingCount = legal.items.filter((it) => !it.resolved).length;
      const ageLabel = approval?.submitted_at
        ? formatLegalAge(approval.submitted_at)
        : "moments ago";
      const submittedBy = approval?.submitted_by_name ?? "Reviewer";
      const priorityLabel = derivePriorityLabel(legal);
      return {
        tone: "legal-under-review",
        title: LEGAL_COPY.bannerStateATitle(pendingCount),
        description: LEGAL_COPY.bannerStateASubline(
          submittedBy,
          ageLabel,
          priorityLabel,
        ),
        tag: LEGAL_COPY.tagUnderReview,
      };
    }
    case "state-b-ready-to-attest":
      return {
        tone: "legal-ready-to-attest",
        title: LEGAL_COPY.bannerStateBTitle,
        description: LEGAL_COPY.bannerStateBSubline,
        tag: LEGAL_COPY.tagReadyToAttest,
      };
    case "clean-standard-attestation": {
      const submittedBy = approval?.submitted_by_name ?? "Reviewer";
      const ageLabel = approval?.submitted_at
        ? formatLegalAge(approval.submitted_at)
        : "moments ago";
      return {
        tone: "legal-ready-to-attest",
        title: LEGAL_COPY.bannerCleanTitle,
        description: LEGAL_COPY.bannerCleanSubline(submittedBy, ageLabel),
        tag: LEGAL_COPY.tagUnderReview,
      };
    }
    case "hard-block-escalation":
      return {
        tone: "legal-hard-block",
        title: LEGAL_COPY.bannerHardBlockTitle,
        description: LEGAL_COPY.bannerHardBlockSubline,
        tag: LEGAL_COPY.tagBlockNonOverridable,
      };
    case "post-attestation-success":
      return {
        tone: "legal-attestation-complete",
        title: LEGAL_COPY.bannerPostAttestationTitle,
        description: LEGAL_COPY.bannerPostAttestationSubline,
        tag: LEGAL_COPY.tagApproved,
      };
    default:
      return base;
  }
  void asset;
}

function derivePriorityLabel(legal: LegalView): string {
  const hasChallenge = legal.items.some((it) => it.kind === "challenge" && !it.resolved);
  const hasBrandBlock = legal.items.some(
    (it) => it.kind === "brand-block" && !it.resolved,
  );
  if (hasChallenge) return "High (detection challenge pending)";
  if (hasBrandBlock) return "High (brand block pending)";
  return "Standard";
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

const LEGAL_MODE_NOW = new Date("2026-04-18T16:00:00Z");

function formatLegalAge(submittedAtIso: string): string {
  try {
    const submitted = new Date(submittedAtIso);
    if (Number.isNaN(submitted.getTime())) return "moments ago";
    const ms = LEGAL_MODE_NOW.getTime() - submitted.getTime();
    if (ms < 60_000) return "moments ago";
    const minutes = Math.floor(ms / 60_000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    const remMin = minutes - hours * 60;
    if (hours < 24) {
      return remMin > 0 ? `${hours}h ${remMin}m ago` : `${hours}h ago`;
    }
    const day = `${pad2(submitted.getUTCDate())} ${MONTH_SHORT[submitted.getUTCMonth()]}`;
    const time = `${pad2(submitted.getUTCHours())}:${pad2(submitted.getUTCMinutes())}`;
    return `${day} · ${time}`;
  } catch {
    return "moments ago";
  }
}

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}
