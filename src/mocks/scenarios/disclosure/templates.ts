import type { DisclosureTemplate } from "@/api/schemas/disclosure";

export const MOCK_DEFAULT_TEMPLATE_ID = "tpl_ai_origin_video_full_en";

export const disclosureTemplates: DisclosureTemplate[] = [
  {
    template_id: "tpl_ai_origin_image_full_en",
    key: "TRIGGER_AI_ORIGIN·IMAGE·FULL·EN",
    label: "AI origin · Image · Full · EN",
    trigger_type: "TRIGGER_AI_ORIGIN",
    modality: "IMAGE",
    scope: "FULL",
    language: "en",
    text: "This image was created or modified using artificial intelligence.",
    source: "system-fixed",
  },
  {
    template_id: "tpl_ai_origin_image_full_de",
    key: "TRIGGER_AI_ORIGIN·IMAGE·FULL·DE",
    label: "AI origin · Image · Full · DE",
    trigger_type: "TRIGGER_AI_ORIGIN",
    modality: "IMAGE",
    scope: "FULL",
    language: "de",
    text: "Dieses Bild wurde mithilfe von Künstlicher Intelligenz erstellt oder bearbeitet.",
    source: "system-fixed",
  },
  {
    template_id: "tpl_ai_origin_image_full_fr",
    key: "TRIGGER_AI_ORIGIN·IMAGE·FULL·FR",
    label: "AI origin · Image · Full · FR",
    trigger_type: "TRIGGER_AI_ORIGIN",
    modality: "IMAGE",
    scope: "FULL",
    language: "fr",
    text: "Cette image a été créée ou modifiée à l'aide de l'intelligence artificielle.",
    source: "system-fixed",
  },
  {
    template_id: "tpl_ai_origin_image_full_it",
    key: "TRIGGER_AI_ORIGIN·IMAGE·FULL·IT",
    label: "AI origin · Image · Full · IT",
    trigger_type: "TRIGGER_AI_ORIGIN",
    modality: "IMAGE",
    scope: "FULL",
    language: "it",
    text: "Questa immagine è stata creata o modificata utilizzando l'intelligenza artificiale.",
    source: "system-fixed",
  },
  {
    template_id: "tpl_ai_origin_image_full_es",
    key: "TRIGGER_AI_ORIGIN·IMAGE·FULL·ES",
    label: "AI origin · Image · Full · ES",
    trigger_type: "TRIGGER_AI_ORIGIN",
    modality: "IMAGE",
    scope: "FULL",
    language: "es",
    text: "Esta imagen fue creada o modificada utilizando inteligencia artificial.",
    source: "system-fixed",
  },
  {
    template_id: MOCK_DEFAULT_TEMPLATE_ID,
    key: "TRIGGER_AI_ORIGIN·VIDEO·FULL·EN",
    label: "AI origin · Video · Full · EN",
    trigger_type: "TRIGGER_AI_ORIGIN",
    modality: "VIDEO",
    scope: "FULL",
    language: "en",
    text: "This video contains AI-generated content.",
    source: "system-fixed",
  },
  {
    template_id: "tpl_ai_origin_video_partial_en",
    key: "TRIGGER_AI_ORIGIN·VIDEO·PARTIAL·EN",
    label: "AI origin · Video · Partial · EN",
    trigger_type: "TRIGGER_AI_ORIGIN",
    modality: "VIDEO",
    scope: "PARTIAL",
    language: "en",
    text: "Portions of this video have been created or modified using artificial intelligence.",
    source: "system-fixed",
  },
];

export function filterDisclosureTemplates(query: {
  trigger?: string;
  modality?: string;
  scope?: string;
  lang?: string;
}): DisclosureTemplate[] {
  return disclosureTemplates.filter((t) => {
    if (query.trigger && t.trigger_type !== query.trigger) return false;
    if (query.modality && t.modality !== query.modality) return false;
    if (query.scope && t.scope !== query.scope) return false;
    if (query.lang && t.language !== query.lang) return false;
    return true;
  });
}

export function findTemplateById(
  id: string | undefined,
): DisclosureTemplate | undefined {
  if (!id) return undefined;
  return disclosureTemplates.find((t) => t.template_id === id);
}
