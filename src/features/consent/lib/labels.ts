import type {
  HumanPresenceStatus,
  RplConsentStatus,
} from "@/api/schemas/consent";

export function rplStatusLabel(
  status: RplConsentStatus | undefined,
  pending = false,
): string {
  if (pending) return "Consent pending";
  switch (status) {
    case "RPL_CONSENT_REQUIRED":
      return "Awaiting consent";
    case "RPL_CONSENT_PENDING":
      return "Consent pending";
    case "RPL_CONSENT_ATTACHED":
      return "Consent attached";
    case "RPL_NO_CONSENT_BLOCK":
      return "Escalated to Legal";
    case "NOT_APPLICABLE":
      return "Not applicable";
    default:
      return "Awaiting consent";
  }
}

export function humanPresenceStatusLabel(
  status: HumanPresenceStatus | undefined,
): string {
  switch (status) {
    case "HUMAN_PRESENCE_REQUIRED":
      return "Awaiting declaration";
    case "HUMAN_PRESENCE_DECLARED":
      return "Declaration submitted";
    case "NOT_APPLICABLE":
      return "Not applicable";
    default:
      return "Awaiting declaration";
  }
}

export function formatSubmittedAt(iso?: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function shortHash(hash?: string): string {
  if (!hash) return "—";
  const [scheme, hex] = hash.includes(":") ? hash.split(":") : ["", hash];
  if (!hex || hex.length <= 16) return hash;
  const prefix = scheme ? `${scheme}:` : "";
  return `${prefix}${hex.slice(0, 8)}…${hex.slice(-4)}`;
}
