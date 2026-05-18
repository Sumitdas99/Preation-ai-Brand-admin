import type { PreflightStatusResponse } from "@/api/schemas/preflight";
import type { SystemErrorDetails } from "@/components/preflight/types";

export function toSystemErrorDetails(
  preflight: PreflightStatusResponse,
): SystemErrorDetails | undefined {
  const blockingReason =
    preflight.blocking_reason ?? preflight.policy_decision?.blocking_reason;
  if (blockingReason !== "SYSTEM_ERROR_POLICY_UNAVAILABLE") return undefined;

  const incidentId =
    preflight.incident_id ?? preflight.policy_decision?.incident_id;

  return {
    blocks: [
      {
        label: "ERROR TYPE",
        value: "SYSTEM_ERROR_POLICY_UNAVAILABLE",
        tone: "warning",
      },
      {
        label: "CAUSE",
        value: "Policy pack load failed — retries exhausted.",
        tone: "warning",
      },
      {
        label: "REPORTING",
        value: "System metric only. Not a content violation.",
        tone: "muted",
      },
      {
        label: "TEAM NOTIFIED",
        value: incidentId
          ? `Automated alert sent to Praetion AI ops team. Incident ID: ${incidentId}`
          : "Automated alert sent to Praetion AI ops team.",
        tone: "success",
      },
    ],
  };
}
