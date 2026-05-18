import type { Obligation } from "@/api/schemas/obligations";
import type { PreflightStatusResponse } from "@/api/schemas/preflight";
import type { DisclosureSpec } from "@/api/schemas/disclosure";
import type {
  Advisory,
  Check,
  PreFlightState,
  VerdictSection,
  Violation,
} from "@/components/preflight/types";
import { AWAITING_RESULTS_COPY, SYSTEM_ERROR_COPY } from "../copy";

interface VerdictContext {
  state: PreFlightState;
  preflight: PreflightStatusResponse;
  disclosure?: DisclosureSpec;
  policyPackLabel: string;
}

export function toVerdictSection(ctx: VerdictContext): VerdictSection {
  const { state, preflight, disclosure, policyPackLabel } = ctx;

  if (state === "EVALUATION_IN_PROGRESS") {
    return { kind: "awaiting", ...AWAITING_RESULTS_COPY };
  }

  if (state === "SYSTEM_ERROR_POLICY_UNAVAILABLE") {
    return {
      kind: "system-error",
      panel: {
        ...SYSTEM_ERROR_COPY,
        meta: [
          {
            icon: "clock",
            label: `Error at: ${formatTime(preflight.completed_at)}`,
          },
          ...(preflight.incident_id
            ? [
                {
                  icon: "hash" as const,
                  label: `Incident: ${preflight.incident_id}`,
                },
              ]
            : []),
          { icon: "check", label: "Ops team notified automatically" },
          { icon: "shield", label: "Retries exhausted (Tier 3)" },
        ],
      },
    };
  }

  if (state === "DISCLOSURE_CHALLENGE_PENDING") {
    const challenge = disclosure?.challenge;
    return {
      kind: "challenge",
      pillLabel: "BLOCK_UNTIL_REMEDIATED",
      pillNote: policyPackLabel,
      suspensionNote:
        "Disclosure obligation is suspended — not dismissed. Provenance and Brand Suitability engines continue uninterrupted.",
      listHeader: "CHALLENGE STATUS",
      challenge: {
        enumValue: "DISCLOSURE_CHALLENGE_PENDING",
        submittedAt: challenge?.submitted_at
          ? `Submitted: ${formatDateTime(challenge.submitted_at)}`
          : "Submitted: —",
        submittedBy: challenge?.submitted_by
          ? `${challenge.submitted_by}${challenge.submitted_by_role ? ` (${challenge.submitted_by_role})` : ""}`
          : "Reviewer",
        reviewerJustification:
          challenge?.justification ?? "Awaiting justification…",
        declarationText:
          "I confirm that to the best of my knowledge this asset is human-generated and the AI detection result is incorrect.",
        auditNote:
          "Your challenge has been submitted and logged to the audit trail. Legal will review this rationale alongside the full compliance record. You will be notified when a decision is made. No further disclosure action is available to you until Legal resolves this challenge.",
      },
    };
  }

  if (state === "BLOCK_UNTIL_REMEDIATED") {
    const violations = preflight.obligations
      .filter((o) => o.severity === "MANDATORY")
      .map(toViolation);
    return {
      kind: "violations",
      pillLabel: preflight.verdict ?? "BLOCK_UNTIL_REMEDIATED",
      pillNote: policyPackLabel,
      listHeader: "VIOLATIONS",
      violations,
    };
  }

  if (state === "ALLOW_WITH_WARNINGS") {
    const advisories = preflight.obligations
      .filter((o) => o.severity === "ADVISORY")
      .map(toAdvisory);
    return {
      kind: "advisories",
      pillLabel: "ALLOW_WITH_WARNINGS",
      pillNote: policyPackLabel,
      listHeader: "ADVISORY ITEMS",
      advisories,
    };
  }

  return {
    kind: "allow-checks",
    pillLabel: "ALLOW",
    pillNote: policyPackLabel,
    listHeader: "CHECKS PASSED",
    checks: buildAllowChecks(preflight),
  };
}

function toViolation(obligation: Obligation): Violation {
  return {
    code: codeForObligation(obligation),
    description:
      obligation.explanation ?? "Compliance obligation requires remediation.",
    linkLabel: obligation.policy_reference
      ? `${obligation.policy_reference} ↗`
      : "View policy ↗",
    linkHref: "#",
  };
}

function toAdvisory(obligation: Obligation): Advisory {
  return {
    code: codeForObligation(obligation),
    description:
      obligation.explanation ?? "Advisory item flagged for Legal review.",
    linkLabel: obligation.policy_reference
      ? `${obligation.policy_reference} ↗`
      : "View policy ↗",
    linkHref: "#",
  };
}

function codeForObligation(obligation: Obligation): string {
  if (obligation.type === "DISCLOSURE_REQUIRED") {
    return "EU_AI_ACT_ART50_DISCLOSURE_REQUIRED";
  }
  if (obligation.type === "ATTESTATION_REQUIRED") {
    return "EU_AI_ACT_ART50_PROVENANCE_UNVERIFIED";
  }
  if (obligation.type === "BRAND_SUITABILITY_BLOCKED") {
    return "BRAND_SUITABILITY_FLAGGED";
  }
  if (obligation.type === "CONSENT_OR_SYNTHETIC_ATTESTATION_REQUIRED") {
    return "EU_AI_ACT_ART50_CONSENT_REQUIRED";
  }
  return String(obligation.type).toUpperCase();
}

function buildAllowChecks(preflight: PreflightStatusResponse): Check[] {
  const checks: Check[] = [];
  const synthetic = preflight.detection_scores?.synthetic;
  if (synthetic) {
    checks.push({
      title: "AI detection below threshold",
      description: `Confidence score ${synthetic.ai_generated_score.toFixed(2)}, below the disclosure threshold. No disclosure obligation triggered.`,
    });
  }
  if (preflight.engine_statuses?.provenance === "PROVENANCE_EMBEDDED") {
    checks.push({
      title: "C2PA provenance manifest embedded",
      description:
        "Governance version with C2PA manifest is available for download from the sidebar.",
    });
  }
  if (preflight.engine_statuses?.brand_suitability === "BRAND_SUITABILITY_CLEAR") {
    checks.push({
      title: "Brand suitability clear across all categories",
      description:
        "All moderation categories are below the flagging threshold.",
    });
  }
  if (preflight.detection_scores?.consent?.human_presence_detected === false) {
    checks.push({
      title: "No human presence or RPL detected",
      description:
        "No consent or image-rights obligations triggered for this asset.",
    });
  }
  if (checks.length === 0) {
    checks.push({
      title: "All engines terminal with no advisories",
      description: "No violations detected and no advisories raised.",
    });
  }
  return checks;
}

function formatTime(iso?: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toTimeString().slice(0, 8);
}

function formatDateTime(iso?: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${date.toISOString().slice(0, 10)} at ${date.toTimeString().slice(0, 8)}`;
}
