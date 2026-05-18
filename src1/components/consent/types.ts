import type {
  ConsentPath,
  HumanPresenceConsentTypeOption,
  HumanPresenceStatus,
  HumanPresenceSubmissionRecord,
  RplConsentStatus,
  RplConsentTypeOption,
  RplIdentity,
  RplSubmissionRecord,
} from "@/api/schemas/consent";

export interface ConsentTopBarVM {
  trail: string[];
  workspace: string;
  role: "Reviewer" | "Legal";
  pathChip?: string;
}

export interface BriefingVM {
  visible: boolean;
  title: string;
  body: string;
  note: string;
  triggers: Array<{
    code: string;
    description: string;
  }>;
}

export interface CandidateVM {
  identity_id: string;
  name: string;
  initials: string;
  matchPercent: string;
  peakFrame?: string;
  source?: string;
}

export interface RplPathOptionVM {
  id: ConsentPath;
  label: string;
  description: string;
  tone: "success" | "amber" | "danger";
}

export interface RplSectionVM {
  visible: boolean;
  title: string;
  statusPills: string[];
  actionRequiredPill: string;
  candidatesHeader: string;
  candidatesNote: string;
  candidates: CandidateVM[];
  pathOptions: RplPathOptionVM[];
  selectedPath?: ConsentPath;
  status: RplConsentStatus;
  submitted?: RplSubmissionRecord;
  locked: boolean;
  consentTypeOptions: Array<{ value: RplConsentTypeOption; label: string }>;
  pathACopy: {
    step2Heading: string;
    uploadLabel: string;
    uploadHint: string;
    consentTypeLabel: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    declarationText: string;
    submitLabel: string;
    pendingHeading: string;
    pendingBody: string;
    readyHeading: string;
    readyBody: string;
  };
  pathBCopy: {
    step2Heading: string;
    holdNotice: string;
    timelineLabel: string;
    timelineHelper: string;
    timelinePlaceholder: string;
    declarationText: string;
    submitLabel: string;
    minChars: number;
    pendingHeading: string;
    pendingBody: string;
    readyHeading: string;
    readyBody: string;
  };
  pathCCopy: {
    step2Heading: string;
    warningTitle: string;
    warningBody: string;
    reasonLabel: string;
    reasonHelper: string;
    reasonPlaceholder: string;
    declarationText: string;
    submitLabel: string;
    minChars: number;
    pendingHeading: string;
    pendingBody: string;
    readyHeading: string;
    readyBody: string;
  };
}

export interface HumanPresenceConsentOptionVM {
  value: HumanPresenceConsentTypeOption;
  label: string;
  triggersUgcNotice?: boolean;
  requiresNotes?: boolean;
}

export interface HumanPresenceSectionVM {
  visible: boolean;
  title: string;
  statusPills: string[];
  actionRequiredPill: string;
  alertTitle: string;
  alertBody: string;
  countLabel: string;
  countCorrectionNote: string;
  estimatedPersonCount: number;
  consentTypeLabel: string;
  consentTypeOptions: HumanPresenceConsentOptionVM[];
  ugcNotice: string;
  notesLabel: string;
  notesHelper: string;
  notesPlaceholder: string;
  declarationText: string;
  submitLabel: string;
  status: HumanPresenceStatus;
  submitted?: HumanPresenceSubmissionRecord;
  locked: boolean;
  pendingHeading: string;
  pendingBody: string;
  readyHeading: string;
  readyBody: string;
}

export interface ConsentPageData {
  topBar: ConsentTopBarVM;
  briefing: BriefingVM;
  rpl: RplSectionVM;
  humanPresence: HumanPresenceSectionVM;
  organisationName: string;
  candidates: RplIdentity[];
}
