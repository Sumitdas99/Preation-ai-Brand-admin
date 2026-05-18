import type { ValidationCheck } from "@/api/schemas/disclosure";
import type {
  ValidationCheckVM,
  ValidationPanelVM,
} from "@/components/disclosure/types";
import {
  VALIDATION_CHECK_LABELS,
  VALIDATION_PANEL_COPY,
} from "../copy";

export function toValidationPanel(
  checks: ValidationCheck[],
): ValidationPanelVM {
  const applicable = checks.filter((c) => c.status !== "NOT_APPLICABLE");

  const effective = applicable.map(
    (c): ValidationCheckVM => ({
      id: c.id,
      label: VALIDATION_CHECK_LABELS[c.id] ?? c.label,
      status: c.status,
      detail: c.status === "FAIL" ? c.detail : undefined,
    }),
  );

  const totalCount = effective.length;
  const passCount = effective.filter((c) => c.status === "PASS").length;
  const allPass = totalCount > 0 && passCount === totalCount;

  const pillLabel = allPass
    ? VALIDATION_PANEL_COPY.passPill
    : VALIDATION_PANEL_COPY.pendingPillTemplate.replace(
        "{total}",
        String(totalCount),
      );

  return {
    badgeLabel: VALIDATION_PANEL_COPY.badgeLabel,
    title: VALIDATION_PANEL_COPY.title,
    pillLabel,
    allPass,
    passCount,
    totalCount,
    checks: effective,
  };
}
