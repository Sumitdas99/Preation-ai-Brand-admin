import type {
  DetectionSummaryRow,
  DisclosureFormState,
  DisclosureRequirement,
} from "@/api/schemas/disclosure";
import type {
  DetectionPillTone,
  DetectionSummaryRowVM,
  RequirementAlertVM,
  RequirementGridCell,
} from "@/components/disclosure/types";
import {
  REQUIREMENT_ALERT_COPY,
  TRIGGER_LABELS,
} from "../copy";

export function toRequirementAlert(
  requirement: DisclosureRequirement | undefined,
  form?: DisclosureFormState,
): RequirementAlertVM {
  const r = requirement;
  const labels = REQUIREMENT_ALERT_COPY.gridLabels;
  const levelLabels = REQUIREMENT_ALERT_COPY.disclosureLevelLabels;

  const grid: RequirementGridCell[] = [
    {
      key: "trigger_type",
      label: labels.trigger_type,
      kind: "code-chip",
      tone: "danger",
      text: r?.trigger_type
        ? TRIGGER_LABELS[r.trigger_type] ?? r.trigger_type
        : "—",
    },
    {
      key: "disclosure_level",
      label: labels.disclosure_level,
      kind: "text-emphasis",
      tone: "danger",
      text: r?.disclosure_level
        ? levelLabels[r.disclosure_level] ?? r.disclosure_level
        : "—",
    },
    {
      key: "policy_basis",
      label: labels.policy_basis,
      kind: "link",
      text: r?.policy_basis ?? "—",
      href: r?.policy_reference_url,
    },
    {
      key: "geo_context",
      label: labels.geo_context,
      kind: "chips",
      tone: "info",
      chips: r?.geo_context && r.geo_context.length ? r.geo_context : [],
    },
    {
      key: "channel_platform",
      label: labels.channel_platform,
      kind: "chips",
      tone: "info",
      chips:
        r?.channel_platform && r.channel_platform.length
          ? r.channel_platform
          : [],
    },
    {
      key: "risk_indicator",
      label: labels.risk_indicator,
      kind: "indicator-chip",
      tone: riskTone(r?.risk_indicator),
      text: r?.risk_indicator ?? "—",
    },
  ];

  const rows: DetectionSummaryRowVM[] = (r?.detection_summary ?? []).map(
    (row) =>
      row.key === "scope" && form?.scope
        ? toDetectionRow({ ...row, value: form.scope })
        : toDetectionRow(row),
  );

  return {
    title: REQUIREMENT_ALERT_COPY.title,
    body: REQUIREMENT_ALERT_COPY.body,
    severityLabel: REQUIREMENT_ALERT_COPY.severityLabel,
    grid,
    detectionSummary: {
      header: REQUIREMENT_ALERT_COPY.detectionHeader,
      note: REQUIREMENT_ALERT_COPY.detectionNote,
      rows,
    },
  };
}

function riskTone(risk: string | undefined): "danger" | "warning" | "info" {
  if (risk === "HIGH") return "danger";
  if (risk === "MEDIUM") return "warning";
  return "info";
}

function toDetectionRow(row: DetectionSummaryRow): DetectionSummaryRowVM {
  if (row.key === "ai_generated_score") {
    return {
      key: row.key,
      label: row.label,
      score: row.score,
      scoreDisplay:
        typeof row.score === "number" ? row.score.toFixed(2) : undefined,
      pill: row.band
        ? { label: humanizeBand(row.band), tone: bandTone(row.band) }
        : undefined,
    };
  }

  if (row.key === "scope") {
    const scope = row.value;
    return {
      key: row.key,
      label: row.label,
      pill: scope
        ? {
            label: `${scope}${REQUIREMENT_ALERT_COPY.detectionPillSuffix}`,
            tone: "alert",
          }
        : undefined,
    };
  }

  if (row.key === "modality") {
    return {
      key: row.key,
      label: row.label,
      pill: row.value ? { label: row.value, tone: "info" } : undefined,
    };
  }

  const pillSource = row.band ?? row.value;
  return {
    key: row.key,
    label: row.label,
    pill: pillSource
      ? { label: humanizeBand(pillSource), tone: bandTone(pillSource) }
      : undefined,
  };
}

function humanizeBand(value: string): string {
  return value.replace(/_/g, " ");
}

function bandTone(value: string): DetectionPillTone {
  const v = value.toUpperCase();
  if (
    v === "BLOCK_BAND" ||
    v === "HIGH_CONFIDENCE" ||
    v === "FAIL"
  ) {
    return "alert";
  }
  if (v === "VIDEO" || v === "IMAGE" || v === "AUDIO") {
    return "info";
  }
  return "muted";
}
