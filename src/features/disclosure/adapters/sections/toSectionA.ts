import type {
  DisclosureFormState,
  DisclosureRequirement,
} from "@/api/schemas/disclosure";
import type {
  SectionAVM,
  TemplateStripVM,
} from "@/components/disclosure/types";
import { LANGUAGE_OPTIONS, SECTION_A_COPY } from "../copy";

interface ToSectionAInput {
  form: DisclosureFormState | undefined;
  requirement: DisclosureRequirement | undefined;
  templateStrip: TemplateStripVM;
}

export function toSectionA({
  form,
  requirement,
  templateStrip,
}: ToSectionAInput): SectionAVM {
  const scopeRow = requirement?.detection_summary?.find(
    (r) => r.key === "scope",
  );
  const scopeValue = form?.scope ?? scopeRow?.value;

  return {
    badgeLetter: SECTION_A_COPY.badgeLetter,
    title: SECTION_A_COPY.title,
    headerMeta: SECTION_A_COPY.headerMeta,
    templateStrip,
    textareaLabel: SECTION_A_COPY.textareaLabel,
    textareaValue: form?.final_text ?? "",
    maxChars: SECTION_A_COPY.maxChars,
    charCounterTemplate: SECTION_A_COPY.charCounterTemplate,
    helperText: SECTION_A_COPY.helperText,
    languageLabel: SECTION_A_COPY.languageLabel,
    languageValue: form?.language ?? "en",
    languageOptions: [...LANGUAGE_OPTIONS],
    languageHelperText: SECTION_A_COPY.languageHelperText,
    scope: scopeValue
      ? {
          label: SECTION_A_COPY.scopeLabel,
          value: scopeValue,
          sourceLabel: SECTION_A_COPY.scopeSourceLabel,
          helperText: SECTION_A_COPY.scopeHelperText,
        }
      : undefined,
  };
}
