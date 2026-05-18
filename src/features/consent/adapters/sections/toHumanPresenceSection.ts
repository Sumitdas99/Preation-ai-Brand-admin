import type { ConsentSpec } from "@/api/schemas/consent";
import type { HumanPresenceSectionVM } from "@/components/consent/types";
import { humanPresenceStatusLabel } from "../../lib/labels";
import { HUMAN_PRESENCE_CONSENT_TYPE_OPTIONS } from "../copy";

export function toHumanPresenceSection(
  spec: ConsentSpec,
): HumanPresenceSectionVM {
  const visible = spec.triggers.includes("TRIGGER_HUMAN_PRESENCE");
  const section = spec.human_presence_section;
  const status = section?.status ?? "NOT_APPLICABLE";
  const submitted = section?.submission;
  const estimated = section?.estimated_person_count ?? 0;
  const locked = status === "HUMAN_PRESENCE_DECLARED";

  return {
    visible,
    title: "Human presence declaration",
    statusPills: [humanPresenceStatusLabel(status)],
    actionRequiredPill: "Action required",
    alertTitle: "Human presence detected",
    alertBody:
      "This asset contains images of one or more people who could not be automatically identified. Before this asset can proceed, you must confirm your authorisation to use their likeness in promotional material.",
    countLabel: `Approximately ${estimated} unique ${
      estimated === 1 ? "individual" : "individuals"
    } detected in this asset.`,
    countCorrectionNote:
      "Correct this number if inaccurate. Your confirmed count is recorded in the audit trail.",
    estimatedPersonCount: estimated,
    consentTypeLabel: "Consent type",
    consentTypeOptions: HUMAN_PRESENCE_CONSENT_TYPE_OPTIONS,
    ugcNotice:
      "Content being publicly shared on social media does not automatically grant rights for commercial use or promotional purposes. Please ensure you hold an explicit UGC rights agreement or written permission from the content creator before proceeding. This declaration will be recorded in the audit trail.",
    notesLabel: "Notes",
    notesHelper: "Required when 'Other' is selected; optional otherwise.",
    notesPlaceholder:
      "Additional context about consent arrangements for the individuals in this asset.",
    declarationText:
      "I confirm that [Organisation Name] has obtained valid permission from all individuals visually represented in this asset to use their likeness for the purposes of this campaign and its intended distribution channels.",
    submitLabel: "Submit presence declaration",
    status,
    submitted,
    locked,
    pendingHeading: "Presence declaration required",
    pendingBody:
      "Confirm the count, select a consent type, and tick the declaration to continue.",
    readyHeading: "Ready to submit declaration",
    readyBody:
      "Your presence count, consent type, and declaration are complete.",
  };
}
