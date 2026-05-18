import type {
  HumanPresenceConsentTypeOption,
  RplConsentTypeOption,
} from "@/api/schemas/consent";
import type {
  HumanPresenceConsentOptionVM,
  RplPathOptionVM,
} from "@/components/consent/types";

export const RPL_PATH_OPTIONS: RplPathOptionVM[] = [
  {
    id: "A",
    label: "We hold consent and have a document to upload now",
    description:
      "Consent documentation exists and is ready to attach. Upload the document below to proceed to the Disclosure Specification Form.",
    tone: "success",
  },
  {
    id: "B",
    label: "Consent is currently being arranged",
    description:
      "Consent agreement is underway but not yet signed. Asset remains on hold until the document is uploaded. A mandatory timeline note is required.",
    tone: "amber",
  },
  {
    id: "C",
    label: "We do not hold consent and cannot obtain it",
    description:
      "No consent exists and none is being sought. This triggers an immediate hard block and escalates the asset to Legal. The asset cannot proceed without Legal intervention. This declaration is permanent and recorded in the audit trail. Legal and Admin are notified immediately.",
    tone: "danger",
  },
];

export const RPL_CONSENT_TYPE_OPTIONS: Array<{
  value: RplConsentTypeOption;
  label: string;
}> = [
  { value: "TALENT_AGREEMENT", label: "Talent agreement" },
  { value: "LICENSING_CONTRACT", label: "Licensing contract" },
  { value: "MODEL_RELEASE", label: "Model release" },
  {
    value: "WRITTEN_AUTH_FROM_MGMT",
    label: "Written authorisation from management",
  },
  { value: "OTHER", label: "Other (specify)" },
];

export const HUMAN_PRESENCE_CONSENT_TYPE_OPTIONS: HumanPresenceConsentOptionVM[] =
  [
    {
      value: "WRITTEN_RELEASE",
      label: "Written release / model release agreement on file",
    },
    {
      value: "VERBAL_DOCUMENTED",
      label: "Verbal consent obtained and documented internally",
    },
    {
      value: "EMPLOYEE_CONTRACT",
      label:
        "Individuals are employees who have consented as part of employment contract",
    },
    {
      value: "UGC_PUBLIC_PERMISSION",
      label:
        "Content is user-generated content shared publicly with explicit permission to repurpose commercially",
      triggersUgcNotice: true,
    },
    {
      value: "LICENSED_STOCK",
      label:
        "Individuals are part of a licensed stock asset with commercial usage rights",
    },
    {
      value: "OTHER",
      label: "Other, please specify in the notes field below",
      requiresNotes: true,
    },
  ];

export function rplConsentTypeLabel(
  value?: RplConsentTypeOption,
): string | undefined {
  if (!value) return undefined;
  return RPL_CONSENT_TYPE_OPTIONS.find((o) => o.value === value)?.label;
}

export function humanPresenceConsentTypeLabel(
  value?: HumanPresenceConsentTypeOption,
): string | undefined {
  if (!value) return undefined;
  return HUMAN_PRESENCE_CONSENT_TYPE_OPTIONS.find((o) => o.value === value)
    ?.label;
}
