import type {
  DisclosurePlacementType,
  DisclosureScope,
  DisclosureSpec,
} from "@/api/schemas/disclosure";
import type { PreflightStatusResponse } from "@/api/schemas/preflight";
import type {
  ComplianceCheckItem,
  ComplianceChecksList,
  PreFlightState,
} from "@/components/preflight/types";

export function toComplianceChecksList(
  preflight: PreflightStatusResponse,
  disclosure: DisclosureSpec | undefined,
  state: PreFlightState,
): ComplianceChecksList | undefined {
  if (state !== "PUBLISH_CLEARED") return undefined;

  const items: ComplianceCheckItem[] = [
    {
      title: "AI disclosure specification locked & proof uploaded",
      description: buildDisclosureDescription(preflight, disclosure),
    },
    {
      title: "C2PA provenance embedded",
      description:
        "C2PA-embedded version available for download from the Asset Library.",
    },
    {
      title: "Brand suitability clear across all categories",
      description:
        "All moderation categories are below the flagging threshold. No flagged items.",
    },
    {
      title: "Legal attestation complete",
      description: buildAttestationDescription(preflight),
    },
    {
      title: "Evidence Pack PDF generated",
      description:
        "Generated automatically and stored as an immutable record.",
    },
  ];

  return {
    header: "All compliance checks",
    items,
  };
}

function buildDisclosureDescription(
  _preflight: PreflightStatusResponse,
  disclosure: DisclosureSpec | undefined,
): string {
  const placement = formatPlacement(disclosure?.placement_type);
  const scope = formatScope(disclosure?.scope);

  const parts: string[] = [];
  if (placement) parts.push(`Placement: ${placement}`);
  if (scope) parts.push(`Scope: ${scope}`);

  return parts.length > 0
    ? parts.join(" · ")
    : "Disclosure specification locked and proof confirmed.";
}

function formatPlacement(
  placement: DisclosurePlacementType | undefined,
): string | undefined {
  if (!placement) return undefined;
  switch (placement) {
    case "ON_ASSET":
      return "On asset";
    case "CAPTION_ONLY":
      return "Caption only";
    case "BOTH":
      return "On asset & caption";
    case "EXTERNAL_IMPLEMENTATION":
      return "External implementation";
    default:
      return placement;
  }
}

function formatScope(scope: DisclosureScope | undefined): string | undefined {
  if (!scope) return undefined;
  return scope === "FULL" ? "Full" : "Partial";
}

function buildAttestationDescription(
  preflight: PreflightStatusResponse,
): string {
  const att = preflight.legal_attestation;
  if (!att) return "Legal attestation recorded.";
  const approver = `${att.approver_name}${att.approver_role ? `, ${shortRole(att.approver_role)}` : ""}`;
  const when = formatAttestedAt(att.attested_at);
  return when ? `${approver} · ${when}` : approver;
}

function formatAttestedAt(iso: string): string {
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

function shortRole(role: string): string {
  if (role.toLowerCase().includes("legal")) return "Legal Approver";
  return role;
}
