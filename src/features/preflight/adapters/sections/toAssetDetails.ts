import type { Asset } from "@/api/schemas/asset";
import type { PreflightStatusResponse } from "@/api/schemas/preflight";
import type {
  AssetDetails,
  PreFlightState,
  VideoThumbnail,
} from "@/components/preflight/types";
import type { DisclosureSpec } from "@/api/schemas/disclosure";

export function toAssetDetails(
  asset: Asset,
  preflight: PreflightStatusResponse,
  state: PreFlightState,
  disclosure: DisclosureSpec | undefined,
): AssetDetails {
  if (state === "APPROVED_PENDING_PROOF" || state === "PUBLISH_CLEARED") {
    return { rows: buildAttestedRows(asset, preflight) };
  }

  const rows: AssetDetails["rows"] = [
    { label: "File name", value: truncate(asset.file_name) },
    { label: "File size", value: formatSize(asset.file_size_bytes) },
    {
      label: "Modality",
      value:
        asset.modality === "VIDEO"
          ? "Video (MP4)"
          : asset.modality === "IMAGE"
            ? "Image"
            : asset.modality === "AUDIO"
              ? "Audio"
              : String(asset.modality),
    },
    { label: "Uploaded", value: formatDateTime(asset.uploaded_at) },
  ];

  if (preflight.started_at) {
    rows.push({
      label: "Pre-flight started",
      value: formatTime(preflight.started_at),
    });
  }

  if (state === "EVALUATION_IN_PROGRESS") {
    rows.push({
      label: "Estimated completion",
      value: "~45 sec",
      emphasis: "amber",
    });
  } else if (state === "SYSTEM_ERROR_POLICY_UNAVAILABLE") {
    if (preflight.completed_at) {
      rows.push({
        label: "Error detected",
        value: formatTime(preflight.completed_at),
        emphasis: "amber",
      });
    }
  } else if (preflight.completed_at) {
    rows.push({ label: "Completed", value: formatTime(preflight.completed_at) });
  }

  if (state === "DISCLOSURE_CHALLENGE_PENDING" && disclosure?.challenge?.submitted_at) {
    rows.push({
      label: "Challenge submitted",
      value: formatTime(disclosure.challenge.submitted_at),
      emphasis: "purple",
    });
  }

  return { rows };
}

function buildAttestedRows(
  asset: Asset,
  preflight: PreflightStatusResponse,
): AssetDetails["rows"] {
  const att = preflight.legal_attestation;
  const approver = att
    ? `${att.approver_name}${att.approver_role ? ` (${shortRole(att.approver_role)})` : ""}`
    : "—";
  const attestedAt = att ? formatShortDateTime(att.attested_at) : "—";

  return [
    { label: "File", value: truncate(asset.file_name, 18) },
    {
      label: "Modality",
      value:
        asset.modality === "VIDEO"
          ? "Video"
          : asset.modality === "IMAGE"
            ? "Image"
            : asset.modality === "AUDIO"
              ? "Audio"
              : String(asset.modality),
    },
    { label: "Approved by", value: approver },
    { label: "Approved at", value: attestedAt },
  ];
}

function shortRole(role: string): string {
  if (role.toLowerCase().includes("legal")) return "Legal";
  return role;
}

function formatShortDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const day = date.getUTCDate();
  const month = date.toLocaleString("en-GB", {
    month: "short",
    timeZone: "UTC",
  });
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  return `${day} ${month}, ${hh}:${mm}`;
}

export function toVideoThumbnail(asset: Asset): VideoThumbnail {
  return {
    modalityLabel:
      asset.modality === "VIDEO"
        ? "VIDEO"
        : asset.modality === "IMAGE"
          ? "IMAGE"
          : asset.modality === "AUDIO"
            ? "AUDIO"
            : String(asset.modality),
    durationLabel: formatDuration(asset.duration_seconds),
  };
}

function formatDuration(seconds?: number): string {
  if (!seconds || !Number.isFinite(seconds)) return "—";
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

function formatSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "—";
  const mb = bytes / 1_000_000;
  if (mb < 1) return `${(bytes / 1_000).toFixed(1)} KB`;
  return `${mb.toFixed(1)} MB`;
}

function truncate(value: string, max = 24): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toISOString().slice(11, 19);
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const d = date.toISOString().slice(0, 10);
  const t = date.toISOString().slice(11, 16);
  return `${d}, ${t}`;
}
