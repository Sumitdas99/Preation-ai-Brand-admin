import type {
  GeoPresetId,
  PolicyPreset,
  ProvenanceSummary,
  ThresholdRow,
  WorkspaceSettings,
} from "@/api/schemas/policyThresholds";

export type PolicyThresholdTabId =
  | "per-category"
  | "geo-preset"
  | "provenance";

export interface PolicyThresholdTab {
  id: PolicyThresholdTabId;
  label: string;
  isNew?: boolean;
}

export interface PolicyThresholdsPageData {
  workspaceId: string;
  workspaceName: string;
  viewerRole: string;
  activeGeoPreset: GeoPresetId;
  provenanceEmbedOnHumanGenerated: boolean;
  thresholdRows: ThresholdRow[];
  presets: PolicyPreset[];
  provenanceSummary?: ProvenanceSummary;
}

export type { WorkspaceSettings };
