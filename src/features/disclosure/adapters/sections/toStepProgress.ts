import type { DisclosureSpec } from "@/api/schemas/disclosure";
import type {
  DisclosureStep,
  DisclosureStepItem,
  DisclosureStepProgress,
} from "@/components/disclosure/types";
import { STEP_LABELS } from "../copy";

export function toStepProgress(
  spec: DisclosureSpec,
): DisclosureStepProgress {
  const form = spec.form;
  const checks = spec.validation_checks ?? [];

  const textPresent = checks.find(
    (c) => c.id === "DISCLOSURE_TEXT_PRESENT",
  )?.status === "PASS";
  const placementSelected = Boolean(form?.placement_type);
  const detailsComplete = checks
    .filter((c) =>
      c.id === "REQUIRED_FIELDS_COMPLETE" ||
      c.id === "TIME_RANGE_VALID" ||
      c.id === "CAPTION_FIRST_LINE_CONFIRMED" ||
      c.id === "EXTERNAL_ACKNOWLEDGED",
    )
    .every((c) => c.status === "PASS" || c.status === "NOT_APPLICABLE");
  const locked = spec.status === "DISCLOSURE_SPEC_LOCKED";

  const activeStep: DisclosureStep = locked
    ? "lock"
    : !textPresent
      ? "requirement"
      : !placementSelected
        ? "placement-declaration"
        : !detailsComplete
          ? "placement-details"
          : "lock";

  const stepOrder: DisclosureStep[] = [
    "requirement",
    "placement-declaration",
    "placement-details",
    "lock",
  ];

  const items: DisclosureStepItem[] = stepOrder.map((id) => {
    const activeIdx = stepOrder.indexOf(activeStep);
    const idx = stepOrder.indexOf(id);
    const status: DisclosureStepItem["status"] =
      idx < activeIdx ? "complete" : idx === activeIdx ? "active" : "upcoming";
    const label =
      id === "requirement"
        ? STEP_LABELS.requirement
        : id === "placement-declaration"
          ? STEP_LABELS.placementDeclaration
          : id === "placement-details"
            ? STEP_LABELS.placementDetails
            : STEP_LABELS.lock;
    return { id, label, status };
  });

  return { items };
}
