import {
  MODERATION_CATEGORY_KEYS,
  DetectionScores,
  ModerationCategoryKey,
} from "@/api/schemas/detection";
import type { EngineStatuses } from "@/api/schemas/preflight";
import type {
  DetectionResults,
  Detector,
  DetectorBand,
} from "@/components/preflight/types";
import { DETECTION_LABELS } from "../copy";

interface DetectionRowOpts {
  challengeSubmitted?: boolean;
  legalMode?: boolean;
  engineStatuses?: EngineStatuses;
}

export function toDetectionRows(
  scores: DetectionScores | undefined,
  opts: DetectionRowOpts = {},
): DetectionResults {
  if (!scores) {
    return { subtitle: "", mode: "skeleton", rows: [] };
  }

  const rows: Detector[] = [];

  if (scores.synthetic && scores.synthetic.evaluation_status !== "NOT_APPLICABLE") {
    rows.push(buildSyntheticRow(scores.synthetic, opts.challengeSubmitted, opts.legalMode));
  }

  if (opts.legalMode) {
    if (scores.consent && scores.consent.evaluation_status !== "NOT_APPLICABLE") {
      const consentRow = buildConsentRowLegal(scores.consent, opts.engineStatuses);
      if (consentRow) rows.push(consentRow);
    }
    pushModerationRowsLegal(rows, scores.moderation, opts.engineStatuses);
    const isHardBlock = opts.engineStatuses?.disclosure === "RPL_NO_CONSENT_BLOCK";
    if (!isHardBlock && scores.provenance && scores.provenance.evaluation_status !== "NOT_APPLICABLE") {
      rows.push(buildProvenanceRowLegal(scores.provenance, opts.engineStatuses));
    }
  } else {
    if (scores.consent && scores.consent.evaluation_status !== "NOT_APPLICABLE") {
      rows.push(buildConsentRow(scores.consent));
    }
    if (scores.moderation && scores.moderation.evaluation_status !== "NOT_APPLICABLE") {
      for (const key of MODERATION_CATEGORY_KEYS) {
        const row = buildModerationRow(key, scores.moderation);
        if (row) rows.push(row);
      }
    }
    if (scores.provenance && scores.provenance.evaluation_status !== "NOT_APPLICABLE") {
      rows.push(buildProvenanceRow(scores.provenance));
    }
  }

  return { subtitle: "", mode: "normal", rows };
}

function buildSyntheticRow(
  synthetic: NonNullable<DetectionScores["synthetic"]>,
  challengeSubmitted?: boolean,
  legalMode?: boolean,
): Detector {
  if (synthetic.evaluation_status === "EVALUATION_FAILED") {
    return {
      label: DETECTION_LABELS.synthetic,
      band: "NOT_DETECTED",
      badgeLabel: "EVALUATION FAILED",
    };
  }

  if (challengeSubmitted) {
    return {
      label: DETECTION_LABELS.synthetic,
      score: synthetic.ai_generated_score,
      band: "CHALLENGED_BY_REVIEWER",
      badgeLabel: "CHALLENGED BY REVIEWER",
    };
  }

  const band = bandFromConfidence(synthetic.confidence_band);
  const badgeLabel = badgeLabelFromBand(synthetic.confidence_band);
  const flagged =
    !legalMode &&
    synthetic.confidence_band === "BLOCK_BAND" &&
    synthetic.source_detectors.length > 0;
  return {
    label: DETECTION_LABELS.synthetic,
    score: synthetic.ai_generated_score,
    band,
    badgeLabel,
    inlineCallout: flagged
      ? {
          tone: "warning",
          text: DETECTION_LABELS.syntheticCallout(synthetic.deepfake_score),
        }
      : undefined,
  };
}

function buildConsentRow(
  consent: NonNullable<DetectionScores["consent"]>,
): Detector {
  if (consent.evaluation_status === "EVALUATION_FAILED") {
    return {
      label: DETECTION_LABELS.humanPresenceRpl,
      band: "NOT_DETECTED",
      badgeLabel: "EVALUATION FAILED",
    };
  }
  if (!consent.human_presence_detected) {
    return {
      label: DETECTION_LABELS.humanPresenceRpl,
      band: "NO_PEOPLE_DETECTED",
      badgeLabel: "No people detected",
    };
  }
  if (consent.rpl_detected) {
    return {
      label: DETECTION_LABELS.humanPresenceRpl,
      band: "FLAG_BAND",
      badgeLabel: "RPL DETECTED",
    };
  }
  return {
    label: DETECTION_LABELS.humanPresenceRpl,
    band: "ALLOW",
    badgeLabel: "Presence declared",
  };
}

function buildModerationRow(
  key: ModerationCategoryKey,
  moderation: NonNullable<DetectionScores["moderation"]>,
): Detector | null {
  const category = moderation[key];
  if (!category) return null;

  const label = `${DETECTION_LABELS.moderationPrefix} ${DETECTION_LABELS.moderationLabels[key]}`;

  if (moderation.evaluation_status === "EVALUATION_FAILED") {
    return {
      label,
      band: "NOT_DETECTED",
      badgeLabel: "EVALUATION FAILED",
    };
  }

  const verdict = (category as { verdict?: string }).verdict;
  const score = (category as { score?: number }).score;

  if (verdict === "BLOCK") {
    return {
      label,
      score,
      band: "BLOCK_BAND",
      badgeLabel: "BLOCK BAND",
    };
  }
  if (verdict === "FLAG") {
    return {
      label,
      score,
      band: "FLAGGED_ADVISORY",
      badgeLabel: "FLAGGED advisory",
    };
  }
  if (score !== undefined && score > 0) {
    return {
      label,
      score,
      band: "ALLOW",
      badgeLabel: "ALLOW",
    };
  }
  return null;
}

function buildProvenanceRow(
  provenance: NonNullable<DetectionScores["provenance"]>,
): Detector {
  if (provenance.evaluation_status === "EVALUATION_FAILED") {
    return {
      label: DETECTION_LABELS.provenance,
      band: "NOT_DETECTED",
      badgeLabel: "EVALUATION FAILED",
    };
  }
  if (provenance.manifest_status === "PRESENT") {
    return {
      label: DETECTION_LABELS.provenance,
      band: "ALLOW",
      badgeLabel: "MANIFEST PRESENT",
    };
  }
  if (provenance.manifest_status === "ABSENT") {
    return {
      label: DETECTION_LABELS.provenance,
      band: "FLAG_BAND",
      badgeLabel: "MANIFEST ABSENT",
    };
  }
  return {
    label: DETECTION_LABELS.provenance,
    band: "BLOCK_BAND",
    badgeLabel: "MANIFEST INVALID",
  };
}

function bandFromConfidence(
  band: NonNullable<DetectionScores["synthetic"]>["confidence_band"],
): DetectorBand {
  if (band === "BLOCK_BAND") return "BLOCK_BAND";
  if (band === "FLAG_BAND") return "FLAG_BAND";
  return "ALLOW";
}

function badgeLabelFromBand(
  band: NonNullable<DetectionScores["synthetic"]>["confidence_band"],
): string {
  if (band === "BLOCK_BAND") return "BLOCK BAND";
  if (band === "FLAG_BAND") return "FLAG BAND";
  return "BELOW THRESHOLD";
}

function buildConsentRowLegal(
  consent: NonNullable<DetectionScores["consent"]>,
  engines?: EngineStatuses,
): Detector | null {
  if (consent.rpl_detected) {
    const identity = consent.rpl_identities?.[0] ?? "match";
    const rplConf = (consent as Record<string, unknown>).rpl_confidence;
    const score = typeof rplConf === "number" ? rplConf : undefined;
    const noConsent = engines?.disclosure === "RPL_NO_CONSENT_BLOCK";
    return {
      label: "RPL · celebrity match",
      score,
      band: "BLOCK_BAND",
      badgeLabel: noConsent ? `${identity} · no consent` : `${identity}`,
    };
  }
  return null;
}

function pushModerationRowsLegal(
  rows: Detector[],
  moderation: DetectionScores["moderation"],
  engines?: EngineStatuses,
): void {
  if (!moderation || moderation.evaluation_status === "NOT_APPLICABLE") return;

  const hasBlock = MODERATION_CATEGORY_KEYS.some((k) => {
    const cat = moderation[k] as { verdict?: string } | undefined;
    return cat?.verdict === "BLOCK";
  });
  const hasFlag = MODERATION_CATEGORY_KEYS.some((k) => {
    const cat = moderation[k] as { verdict?: string } | undefined;
    return cat?.verdict === "FLAG";
  });

  if (!hasBlock && !hasFlag) {
    rows.push({
      label: "Brand suitability all",
      score: 1,
      band: "ALLOW",
      badgeLabel: "CLEAR",
    });
    return;
  }

  const brandBlocked = engines?.brand_suitability === "BRAND_SUITABILITY_BLOCKED";
  const brandLegalApproved =
    engines?.brand_suitability === "BRAND_SUITABILITY_LEGAL_APPROVED";

  for (const key of MODERATION_CATEGORY_KEYS) {
    const category = moderation[key];
    if (!category) continue;
    const verdict = (category as { verdict?: string }).verdict;
    const score = (category as { score?: number }).score;
    const label = `${DETECTION_LABELS.moderationPrefix} ${DETECTION_LABELS.moderationLabels[key]}`;

    if (verdict === "BLOCK") {
      rows.push({
        label,
        score,
        band: "BLOCK_BAND",
        badgeLabel: brandLegalApproved ? "BLOCKED · Legal approved" : "BLOCKED",
      });
    } else if (verdict === "FLAG") {
      const accepted = brandBlocked || brandLegalApproved;
      rows.push({
        label,
        score,
        band: accepted ? "FLAGGED_ACCEPTED" : "FLAGGED_ADVISORY",
        badgeLabel: accepted
          ? "FLAGGED · Reviewer accepted"
          : "FLAGGED · advisory",
      });
    }
  }
}

function buildProvenanceRowLegal(
  provenance: NonNullable<DetectionScores["provenance"]>,
  engines?: EngineStatuses,
): Detector {
  if (provenance.evaluation_status === "EVALUATION_FAILED") {
    return {
      label: DETECTION_LABELS.provenance,
      band: "NOT_DETECTED",
      badgeLabel: "EVALUATION FAILED",
    };
  }

  if (provenance.manifest_status === "PRESENT") {
    return {
      label: "Provenance",
      band: "ALLOW",
      badgeLabel: "C2PA EMBEDDED",
    };
  }

  const embedFailed =
    engines?.provenance === "PROVENANCE_EMBED_FAILED" ||
    engines?.provenance === "PROVENANCE_EMBED_FAILED_ACKNOWLEDGED";
  if (provenance.manifest_status === "ABSENT" && embedFailed) {
    return {
      label: "Provenance",
      band: "FLAG_BAND",
      badgeLabel: "EMBED_FAILED · auto-proceeded",
    };
  }

  if (provenance.manifest_status === "ABSENT") {
    return {
      label: "Provenance",
      band: "FLAG_BAND",
      badgeLabel: "MANIFEST ABSENT",
    };
  }

  return {
    label: "Provenance",
    band: "BLOCK_BAND",
    badgeLabel: "MANIFEST INVALID",
  };
}
