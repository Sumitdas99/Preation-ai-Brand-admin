import type { PreflightStatusResponse } from "@/api/schemas/preflight";
import type {
  LegalApprovalRecord,
  PreFlightState,
} from "@/components/preflight/types";

export function toLegalApprovalRecord(
  preflight: PreflightStatusResponse,
  state: PreFlightState,
): LegalApprovalRecord | undefined {
  if (state !== "APPROVED_PENDING_PROOF") return undefined;
  const att = preflight.legal_attestation;
  if (!att) return undefined;

  return {
    title: "Approved & Attested by Legal",
    fields: [
      {
        label: "Approver",
        value: formatApprover(att.approver_name, att.approver_role),
      },
      { label: "Attested at", value: formatAttestedAt(att.attested_at) },
      { label: "Attestation ID", value: att.attestation_id },
    ],
  };
}

function formatApprover(name: string, role?: string): string {
  if (!role) return name;
  const cleanRole = role.replace(/\s*\/\s*/g, " ").replace(/\s+/g, " ").trim();
  return `${name}, ${cleanRole}`;
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
