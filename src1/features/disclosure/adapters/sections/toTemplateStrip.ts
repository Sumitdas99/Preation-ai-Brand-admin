import type {
  DisclosureRequirement,
  DisclosureScope,
  DisclosureTemplate,
} from "@/api/schemas/disclosure";
import type {
  TemplateOptionVM,
  TemplateStripVM,
} from "@/components/disclosure/types";
import { TEMPLATE_STRIP_COPY } from "../copy";

interface Input {
  template?: DisclosureTemplate;
  options?: DisclosureTemplate[];
  requirement?: DisclosureRequirement;
  selectedScope?: DisclosureScope;
  language: string;
  currentTemplateId?: string;
}

export function toTemplateStrip({
  template,
  options = [],
  requirement,
  selectedScope,
  language,
  currentTemplateId,
}: Input): TemplateStripVM {
  const applied = Boolean(template);

  const parts: string[] = [];
  if (requirement?.trigger_type) parts.push(requirement.trigger_type);
  if (requirement?.modality) parts.push(String(requirement.modality));
  if (selectedScope) parts.push(selectedScope);
  if (language) parts.push(language.toUpperCase());
  const templateKey = parts.length ? parts.join(" · ") : undefined;

  const mappedOptions: TemplateOptionVM[] = options.map((t) => ({
    id: t.template_id,
    label: t.label ?? t.key ?? t.template_id,
    text: t.text,
    language: t.language,
  }));

  return {
    visible: true,
    applied,
    badgeLabel: TEMPLATE_STRIP_COPY.badgeLabel,
    bodyPrefix: TEMPLATE_STRIP_COPY.bodyPrefix,
    templateKey,
    arrowSymbol: TEMPLATE_STRIP_COPY.arrowSymbol,
    quotedText: template?.text,
    bodyMeta: TEMPLATE_STRIP_COPY.bodyMeta,
    changeLinkLabel: TEMPLATE_STRIP_COPY.changeLinkLabel,
    emptyMessage: applied ? undefined : TEMPLATE_STRIP_COPY.emptyMessage,
    options: mappedOptions,
    currentTemplateId: currentTemplateId ?? template?.template_id,
  };
}
