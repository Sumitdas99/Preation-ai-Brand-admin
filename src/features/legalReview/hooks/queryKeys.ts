import type { ApprovalQueueQuery } from "@/api/endpoints/approvals";

export const legalKeys = {
  all: ["legal"] as const,
  queue: (params: ApprovalQueueQuery = {}) =>
    ["legal", "queue", params] as const,
  approvalDetail: (approvalId: string) =>
    ["legal", "approval", approvalId] as const,
};
