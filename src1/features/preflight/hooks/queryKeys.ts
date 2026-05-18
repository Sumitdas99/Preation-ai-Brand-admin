export const preflightKeys = {
  all: ["preflight"] as const,
  detail: (runId: string) => ["preflight", runId] as const,
  asset: (assetId: string) => ["asset", assetId] as const,
  disclosure: (specId: string) => ["disclosure", specId] as const,
  approvalForRun: (runId: string) => ["approval", "for-run", runId] as const,
  approvalQueue: (runId: string) => ["approval", "queue", runId] as const,
};
