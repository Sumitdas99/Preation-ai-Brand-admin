import type {
  ActionItem,
  ActionSection,
  PreFlightState,
} from "@/components/preflight/types";

export interface ActionSectionContext {
  state: PreFlightState;
  forcePassDisabled: boolean;
  challengeAlreadySubmitted: boolean;
  advisoryCount: number;
  consentRequired?: boolean;
  syntheticDetected?: boolean;
}

export function toActionSections(ctx: ActionSectionContext): ActionSection[] {
  const {
    state,
    forcePassDisabled,
    challengeAlreadySubmitted,
    consentRequired,
    syntheticDetected,
  } = ctx;

  if (state === "EVALUATION_IN_PROGRESS") return [];
  if (state === "SYSTEM_ERROR_POLICY_UNAVAILABLE") return [];

  if (state === "BLOCK_UNTIL_REMEDIATED") {
    const items: ActionItem[] = [
      {
        id: "add-disclosure",
        label: "Add AI disclosure",
        description:
          "Attach the required AI-generated disclosure label before publication.",
        role: "Reviewer",
      },
      {
        id: "fix-provenance",
        label: "Fix provenance",
        description: "Embed the C2PA provenance manifest (currently in progress).",
        role: "Reviewer",
      },
    ];
    if (consentRequired) {
      items.push({
        id: "confirm-consent-presence",
        label: "Confirm consent & presence",
        description:
          "Attach RPL consent documentation and/or declare human presence authorisation before this asset can proceed.",
        role: "Reviewer",
      });
    }
    if (syntheticDetected && !challengeAlreadySubmitted) {
      items.push({
        id: "challenge-detection",
        label: "Challenge detection result",
        description:
          "Dispute the AI detection with supporting evidence for Legal review.",
        role: "Reviewer",
        tone: "purple",
      });
    }
    if (!forcePassDisabled) {
      items.push({
        id: "force-pass",
        label: "Force pass with commentary",
        description: "Override the block with a written Legal justification.",
        role: "Legal only",
      });
    }
    return [{ kind: "regular", title: "REQUIRED ACTIONS", items }];
  }

  if (state === "DISCLOSURE_CHALLENGE_PENDING") {
    const legalItems: ActionItem[] = [
      {
        id: "accept-challenge",
        label: "Accept challenge",
        description:
          "Confirm the detection is incorrect and remove the disclosure obligation.",
        role: "Legal only",
      },
      {
        id: "reject-challenge",
        label: "Reject challenge",
        description:
          "Uphold the detection and return the asset to the disclosure flow.",
        role: "Legal only",
      },
    ];
    if (!forcePassDisabled) {
      legalItems.push({
        id: "force-pass",
        label: "Force pass with commentary",
        description:
          "Override the block with a written Legal justification (last-resort override).",
        role: "Legal only",
      });
    }
    return [
      {
        kind: "regular",
        title: "ACTIVE ACTIONS",
        items: [
          {
            id: "fix-provenance",
            label: "Fix provenance",
            description:
              "Manually re-trigger the Provenance Engine while the challenge is under Legal review.",
            role: "Reviewer",
          },
        ],
      },
      {
        kind: "legal-challenge-resolution",
        title: "CHALLENGE RESOLUTION",
        items: legalItems,
      },
    ];
  }

  if (state === "APPROVED_PENDING_PROOF") {
    return [
      {
        kind: "regular",
        title: "REQUIRED ACTION",
        items: [
          {
            id: "upload-disclosure-proof",
            label: "Upload Disclosure Proof",
            description:
              "Upload disclosure proof to complete publish clearance.",
            role: "Reviewer",
            primary: true,
          },
        ],
      },
      {
        kind: "regular",
        title: "OTHER ACTIONS",
        items: [
          {
            id: "add-disclosure",
            label: "View disclosure spec",
            description:
              "Open the locked disclosure specification in read-only mode.",
            role: "Reviewer",
          },
        ],
      },
    ];
  }

  if (state === "PUBLISH_CLEARED") {
    return [];
  }

  if (state === "ALLOW_WITH_WARNINGS") {
    return [
      {
        kind: "regular",
        title: "ADVISORY ACTIONS",
        items: [
          {
            id: "review-brand",
            label: "Review brand content",
            description:
              "Acknowledge the brand suitability advisory before proceeding.",
            role: "Reviewer",
          },
        ],
      },
      {
        kind: "regular",
        title: "PRIMARY ACTIONS",
        items: [
          {
            id: "submit-legal",
            label: "Submit for Legal approval",
            description:
              "Send the asset to Legal for final approval and attestation.",
            role: "Reviewer",
            primary: true,
          },
          {
            id: "approve-attest",
            label: "Approve and attest",
            description:
              "Approve the asset and sign the compliance attestation.",
            role: "Legal only",
          },
        ],
      },
    ];
  }

  return [
    {
      kind: "regular",
      title: "PRIMARY ACTIONS",
      items: [
        {
          id: "submit-legal",
          label: "Submit for Legal approval",
          description:
            "Send the asset to Legal for final approval and attestation.",
          role: "Reviewer",
          primary: true,
        },
        {
          id: "approve-attest",
          label: "Approve and attest",
          description: "Approve the asset and sign the compliance attestation.",
          role: "Legal only",
        },
      ],
    },
  ];
}
