import type { Asset } from "@/api/schemas/asset";
import type { TopBar } from "@/components/preflight/types";
import type { ViewerRole } from "@/components/preflight/viewerRole";
import { TOP_BAR_COPY } from "../copy";

export function toTopBar(asset: Asset, role: ViewerRole = "Reviewer"): TopBar {
  const trail =
    role === "Legal"
      ? ["Legal Queue", asset.file_name, "Pre-Flight Review"]
      : [...TOP_BAR_COPY.trailPrefix, asset.file_name];
  return {
    trail,
    workspace: TOP_BAR_COPY.workspaceLabel(asset.workspace_id ?? ""),
  };
}
