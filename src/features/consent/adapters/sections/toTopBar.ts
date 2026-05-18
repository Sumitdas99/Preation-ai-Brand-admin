import type { ConsentSpec } from "@/api/schemas/consent";
import type { ConsentTopBarVM } from "@/components/consent/types";

interface Args {
  spec: ConsentSpec;
  role: "Reviewer" | "Legal";
}

export function toTopBar({ spec, role }: Args): ConsentTopBarVM {
  return {
    trail: [
      "Asset Library",
      spec.asset_filename ?? spec.asset_id,
      "Consent & Presence",
    ],
    workspace: spec.workspace_label ?? "Workspace",
    role,
  };
}
