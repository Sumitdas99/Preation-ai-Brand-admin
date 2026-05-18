import type {
  DisclosureFormState,
  DisclosureRequirement,
} from "@/api/schemas/disclosure";
import type { SectionCVM } from "@/components/disclosure/types";
import { SECTION_C_COPY } from "../copy";

interface Input {
  form: DisclosureFormState | undefined;
  requirement: DisclosureRequirement | undefined;
  assetDurationMs?: number;
}

export function toSectionC({
  form,
  requirement,
  assetDurationMs,
}: Input): SectionCVM {
  const placement = form?.placement_type;
  const locked = !placement;

  const showOnAssetFields = placement === "ON_ASSET" || placement === "BOTH";
  const showCaptionFields =
    placement === "CAPTION_ONLY" || placement === "BOTH";
  const showExternalFields = placement === "EXTERNAL_IMPLEMENTATION";

  const scopeRow = requirement?.detection_summary?.find(
    (r) => r.key === "scope",
  );
  const scope = form?.scope ?? (scopeRow?.value as
    | "FULL"
    | "PARTIAL"
    | undefined);

  const fullDurationHelper = !form?.location
    ? SECTION_C_COPY.fullDurationHelperNoLocation
    : scope === "PARTIAL"
      ? SECTION_C_COPY.fullDurationHelperPartial
      : SECTION_C_COPY.fullDurationHelperFull;

  const timeRangeHelper =
    scope === "PARTIAL"
      ? SECTION_C_COPY.timeRangeHelperPartial
      : SECTION_C_COPY.timeRangeHelperFull;

  return {
    badgeLetter: SECTION_C_COPY.badgeLetter,
    title: SECTION_C_COPY.title,
    locked,
    showOnAssetFields,
    showCaptionFields,
    showExternalFields,
    locationLabel: SECTION_C_COPY.locationLabel,
    locationPlaceholder: SECTION_C_COPY.locationPlaceholder,
    locationHelper: SECTION_C_COPY.locationHelper,
    locationValue: form?.location,
    locationOptions: SECTION_C_COPY.locationOptions.map((o) => ({
      value: o.value,
      label: o.label,
    })),
    scopeLabel: SECTION_C_COPY.scopeLabel,
    scopeValue: scope,
    fullDurationLabel: SECTION_C_COPY.fullDurationLabel,
    fullDurationConfirmed: form?.full_duration_confirmed ?? false,
    fullDurationHelper,
    timeRangeStartLabel: SECTION_C_COPY.timeRangeStartLabel,
    timeRangeEndLabel: SECTION_C_COPY.timeRangeEndLabel,
    timeRangeStartPlaceholder: SECTION_C_COPY.timeRangeStartPlaceholder,
    timeRangeEndPlaceholder: SECTION_C_COPY.timeRangeEndPlaceholder,
    timeRangeHelper,
    timeRangeDimmed: scope !== "PARTIAL",
    startMs: form?.start_ms,
    endMs: form?.end_ms,
    assetDurationMs,
    captionTextLabel: SECTION_C_COPY.captionTextLabel,
    captionTextPlaceholder: SECTION_C_COPY.captionTextPlaceholder,
    captionFirstLineLabel: SECTION_C_COPY.captionFirstLineLabel,
    captionTextValue: form?.caption_text,
    captionFirstLineConfirmed: form?.caption_first_line_confirmed,
    externalJustificationLabel: SECTION_C_COPY.externalJustificationLabel,
    externalJustificationPlaceholder:
      SECTION_C_COPY.externalJustificationPlaceholder,
    externalAckLabel: SECTION_C_COPY.externalAckLabel,
    externalJustificationValue: form?.external_justification,
    externalAcknowledged: form?.external_acknowledged,
  };
}
