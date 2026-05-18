const SUB_FIELD_LABELS: Record<string, string> = {
  "alcohol.score": "Alcohol presence",

  "violence.score": "General violence",
  "violence.physical_violence": "Physical violence",
  "violence.firearm_threat": "Firearm threat",

  "weapon.firearm": "Firearm visible",
  "weapon.knife": "Knife visible",
  "weapon.firearm_aiming_threat": "Firearm aimed",

  "gore.score": "Gore (general)",
  "gore.real": "Real gore",
  "gore.very_bloody": "Very bloody",
  "gore.body_organ": "Body / organ",

  "self_harm.score": "Self-harm (general)",
  "self_harm.real": "Real self-harm",

  "recreational_drug.score": "Drug use",
  "recreational_drug.cannabis": "Cannabis",
  "recreational_drug.non_cannabis": "Non-cannabis drugs",

  "nudity.sexual_activity": "Sexual activity",
  "nudity.sexual_display": "Sexual display",
  "nudity.erotica": "Erotica",

  "nudity_suggestive.score": "Suggestive content",
  "nudity.very_suggestive": "Highly suggestive",
  "nudity.suggestive": "Suggestive",
  "nudity.mildly_suggestive": "Mildly suggestive",

  "tobacco.score": "Tobacco use",
  "gambling.score": "Gambling",

  "offensive.nazi": "Nazi symbol",
  "offensive.supremacist": "Supremacist symbol",
  "offensive.terrorist": "Terrorist symbol",
  "offensive.confederate": "Confederate symbol",

  "text.profanity_detected": "Profanity in text",
  "text.extremism_detected": "Extremism in text",
};

export function resolveSubFieldLabel(
  rawPath: string | undefined,
  apiLabel: string | undefined,
): string | undefined {
  if (apiLabel && looksHuman(apiLabel)) return apiLabel;
  if (rawPath && SUB_FIELD_LABELS[rawPath]) return SUB_FIELD_LABELS[rawPath];
  if (rawPath) {
    const tail = rawPath.split(".").slice(-1)[0] ?? rawPath;
    return tail.replace(/_/g, " ");
  }
  return apiLabel;
}

function looksHuman(label: string): boolean {
  if (label.includes(".")) return false;
  return true;
}
