export const proofKeys = {
  all: ["proof"] as const,
  detail: (specId: string) => ["proof", specId] as const,
};
