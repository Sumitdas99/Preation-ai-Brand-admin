import type { Asset } from "@/api/schemas/asset";
import type { ViewerRole } from "@/components/preflight/viewerRole";
import type { DisclosureTopBar } from "@/components/disclosure/types";
import { TOP_BAR_COPY } from "../copy";

export function toTopBar(
  asset: Asset | undefined,
  role: ViewerRole,
): DisclosureTopBar {
  const trail = [...TOP_BAR_COPY.trailPrefix];
  if (asset?.file_name) trail.push(asset.file_name);
  trail.push("Disclosure Specification");
  return {
    trail,
    workspace: TOP_BAR_COPY.workspaceLabel,
    role,
    coverageLabels: [...TOP_BAR_COPY.coverageLabels],
  };
}
