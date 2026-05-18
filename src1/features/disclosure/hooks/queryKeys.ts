import type { DisclosureTemplateQuery } from "@/api/schemas/disclosure";

export const disclosureKeys = {
  all: ["disclosure"] as const,
  detail: (specId: string) => ["disclosure", specId] as const,
  templates: (query: DisclosureTemplateQuery = {}) =>
    [
      "disclosure",
      "templates",
      query.trigger ?? null,
      query.modality ?? null,
      query.scope ?? null,
      query.channel ?? null,
      query.geo ?? null,
      query.lang ?? null,
    ] as const,
};
