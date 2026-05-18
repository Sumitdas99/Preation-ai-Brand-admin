import type { ConsentSpec, RplIdentity } from "@/api/schemas/consent";
import type { CandidateVM, RplSectionVM } from "@/components/consent/types";
import { RPL_CONSENT_TYPE_OPTIONS, RPL_PATH_OPTIONS } from "../copy";

export function toRplSection(spec: ConsentSpec): RplSectionVM {
  const visible = spec.triggers.includes("TRIGGER_RPL_CONSENT_REQUIRED");
  const section = spec.rpl_section;
  const status = section?.status ?? "NOT_APPLICABLE";
  const submitted = section?.submission;
  const selectedPath = submitted?.consent_path;
  const locked =
    status === "RPL_CONSENT_ATTACHED" ||
    status === "RPL_NO_CONSENT_BLOCK";

  return {
    visible,
    title: "RPL / celebrity consent attachment",
    statusPills: [],
    actionRequiredPill: "Action required",
    candidatesHeader: "Detected celebrity candidates",
    candidatesNote: "",
    candidates: (section?.rpl_identities_snapshot ?? []).map(toCandidate),
    pathOptions: RPL_PATH_OPTIONS,
    selectedPath,
    status,
    submitted,
    locked,
    consentTypeOptions: RPL_CONSENT_TYPE_OPTIONS,
    pathACopy: {
      step2Heading: "Step 2 — Upload consent document",
      uploadLabel: "Consent document upload",
      uploadHint: "Accepts PDF or DOCX files up to 25 MB.",
      consentTypeLabel: "Consent type",
      descriptionLabel: "Consent document description",
      descriptionPlaceholder: "e.g. Signed talent agreement dated 10 Apr 2026.",
      declarationText:
        "I confirm that [Organisation] holds valid consent from the identified individual(s) for use of their likeness in this asset for the intended campaign and distribution channels.",
      submitLabel: "Attach consent & confirm",
      pendingHeading: "Consent document required",
      pendingBody:
        "Upload a consent document and confirm the declaration to continue.",
      readyHeading: "Ready to submit",
      readyBody: "Your consent document and declaration are complete.",
    },
    pathBCopy: {
      step2Heading: "Step 2 — Provide a timeline note",
      holdNotice:
        "This asset will remain on hold. It cannot proceed to the disclosure specification step until a consent document is uploaded. Return to this screen and switch to the upload option when the document is available.",
      timelineLabel: "Timeline note",
      timelineHelper: "Minimum 20 characters.",
      timelinePlaceholder: "Describe the current status and expected timeline…",
      declarationText:
        "I confirm that consent is actively being arranged and that I will return to upload the signed consent document before this asset is published or submitted for final approval.",
      submitLabel: "Declare consent pending",
      minChars: 20,
      pendingHeading: "Timeline note required",
      pendingBody:
        "Add a timeline note and confirm the declaration to continue.",
      readyHeading: "Ready to declare consent pending",
      readyBody: "Your timeline note and declaration are complete.",
    },
    pathCCopy: {
      step2Heading: "Step 2 — Confirm the hard block",
      warningTitle: "Submitting this form will trigger an immediate hard block",
      warningBody:
        "The asset will be escalated to Legal immediately and cannot proceed through any part of the compliance pipeline until Legal approves a path forward. You will lose all action capability on this asset.",
      reasonLabel: "Reason",
      reasonHelper:
        "Surfaced to Legal alongside the detection results. Be specific so they can make an informed decision. Minimum 30 characters.",
      reasonPlaceholder: "Describe the situation for Legal review…",
      declarationText:
        "I confirm that [Organisation] does not hold and cannot obtain consent for the identified individual(s) for use of their likeness in this asset. I understand that submitting this declaration will immediately escalate this asset to Legal, and that this declaration is permanently recorded in the audit log and cannot be removed or edited.",
      submitLabel: "Confirm and escalate to Legal",
      minChars: 30,
      pendingHeading: "Escalation reason required",
      pendingBody:
        "Add a reason and confirm the declaration to escalate this asset.",
      readyHeading: "Ready to escalate to Legal",
      readyBody:
        "Legal and Admin will be notified immediately. You will lose action capability on this asset.",
    },
  };
}

function toCandidate(c: RplIdentity): CandidateVM {
  const pct = Math.round(c.match_probability * 100);
  return {
    identity_id: c.identity_id,
    name: c.name,
    initials: toInitials(c.name),
    matchPercent: `${pct}% match probability`,
    peakFrame: formatPeakFrame(c.peak_frame_timecode, c.peak_frame_ms),
    source: c.source,
  };
}

function toInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatPeakFrame(
  timecode: string | undefined,
  ms: number | undefined,
): string | undefined {
  if (!timecode && ms === undefined) return undefined;
  const tc = timecode ?? msToTimecode(ms ?? 0);
  if (ms === undefined) return `Peak frame: ${tc}`;
  return `Peak frame: ${tc} (${ms.toLocaleString()}ms)`;
}

function msToTimecode(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

