export const consentKeys = {
  all: ["consent"] as const,
  detail: (specId: string) => ["consent", specId] as const,
};
