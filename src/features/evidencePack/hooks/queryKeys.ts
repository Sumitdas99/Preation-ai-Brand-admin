export const evidencePackKeys = {
  all: ["evidence-pack"] as const,
  preview: (packId: string) => ["evidence-pack", packId, "preview"] as const,
};
