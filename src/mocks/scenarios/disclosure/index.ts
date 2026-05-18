import type { MockScenario } from "@/api/mockScenario";
import type {
  DisclosureFormState,
  DisclosureRequirement,
  DisclosureSpec,
  ValidationCheck,
} from "@/api/schemas/disclosure";
import {
  MOCK_ASSET_ID,
  MOCK_DISCLOSURE_SPEC_ID,
  MOCK_REVIEWER_ID,
} from "../../constants";
import { findTemplateById, MOCK_DEFAULT_TEMPLATE_ID } from "./templates";

const MOCK_ASSET_DURATION_MS = 32_000;

const requirement: DisclosureRequirement = {
  trigger_type: "TRIGGER_AI_ORIGIN",
  disclosure_level: "MANDATORY",
  policy_basis: "EU AI Act — Article 50(1)",
  policy_reference_url:
    "https://artificialintelligenceact.eu/article/50/",
  geo_context: ["EU", "DE", "FR", "IT"],
  channel_platform: ["INSTAGRAM", "YOUTUBE"],
  risk_indicator: "HIGH",
  modality: "VIDEO",
  detection_summary: [
    {
      key: "ai_generated_score",
      label: "AI generated score",
      score: 0.87,
      band: "BLOCK_BAND",
    },
    {
      key: "confidence_band",
      label: "Confidence band",
      value: "HIGH_CONFIDENCE",
      band: "HIGH_CONFIDENCE",
    },
    {
      key: "modality",
      label: "Modality",
      value: "VIDEO",
    },
    {
      key: "scope",
      label: "Scope",
      value: "FULL",
    },
  ],
};

const defaultTemplate = findTemplateById(MOCK_DEFAULT_TEMPLATE_ID);

const emptyForm: DisclosureFormState = {
  final_text: defaultTemplate?.text ?? "",
  language: "en",
  template_id: MOCK_DEFAULT_TEMPLATE_ID,
  scope: "FULL",
  full_duration_confirmed: false,
};

export function buildInitialValidationChecks(
  form: DisclosureFormState,
): ValidationCheck[] {
  return computeValidationChecks(form);
}

export function computeValidationChecks(
  form: DisclosureFormState,
  assetDurationMs: number = MOCK_ASSET_DURATION_MS,
): ValidationCheck[] {
  const placement = form.placement_type;
  const scope = form.scope;

  const involvesOnAsset = placement === "ON_ASSET" || placement === "BOTH";
  const involvesCaption =
    placement === "CAPTION_ONLY" || placement === "BOTH";
  const involvesExternal = placement === "EXTERNAL_IMPLEMENTATION";

  const textPresent = Boolean(form.final_text && form.final_text.trim());
  const placementSelected = Boolean(placement);

  let requiredFieldsComplete = false;
  if (placementSelected) {
    let ok = true;
    if (involvesOnAsset) {
      if (!form.location) ok = false;
      if (scope === "FULL" && form.full_duration_confirmed !== true) ok = false;
      if (
        scope === "PARTIAL" &&
        (typeof form.start_ms !== "number" || typeof form.end_ms !== "number")
      ) {
        ok = false;
      }
    }
    if (involvesCaption) {
      if (!form.caption_text || !form.caption_text.trim()) ok = false;
    }
    if (involvesExternal) {
      if (!form.external_justification || !form.external_justification.trim())
        ok = false;
    }
    requiredFieldsComplete = ok;
  }

  const timeRangeApplicable = involvesOnAsset && scope === "PARTIAL";
  const timeRangeOk =
    typeof form.start_ms === "number" &&
    typeof form.end_ms === "number" &&
    form.start_ms < form.end_ms &&
    form.end_ms <= assetDurationMs;

  const captionFirstLineApplicable = involvesCaption;
  const captionFirstLineOk = form.caption_first_line_confirmed === true;

  const externalAckApplicable = involvesExternal;
  const externalAckOk = form.external_acknowledged === true;

  return [
    {
      id: "DISCLOSURE_TEXT_PRESENT",
      label: "Disclosure text not empty",
      status: textPresent ? "PASS" : "PENDING",
      spec_reference: "Spec §8.1 check 1",
    },
    {
      id: "PLACEMENT_TYPE_SELECTED",
      label: "Placement type selected",
      status: placementSelected ? "PASS" : "PENDING",
      spec_reference: "Spec §8.1 check 2",
    },
    {
      id: "REQUIRED_FIELDS_COMPLETE",
      label: "All required placement fields complete",
      status: !placementSelected
        ? "PENDING"
        : requiredFieldsComplete
          ? "PASS"
          : "PENDING",
      spec_reference: "Spec §8.1 check 3",
    },
    {
      id: "TIME_RANGE_VALID",
      label: "Time range valid (start < end ≤ duration)",
      status: !timeRangeApplicable
        ? "NOT_APPLICABLE"
        : timeRangeOk
          ? "PASS"
          : "PENDING",
      detail: timeRangeApplicable
        ? `Asset duration is ${assetDurationMs} ms.`
        : undefined,
      spec_reference: "Spec §8.1 check 4",
    },
    {
      id: "CAPTION_FIRST_LINE_CONFIRMED",
      label: "Caption first-line confirmation",
      status: !captionFirstLineApplicable
        ? "NOT_APPLICABLE"
        : captionFirstLineOk
          ? "PASS"
          : "PENDING",
      spec_reference: "Spec §8.1 check 5",
    },
    {
      id: "EXTERNAL_ACKNOWLEDGED",
      label: "External implementation acknowledgement",
      status: !externalAckApplicable
        ? "NOT_APPLICABLE"
        : externalAckOk
          ? "PASS"
          : "PENDING",
      spec_reference: "Spec §8.1 check 6",
    },
  ];
}

const baseSpec: Omit<DisclosureSpec, "status" | "validation_checks"> = {
  spec_id: MOCK_DISCLOSURE_SPEC_ID,
  asset_id: MOCK_ASSET_ID,
  disclosure_type: "EU_AI_ACT_ART50",
  created_at: "2026-04-18T09:15:10Z",
  asset_duration_ms: MOCK_ASSET_DURATION_MS,
};

const required: DisclosureSpec = {
  ...baseSpec,
  status: "DISCLOSURE_IN_PROGRESS",
  requirement,
  template: defaultTemplate,
  form: emptyForm,
  validation_checks: buildInitialValidationChecks(emptyForm),
};

const challengePending: DisclosureSpec = {
  ...baseSpec,
  status: "DISCLOSURE_CHALLENGE_PENDING",
  requirement,
  template: defaultTemplate,
  form: emptyForm,
  validation_checks: buildInitialValidationChecks(emptyForm),
  challenge: {
    submitted_at: "2026-04-18T09:18:34Z",
    submitted_by: "J. Martin",
    submitted_by_role: MOCK_REVIEWER_ID,
    justification:
      "This asset was produced entirely in-house by our studio team using traditional photography equipment on 12 April 2026. The high AI score is likely attributable to heavy post-production retouching applied by our external agency. I confirm this is human-originated content and believe the detection result is incorrect.",
    declaration_confirmed: true,
    audit_trail_id: "aud_demo_0001",
  },
  updated_at: "2026-04-18T09:18:47Z",
};

const specLocked: DisclosureSpec = {
  ...baseSpec,
  status: "DISCLOSURE_SPEC_LOCKED",
  requirement,
  template: defaultTemplate,
  form: { ...emptyForm, placement_type: "ON_ASSET", location: "BOTTOM_LEFT", scope: "FULL", full_duration_confirmed: true },
  validation_checks: computeValidationChecks({
    ...emptyForm,
    placement_type: "ON_ASSET",
    location: "BOTTOM_LEFT",
    scope: "FULL",
    full_duration_confirmed: true,
  }),
  locked_at: "2026-04-18T09:20:00Z",
  locked_hash: "sha256:demo-locked-0001",
  updated_at: "2026-04-18T09:20:00Z",
};

const notRequired: DisclosureSpec = {
  ...baseSpec,
  status: "DISCLOSURE_NOT_REQUIRED",
  validation_checks: [],
};

export const disclosureScenarios: Record<MockScenario, DisclosureSpec | null> = {
  "in-progress": null,
  block: required,
  "challenge-pending": challengePending,
  "system-error": null,
  "allow-with-warnings": specLocked,
  allow: notRequired,
  "approved-pending-proof": specLocked,
  "publish-cleared": specLocked,
};

export { MOCK_ASSET_DURATION_MS };
