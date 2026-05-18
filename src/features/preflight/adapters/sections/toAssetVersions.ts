import type { Asset } from "@/api/schemas/asset";
import type { PreflightStatusResponse } from "@/api/schemas/preflight";
import type {
  AssetVersions,
  PreFlightState,
} from "@/components/preflight/types";
import type { ViewerRole } from "@/components/preflight/viewerRole";

const STATES_WITHOUT_VERSIONS: readonly PreFlightState[] = [
  "EVALUATION_IN_PROGRESS",
  "SYSTEM_ERROR_POLICY_UNAVAILABLE",
  "APPROVED_PENDING_PROOF",
  "PUBLISH_CLEARED",
];

export function toAssetVersions(
  asset: Asset,
  preflight: PreflightStatusResponse,
  role: ViewerRole,
  state: PreFlightState,
): AssetVersions | undefined {
  if (STATES_WITHOUT_VERSIONS.includes(state)) return undefined;

  const original = asset.versions.find((v) => v.kind === "ORIGINAL");
  const c2pa = asset.versions.find((v) => v.kind === "C2PA_EMBEDDED");
  if (!original && !c2pa) return undefined;

  const provenanceStatus = preflight.engine_statuses?.provenance;
  const isEmbedded =
    c2pa?.embed_status === "EMBEDDED" || provenanceStatus === "PROVENANCE_EMBEDDED";
  const isEmbedding =
    c2pa?.embed_status === "EMBEDDING" || provenanceStatus === "PROVENANCE_EMBEDDING";

  const embedStatus = isEmbedded ? "embedded" : "embedding";
  const embedStatusLabel = isEmbedded
    ? ""
    : isEmbedding
      ? "Embedding in progress…"
      : "Not started";

  const governanceLabel = isEmbedded ? "C2PA embedded" : "C2PA embedding in progress";
  const governanceFileName =
    role === "Reviewer"
      ? undefined
      : (c2pa?.file_name ?? undefined);

  const provenanceNote = isEmbedded
    ? undefined
    : "Both versions will be independently verifiable and clearly labelled once complete.";

  return {
    originalLabel: "Original",
    originalFileName: original?.file_name ?? asset.file_name,
    governanceLabel,
    governanceFileName,
    embedStatus,
    embedStatusLabel,
    provenanceNote,
  };
}

function formatTime(iso?: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString();
}
