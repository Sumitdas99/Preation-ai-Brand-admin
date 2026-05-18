export interface CategoryLabelParts {
  name: string;
  kind: string;
}

export const CATEGORY_LABEL_PARTS: Record<string, CategoryLabelParts> = {
  ai_generated_block: { name: "AI-generated", kind: "Block" },
  alcohol_flag: { name: "Alcohol", kind: "Flag" },
  alcohol_block: { name: "Alcohol", kind: "Block" },
  nudity_suggestive_flag: { name: "Nudity", kind: "Suggestive flag" },
  nudity_sexual_display_block: {
    name: "Nudity",
    kind: "Sexual / display block",
  },
  nudity_erotica_block: { name: "Nudity", kind: "Erotica block" },
  tobacco_flag: { name: "Tobacco", kind: "Flag" },
  gambling_flag: { name: "Gambling", kind: "Flag" },
  gambling_block: { name: "Gambling", kind: "Block" },
  hate_symbols_flag: { name: "Hate symbols", kind: "Flag" },
  hate_symbols_block: { name: "Hate symbols", kind: "Block" },
  minor_detected_block: { name: "Minor detected", kind: "Block" },
  violence_block: { name: "Violence", kind: "Block" },
  weapons_block: { name: "Weapons", kind: "Block" },
  drugs_block: { name: "Drugs", kind: "Block" },
  gore_block: { name: "Gore", kind: "Block" },
};

export const COMPARISON_TABLE_ORDER: string[] = [
  "alcohol_flag",
  "alcohol_block",
  "nudity_suggestive_flag",
  "tobacco_flag",
  "gambling_flag",
  "hate_symbols_flag",
];

export const COMPARISON_TABLE_LOCKED_ORDER: string[] = [
  "hate_symbols_block",
  "minor_detected_block",
];

export function categoryLabelParts(key: string): CategoryLabelParts {
  return CATEGORY_LABEL_PARTS[key] ?? { name: key, kind: "" };
}

export function isFlagCategory(key: string): boolean {
  return key.endsWith("_flag");
}
