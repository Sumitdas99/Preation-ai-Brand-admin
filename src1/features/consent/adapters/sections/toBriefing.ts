import type { ConsentSpec } from "@/api/schemas/consent";
import type { BriefingVM } from "@/components/consent/types";

export function toBriefing(spec: ConsentSpec): BriefingVM {
  const rplFired = spec.triggers.includes("TRIGGER_RPL_CONSENT_REQUIRED");
  const hpFired = spec.triggers.includes("TRIGGER_HUMAN_PRESENCE");
  const visible = rplFired || hpFired;

  const triggerEntries: BriefingVM["triggers"] = [];
  if (rplFired) {
    const count = spec.rpl_section?.rpl_identities_snapshot.length ?? 0;
    triggerEntries.push({
      code: "TRIGGER_RPL_CONSENT_REQUIRED",
      description:
        count === 1
          ? "Recognised individual detected"
          : `${count} recognised individuals detected`,
    });
  }
  if (hpFired) {
    triggerEntries.push({
      code: "TRIGGER_HUMAN_PRESENCE",
      description: "Human presence detected",
    });
  }

  const triggerCount = triggerEntries.length;
  const body =
    triggerCount === 2
      ? "Two consent-related checks have been triggered for this asset. Each section must be completed and submitted independently before the Disclosure Specification can proceed."
      : "A consent-related check has been triggered for this asset. Complete the section below before the Disclosure Specification can proceed.";

  return {
    visible,
    title: "Consent & presence confirmation required",
    body,
    triggers: triggerEntries,
  };
}
