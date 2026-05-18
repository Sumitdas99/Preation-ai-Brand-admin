import type { EngineStatuses } from "@/api/schemas/preflight";
import type {
  EngineStatus,
  EngineStatusStrip,
  EngineTile,
  Engines,
  PreFlightState,
} from "@/components/preflight/types";
import { ENGINE_LABELS, ENGINE_PANEL_COPY, ENGINE_STATUS_LABELS, ENGINE_STATUS_LABELS_LEGAL } from "../copy";

type DisclosureStatus = EngineStatuses["disclosure"];
type ProvenanceStatus = EngineStatuses["provenance"];
type BrandStatus = EngineStatuses["brand_suitability"];

const TERMINAL_DISCLOSURE = new Set<DisclosureStatus>([
  "DISCLOSURE_NOT_REQUIRED",
  "DISCLOSURE_SPEC_LOCKED",
  "APPROVED_PENDING_PROOF",
  "DISCLOSURE_PROOF_UPLOADED",
  "RPL_CONSENT_ATTACHED",
  "HUMAN_PRESENCE_DECLARED",
] as DisclosureStatus[]);

const TERMINAL_PROVENANCE = new Set<ProvenanceStatus>([
  "PROVENANCE_EMBEDDED",
  "PROVENANCE_EMBED_FAILED",
  "MANIFEST_TAMPERED_FLAGGED",
] as ProvenanceStatus[]);

const TERMINAL_BRAND = new Set<BrandStatus>([
  "BRAND_SUITABILITY_CLEAR",
  "BRAND_SUITABILITY_FLAGGED_REVIEWED",
  "BRAND_SUITABILITY_BLOCKED",
  "BRAND_SUITABILITY_ASSET_WITHDRAWN",
] as BrandStatus[]);

export function toEngineTiles(
  state: PreFlightState,
  engines: EngineStatuses | undefined,
  legalMode = false,
): Engines {
  if (state === "EVALUATION_IN_PROGRESS" || !engines) {
    return {
      subtitle: ENGINE_PANEL_COPY.inProgressSubtitle,
      mode: "skeleton",
      tiles: [],
    };
  }

  const labels = legalMode ? ENGINE_STATUS_LABELS_LEGAL : ENGINE_STATUS_LABELS;
  const tiles: EngineTile[] = [
    buildDisclosureTile(engines.disclosure, labels),
    buildProvenanceTile(engines.provenance, labels, legalMode),
    buildBrandTile(engines.brand_suitability, labels),
  ];

  const subtitle = subtitleFor(state);
  const bottomStrip = legalMode ? undefined : bottomStripFor(state, engines);
  const headerLabel = headerLabelFor(state);

  return { subtitle, mode: "normal", tiles, bottomStrip, headerLabel };
}

function headerLabelFor(state: PreFlightState): string | undefined {
  if (state === "APPROVED_PENDING_PROOF" || state === "PUBLISH_CLEARED") {
    return "Engine Status";
  }
  return undefined;
}

export function areAllEnginesTerminal(engines: EngineStatuses | undefined): boolean {
  if (!engines) return false;
  return (
    TERMINAL_DISCLOSURE.has(engines.disclosure) &&
    TERMINAL_PROVENANCE.has(engines.provenance) &&
    TERMINAL_BRAND.has(engines.brand_suitability)
  );
}

function buildDisclosureTile(
  status: DisclosureStatus,
  labels: Record<string, string>,
): EngineTile {
  const uiStatus: EngineStatus =
    status === "DISCLOSURE_CHALLENGE_PENDING"
      ? "challenge-pending"
      : status === "DISCLOSURE_REQUIRED"
        ? "action-required"
        : status === "DISCLOSURE_SPEC_LOCKED"
          ? "locked"
          : status === "DISCLOSURE_NOT_REQUIRED"
            ? "clear"
            : status === "APPROVED_PENDING_PROOF"
              ? "in-progress"
              : status === "DISCLOSURE_PROOF_UPLOADED"
                ? "clear"
                : status === "RPL_CONSENT_ATTACHED" ||
                    status === "HUMAN_PRESENCE_DECLARED"
                  ? "clear"
                  : status === "RPL_NO_CONSENT_BLOCK"
                    ? "action-required"
                    : "in-progress";
  return {
    name: ENGINE_LABELS.disclosure,
    status: uiStatus,
    statusLabel: labels[status] ?? "In progress",
    enumValue: status,
  };
}

function buildProvenanceTile(
  status: ProvenanceStatus,
  labels: Record<string, string>,
  legalMode = false,
): EngineTile {
  const uiStatus: EngineStatus =
    status === "PROVENANCE_EMBEDDED"
      ? "embedded"
      : status === "PROVENANCE_EMBEDDING"
        ? "in-progress"
        : status === "PROVENANCE_EMBED_FAILED"
          ? legalMode ? "flagged-reviewed" : "action-required"
          : status === "PROVENANCE_EMBED_FAILED_ACKNOWLEDGED"
            ? "embedded"
          : status === "MANIFEST_TAMPERED_FLAGGED"
            ? "flagged-reviewed"
            : "not-started";
  return {
    name: ENGINE_LABELS.provenance,
    status: uiStatus,
    statusLabel: labels[status] ?? "Not started",
    enumValue: status,
  };
}

function buildBrandTile(
  status: BrandStatus,
  labels: Record<string, string>,
): EngineTile {
  const uiStatus: EngineStatus =
    status === "BRAND_SUITABILITY_CLEAR"
      ? "clear"
      : status === "BRAND_SUITABILITY_FLAGGED_REVIEWED"
        ? "flagged-reviewed"
        : status === "BRAND_SUITABILITY_BLOCKED"
          ? "action-required"
          : status === "BRAND_SUITABILITY_LEGAL_APPROVED"
            ? "clear"
            : status === "BRAND_SUITABILITY_ASSET_WITHDRAWN"
              ? "locked"
              : "not-started";

  return {
    name: ENGINE_LABELS.brand_suitability,
    status: uiStatus,
    statusLabel: labels[status] ?? "Not started",
    enumValue: status,
  };
}

function subtitleFor(state: PreFlightState): string {
  if (state === "SYSTEM_ERROR_POLICY_UNAVAILABLE") {
    return ENGINE_PANEL_COPY.systemErrorSubtitle;
  }
  if (state === "ALLOW") {
    return ENGINE_PANEL_COPY.allClearSubtitle;
  }
  if (state === "ALLOW_WITH_WARNINGS") {
    return ENGINE_PANEL_COPY.allTerminalSubtitle;
  }
  if (state === "APPROVED_PENDING_PROOF" || state === "PUBLISH_CLEARED") {
    return ENGINE_PANEL_COPY.allTerminalSubtitle;
  }
  return "";
}

function bottomStripFor(
  state: PreFlightState,
  engines: EngineStatuses,
): EngineStatusStrip | undefined {
  if (state === "DISCLOSURE_CHALLENGE_PENDING") {
    return {
      tone: "challenge",
      icon: "info",
      text: ENGINE_PANEL_COPY.challengeStrip,
    };
  }
  if (state === "ALLOW_WITH_WARNINGS" && areAllEnginesTerminal(engines)) {
    return {
      tone: "success",
      icon: "check",
      text: ENGINE_PANEL_COPY.allTerminalStrip,
    };
  }
  if (state === "ALLOW" && areAllEnginesTerminal(engines)) {
    return {
      tone: "success",
      icon: "check",
      text: ENGINE_PANEL_COPY.allClearStrip,
    };
  }
  return undefined;
}
