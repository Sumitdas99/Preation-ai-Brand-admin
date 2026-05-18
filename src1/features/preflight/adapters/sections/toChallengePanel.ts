import type { DisclosureSpec } from "@/api/schemas/disclosure";
import type { PreflightStatusResponse } from "@/api/schemas/preflight";
import type {
  ChallengePanelData,
  ChallengeSummaryRow,
  PreFlightState,
} from "@/components/preflight/types";
import type { ViewerRole } from "@/components/preflight/viewerRole";
import { CHALLENGE_PANEL_COPY } from "../copy";
import { CHALLENGE_JUSTIFICATION_MIN_LENGTH } from "@/features/preflight/forms/challengeFormSchema";

export interface ChallengePanelContext {
  state: PreFlightState;
  role: ViewerRole;
  preflight: PreflightStatusResponse;
  disclosure?: DisclosureSpec;
  challengeAlreadySubmitted: boolean;
}

export function toChallengePanel(
  ctx: ChallengePanelContext,
): ChallengePanelData | undefined {
  if (ctx.state !== "BLOCK_UNTIL_REMEDIATED") return undefined;
  if (ctx.role !== "Reviewer") return undefined;
  if (ctx.challengeAlreadySubmitted) return undefined;
  if (ctx.disclosure?.status === "DISCLOSURE_CHALLENGE_PENDING") return undefined;
  if (!isSyntheticDetected(ctx.preflight)) return undefined;

  return {
    visible: true,
    summaryHeader: CHALLENGE_PANEL_COPY.summaryHeader,
    justificationLabel: CHALLENGE_PANEL_COPY.justificationLabel,
    justificationPlaceholder: CHALLENGE_PANEL_COPY.justificationPlaceholder,
    declarationLabel: CHALLENGE_PANEL_COPY.declarationLabel,
    footerNoteReady: CHALLENGE_PANEL_COPY.footerNoteReady,
    footerNoteBlocked: CHALLENGE_PANEL_COPY.footerNoteBlocked(
      CHALLENGE_JUSTIFICATION_MIN_LENGTH,
    ),
    submitLabel: CHALLENGE_PANEL_COPY.submitLabel,
    summaryRows: buildSummaryRows(ctx.disclosure),
    minJustificationLength: CHALLENGE_JUSTIFICATION_MIN_LENGTH,
  };
}

export function isSyntheticDetected(
  preflight: PreflightStatusResponse,
): boolean {
  const synthetic = preflight.detection_scores?.synthetic;
  if (!synthetic) return false;
  if (synthetic.evaluation_status !== "COMPLETE") return false;
  return (
    synthetic.confidence_band === "BLOCK_BAND" ||
    synthetic.confidence_band === "FLAG_BAND"
  );
}

function buildSummaryRows(disclosure?: DisclosureSpec): ChallengeSummaryRow[] {
  const rows = disclosure?.requirement?.detection_summary ?? [];
  return rows.map((row) => ({
    key: row.key,
    label: row.label,
    value: row.value,
    score: row.score,
    band: row.band,
  }));
}
