import type { Asset } from "@/api/schemas/asset";
import type { PreflightStatusResponse } from "@/api/schemas/preflight";
import type {
  EvidencePackPanel,
  PreFlightState,
} from "@/components/preflight/types";

export function toEvidencePackPanel(
  preflight: PreflightStatusResponse,
  asset: Asset,
  state: PreFlightState,
): EvidencePackPanel | undefined {
  if (state !== "PUBLISH_CLEARED") return undefined;
  const pack = preflight.evidence_pack;
  if (!pack) return undefined;

  const att = preflight.legal_attestation;

  return {
    sectionTitle: "Evidence Pack",
    documentTitle: `Evidence Pack for ${asset.file_name}`,
    documentSubtitle: buildSubtitle(pack.generated_at),
    metaFields: [
      { label: "Pack ID", value: pack.evidence_pack_id },
      {
        label: "SHA-256 checksum",
        value: pack.hash ? stripSha256Prefix(pack.hash) : "—",
      },
      {
        label: "Attested by",
        value: att
          ? `${att.approver_name}${att.approver_role ? `, ${shortRole(att.approver_role)}` : ""}`
          : "—",
      },
    ],
    footerText:
      "Download link expires in 15 minutes. Each download is recorded in the audit trail.",
    downloadLabel: "Download Evidence Pack PDF",
    downloadUrl: pack.download_url,
    packId: pack.evidence_pack_id,
  };
}

function buildSubtitle(generatedAt: string | undefined): string {
  if (!generatedAt) return "Generated automatically";
  return `Generated ${formatGeneratedAt(generatedAt)} · 8 sections`;
}

function formatGeneratedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const day = date.getUTCDate();
  const month = date.toLocaleString("en-GB", {
    month: "short",
    timeZone: "UTC",
  });
  const year = date.getUTCFullYear();
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  return `${day} ${month} ${year} at ${hh}:${mm} UTC`;
}

function stripSha256Prefix(hash: string): string {
  return hash.startsWith("sha256:") ? hash.slice(7) : hash;
}

function shortRole(role: string): string {
  if (role.toLowerCase().includes("legal")) return "Legal";
  return role;
}
