import type { Asset } from "@/api/schemas/asset";
import type {
  DisclosureSpec,
  DisclosureTemplate,
} from "@/api/schemas/disclosure";
import type { DisclosureSpecData } from "@/components/disclosure/types";
import type { ViewerRole } from "@/components/preflight/viewerRole";
import { toRequirementAlert } from "./sections/toRequirementAlert";
import { toSectionA } from "./sections/toSectionA";
import { toSectionB } from "./sections/toSectionB";
import { toSectionC } from "./sections/toSectionC";
import { toStepProgress } from "./sections/toStepProgress";
import { toTemplateStrip } from "./sections/toTemplateStrip";
import { toTopBar } from "./sections/toTopBar";
import { toValidationPanel } from "./sections/toValidationChecks";
import { toLockFooter } from "./sections/toLockFooter";

interface ToDisclosureDataArgs {
  spec: DisclosureSpec;
  asset?: Asset;
  templates?: DisclosureTemplate[];
  role: ViewerRole;
}

export function toDisclosureData({
  spec,
  asset,
  templates,
  role,
}: ToDisclosureDataArgs): DisclosureSpecData {
  const form = spec.form;
  const language = form?.language ?? "en";
  const cycleOptions =
    (templates ?? []).filter((t) => t.language === language).length > 0
      ? (templates ?? []).filter((t) => t.language === language)
      : spec.template
        ? [spec.template]
        : [];
  const templateStrip = toTemplateStrip({
    template: spec.template,
    options: cycleOptions,
    requirement: spec.requirement,
    selectedScope: form?.scope,
    language,
    currentTemplateId: form?.template_id ?? spec.template?.template_id,
  });

  const sectionA = toSectionA({
    form,
    requirement: spec.requirement,
    templateStrip,
  });
  const sectionB = toSectionB(form);
  const sectionC = toSectionC({
    form,
    requirement: spec.requirement,
    assetDurationMs: spec.asset_duration_ms,
  });
  const validation = toValidationPanel(spec.validation_checks ?? []);
  const lockFooter = toLockFooter(spec, validation);
  const requirementAlert = toRequirementAlert(spec.requirement, form);
  const stepProgress = toStepProgress(spec);
  const topBar = toTopBar(asset, role);

  return {
    status: spec.status,
    topBar,
    stepProgress,
    requirementAlert,
    sectionA,
    sectionB,
    sectionC,
    validation,
    lockFooter,
    readOnly:
      spec.status === "DISCLOSURE_SPEC_LOCKED" ||
      spec.status === "DISCLOSURE_CHALLENGE_PENDING",
  };
}
