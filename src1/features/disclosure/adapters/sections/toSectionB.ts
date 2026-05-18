import type {
  DisclosureFormState,
  DisclosurePlacementType,
} from "@/api/schemas/disclosure";
import type {
  PlacementOptionVM,
  SectionBVM,
} from "@/components/disclosure/types";
import { SECTION_B_COPY } from "../copy";

const OPTION_ORDER: DisclosurePlacementType[] = [
  "ON_ASSET",
  "CAPTION_ONLY",
  "BOTH",
  "EXTERNAL_IMPLEMENTATION",
];

export function toSectionB(form: DisclosureFormState | undefined): SectionBVM {
  const options: PlacementOptionVM[] = OPTION_ORDER.map((id) => {
    const copy = SECTION_B_COPY.options[id];
    return {
      id,
      label: copy.label,
      description: copy.description,
      recommended: "recommended" in copy ? copy.recommended : undefined,
    };
  });

  return {
    badgeLetter: SECTION_B_COPY.badgeLetter,
    title: SECTION_B_COPY.title,
    defaultPrompt: SECTION_B_COPY.defaultPrompt,
    options,
    selected: form?.placement_type,
  };
}
