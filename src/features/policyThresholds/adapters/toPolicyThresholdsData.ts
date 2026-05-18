import type {
  PolicyPresetsResponse,
  ProvenanceSummary,
  WorkspaceSettings,
} from "@/api/schemas/policyThresholds";
import type { PolicyThresholdsPageData } from "@/components/policyThresholds/types";

export function toPolicyThresholdsData(
  settings: WorkspaceSettings,
  presets: PolicyPresetsResponse,
  provenanceSummary?: ProvenanceSummary,
): PolicyThresholdsPageData {
  return {
    workspaceId: settings.workspace_id,
    workspaceName: settings.workspace_name,
    viewerRole: settings.viewer_role,
    activeGeoPreset: settings.geo_preset,
    provenanceEmbedOnHumanGenerated:
      settings.provenance_embed_on_human_generated ?? true,
    thresholdRows: settings.threshold_rows,
    presets: presets.items,
    provenanceSummary,
  };
}
