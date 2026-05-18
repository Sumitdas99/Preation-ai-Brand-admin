import type {
  ApprovalQueueItem,
  ApprovalQueueResponse,
  ApprovalState,
} from "@/api/schemas/approvals";
import type {
  LegalDashboardData,
  LegalDashboardKpi,
  LegalDashboardRowData,
  LegalDashboardSection,
  LegalDashboardTabData,
  LegalRowActionKind,
} from "@/components/legalReview/types";
import {
  actionChipsFromSummary,
  ageCaption,
  ageTone,
  formatAge,
  formatLongDate,
  formatResolvedAt,
  formatSubmittedAt,
  greetingPrefix,
  policyVerdictLabel,
  shortApprovalId,
  statusBadgeForReviewedRow,
} from "./format";

export type LegalDateFilter = "today" | "7d" | "30d" | "all";

export interface LegalDashboardAdapterOptions {
  workspaceLabel?: string;
  approverName?: string;
  dateFilter?: LegalDateFilter;
  now?: Date;
}

const PENDING_STATES = new Set<ApprovalState>([
  "PENDING_REVIEW",
  "SUBMITTED_FOR_APPROVAL",
  "UNDER_REVIEW",
]);

const REVIEWED_STATES = new Set<ApprovalState>([
  "APPROVED",
  "APPROVED_PENDING_PROOF",
  "OVERRIDE_APPROVED",
  "FORCE_PASSED",
  "REJECTED",
  "REJECTED_BACK_TO_REVIEWER",
]);

const APPROVED_TERMINAL_STATES = new Set<ApprovalState>([
  "APPROVED",
  "OVERRIDE_APPROVED",
  "FORCE_PASSED",
]);

const REJECTED_STATES = new Set<ApprovalState>([
  "REJECTED",
  "REJECTED_BACK_TO_REVIEWER",
]);

export function toLegalDashboardData(
  queue: ApprovalQueueResponse,
  role: "Legal" | "Reviewer",
  options: LegalDashboardAdapterOptions = {},
): LegalDashboardData {
  const now = options.now ?? new Date();

  if (role === "Reviewer") {
    return buildReviewerDashboard(queue, options, now);
  }
  return buildLegalDashboard(queue, options, now);
}

function buildLegalDashboard(
  queue: ApprovalQueueResponse,
  options: LegalDashboardAdapterOptions,
  now: Date,
): LegalDashboardData {
  const { approverName = "Approver", workspaceLabel } = options;
  const dateFilter = options.dateFilter ?? "today";

  const items = queue.items ?? [];
  const pending = items.filter((i) => PENDING_STATES.has(i.state));
  const reviewedAll = items.filter((i) => REVIEWED_STATES.has(i.state));
  const reviewed = filterByDateRange(reviewedAll, dateFilter, now);

  const counts = queue.counts ?? {};
  const pending_review = counts.pending_review ?? pending.length;
  const waiting_over_8h =
    counts.waiting_over_8h ??
    pending.filter((i) => (i.age_minutes ?? 0) >= 8 * 60).length;
  const waiting_over_24h =
    counts.waiting_over_24h ??
    pending.filter((i) => (i.age_minutes ?? 0) >= 24 * 60).length;
  const reviewed_today = counts.reviewed_today ?? reviewedAll.length;

  const kpis: LegalDashboardKpi[] = [
    { label: "Pending review", value: pending_review },
    {
      label: "Waiting 8+ hours",
      value: waiting_over_8h,
      tone: waiting_over_8h > 0 ? "amber" : "neutral",
    },
    {
      label: "Waiting 24+ hours",
      value: waiting_over_24h,
      tone: waiting_over_24h > 0 ? "red" : "neutral",
    },
    { label: "Reviewed today", value: reviewed_today, tone: "green" },
  ];

  const pendingByPriority = groupByPriority(pending);
  const pendingTab: LegalDashboardTabData = {
    key: "pending",
    label: "Pending Review",
    count: pending.length,
    countTone: "blue",
    sections: [
      pendingByPriority.critical.length > 0
        ? {
            key: "priority-1",
            title: "Critical",
            count: pendingByPriority.critical.length,
            description: "Reviewer fully blocked",
            tone: "red",
            rows: pendingByPriority.critical.map((i) =>
              buildPendingRow(i, "Legal", now),
            ),
          }
        : null,
      pendingByPriority.high.length > 0
        ? {
            key: "priority-2",
            title: "High Priority",
            count: pendingByPriority.high.length,
            description: "Reviewer blocked until Legal decides",
            tone: "amber",
            rows: pendingByPriority.high.map((i) =>
              buildPendingRow(i, "Legal", now),
            ),
          }
        : null,
      pendingByPriority.standard.length > 0
        ? {
            key: "priority-3",
            title: "Standard",
            count: pendingByPriority.standard.length,
            description: "Awaiting attestation",
            tone: "muted",
            rows: pendingByPriority.standard.map((i) =>
              buildPendingRow(i, "Legal", now),
            ),
          }
        : null,
    ].filter(notNull),
    emptyTitle: "No approvals waiting",
    emptyBody: "All Reviewer submissions for this workspace are reviewed.",
  };

  const awaitingProof = reviewed.filter(
    (i) => i.state === "APPROVED_PENDING_PROOF",
  );
  const packReady = reviewed.filter(
    (i) => APPROVED_TERMINAL_STATES.has(i.state) && i.pack_status === "COMPLETE",
  );
  const rejected = reviewed.filter((i) => REJECTED_STATES.has(i.state));

  const reviewedSections: LegalDashboardSection[] = [
    awaitingProof.length > 0
      ? {
          key: "awaiting-proof",
          title: "Awaiting Reviewer Proof Upload",
          count: awaitingProof.length,
          description: "Reviewer must upload disclosure proof",
          tone: "amber",
          table: true,
          rows: awaitingProof.map((i) => buildReviewedRow(i, "Legal", now)),
        }
      : null,
    packReady.length > 0
      ? {
          key: "pack-ready",
          title: "Evidence Pack Ready",
          count: packReady.length,
          description: "Approved and immutable download available",
          tone: "green",
          table: true,
          rows: packReady.map((i) => buildReviewedRow(i, "Legal", now)),
        }
      : null,
    rejected.length > 0
      ? {
          key: "rejected",
          title: "Rejected",
          count: rejected.length,
          description: "Sent back to Reviewer for resubmission",
          tone: "red",
          table: true,
          rows: rejected.map((i) => buildReviewedRow(i, "Legal", now)),
        }
      : null,
  ].filter(notNull);

  const reviewedTab: LegalDashboardTabData = {
    key: "reviewed",
    label: "Reviewed",
    count: reviewedAll.length,
    countTone: "blue",
    sections: reviewedSections,
    emptyTitle: "Nothing reviewed in this window",
    emptyBody:
      "Adjust the date range or check the Pending Review tab.",
  };

  return {
    role: "Legal",
    workspaceLabel,
    greeting: {
      title: `${greetingPrefix(now)}, ${approverName}`,
      sublineParts: ["Legal Approver", workspaceLabel ?? "Workspace", formatLongDate(now)],
    },
    kpis,
    tabs: [pendingTab, reviewedTab],
    defaultTabKey: "pending",
  };
}

function buildReviewerDashboard(
  queue: ApprovalQueueResponse,
  options: LegalDashboardAdapterOptions,
  now: Date,
): LegalDashboardData {
  const { workspaceLabel } = options;
  const items = queue.items ?? [];

  const pendingLegal = items.filter((i) => PENDING_STATES.has(i.state));
  const awaitingMyAction = items.filter(
    (i) =>
      i.state === "APPROVED_PENDING_PROOF" || REJECTED_STATES.has(i.state),
  );
  const approved = items.filter((i) => APPROVED_TERMINAL_STATES.has(i.state));

  const allRows = items.map((i) => buildReviewedRow(i, "Reviewer", now));
  const pendingLegalRows = pendingLegal.map((i) =>
    buildReviewedRow(i, "Reviewer", now),
  );
  const awaitingMyActionRows = awaitingMyAction.map((i) =>
    buildReviewedRow(i, "Reviewer", now),
  );
  const approvedRows = approved.map((i) =>
    buildReviewedRow(i, "Reviewer", now),
  );

  const tabs: LegalDashboardTabData[] = [
    {
      key: "all",
      label: "All submissions",
      count: items.length,
      countTone: "blue",
      sections:
        allRows.length > 0
          ? [
              {
                key: "all",
                title: "Your submissions",
                rows: allRows,
                table: true,
              },
            ]
          : [],
      emptyTitle: "No submissions yet",
      emptyBody: "Submit an asset for Legal approval from Pre-Flight to see it here.",
    },
    {
      key: "pending-legal",
      label: "Pending Legal review",
      count: pendingLegal.length,
      countTone: "blue",
      sections:
        pendingLegalRows.length > 0
          ? [
              {
                key: "pending-legal",
                title: "Awaiting Legal review",
                rows: pendingLegalRows,
                table: true,
              },
            ]
          : [],
      emptyTitle: "Nothing pending Legal review",
      emptyBody: "All your submissions have been reviewed.",
    },
    {
      key: "awaiting-action",
      label: "Awaiting my action",
      count: awaitingMyAction.length,
      countTone: "blue",
      sections:
        awaitingMyActionRows.length > 0
          ? [
              {
                key: "awaiting-action",
                title: "Action required",
                rows: awaitingMyActionRows,
                table: true,
              },
            ]
          : [],
      emptyTitle: "Nothing awaiting your action",
      emptyBody:
        "When Legal approves an asset that needs disclosure proof, or rejects an asset, it will show up here.",
    },
    {
      key: "approved",
      label: "Approved",
      count: approved.length,
      countTone: approved.length > 0 ? "blue" : "muted",
      sections:
        approvedRows.length > 0
          ? [
              {
                key: "approved",
                title: "Approved",
                rows: approvedRows,
                table: true,
              },
            ]
          : [],
      emptyTitle: "Nothing approved yet",
      emptyBody: "Approved submissions will appear here.",
    },
  ];

  const reviewerKpis: LegalDashboardKpi[] = [
    { label: "Total submitted", value: items.length },
    {
      label: "Pending Legal",
      value: pendingLegal.length,
      tone: pendingLegal.length > 0 ? "amber" : "neutral",
    },
    {
      label: "Awaiting my action",
      value: awaitingMyAction.length,
      tone: awaitingMyAction.length > 0 ? "red" : "neutral",
    },
    {
      label: "Approved",
      value: approved.length,
      tone: approved.length > 0 ? "green" : "neutral",
    },
  ];

  return {
    role: "Reviewer",
    workspaceLabel,
    greeting: {
      title: "My Submissions",
      sublineParts: ["Reviewer", workspaceLabel ?? "Workspace", formatLongDate(now)],
      highlightSuffix:
        awaitingMyAction.length > 0
          ? `${awaitingMyAction.length} awaiting your action`
          : undefined,
      highlightTone: "amber",
    },
    kpis: reviewerKpis,
    tabs,
    defaultTabKey: "all",
  };
}

function buildPendingRow(
  item: ApprovalQueueItem,
  _role: "Legal",
  now: Date,
): LegalDashboardRowData {
  const ageMin = item.age_minutes;
  const ageBadge = formatAge(ageMin);
  const ageColour = ageTone(ageMin);
  const priority = item.priority;

  return {
    approval_id: item.approval_id,
    approval_id_short: shortApprovalId(item.approval_id),
    preflight_run_id: item.preflight_run_id,
    asset_id: item.asset_id,
    asset_filename: item.asset_filename ?? item.asset_name ?? item.asset_id,
    modality: item.modality,
    thumbnail_url: item.thumbnail_url,
    state: item.state,
    policy_verdict_label: policyVerdictLabel(item.policy_verdict),
    submitted_by_name: item.submitted_by_name,
    submitted_at_label: formatSubmittedAt(item.submitted_at, now),
    age_label: ageBadge,
    age_tone: ageColour,
    age_caption: ageCaption(ageMin, priority),
    priority,
    priority_border:
      priority === 1 ? "red" : priority === 2 ? "amber" : "slate",
    action_summary: item.action_summary,
    action_chips: actionChipsFromSummary(item.action_summary),
    is_force_pass: item.is_force_pass,
    primary_action: {
      kind: "cta-button",
      label: "Review",
      href: `/preflight/${encodeURIComponent(item.preflight_run_id)}?r=legal`,
      tone: "primary",
    },
  };
}

function buildReviewedRow(
  item: ApprovalQueueItem,
  role: "Legal" | "Reviewer",
  now: Date,
): LegalDashboardRowData {
  const status = statusBadgeForReviewedRow(
    item.state,
    item.is_force_pass,
    role,
  );

  const submittedAt = formatSubmittedAt(item.submitted_at, now);
  const resolvedAt = formatResolvedAt(item.resolved_at, now);

  let submittedSubline: string | undefined;
  if (role === "Reviewer") {
    if (item.state === "APPROVED_PENDING_PROOF" && item.resolved_at) {
      submittedSubline = `Legal approved ${resolvedAt}`;
    } else if (
      APPROVED_TERMINAL_STATES.has(item.state) &&
      item.resolved_at
    ) {
      submittedSubline = `Approved ${resolvedAt}`;
    } else if (REJECTED_STATES.has(item.state) && item.resolved_at) {
      const engineHint =
        item.rejected_engines && item.rejected_engines.length > 0
          ? ` · ${item.rejected_engines[0].toString().toLowerCase()} unlocked`
          : "";
      submittedSubline = `Rejected ${resolvedAt}${engineHint}`;
    } else if (item.state === "UNDER_REVIEW" && item.age_label) {
      submittedSubline = `In Legal queue · ${item.age_label}`;
    } else if (item.state === "UNDER_REVIEW" && item.age_minutes != null) {
      submittedSubline = `In Legal queue · ${formatAge(item.age_minutes)}`;
    }
  }

  const packCell = packCellFor(item, role);

  const primary = primaryActionFor(item, role);

  return {
    approval_id: item.approval_id,
    approval_id_short: shortApprovalId(item.approval_id),
    preflight_run_id: item.preflight_run_id,
    asset_id: item.asset_id,
    asset_filename: item.asset_filename ?? item.asset_name ?? item.asset_id,
    modality: item.modality,
    thumbnail_url: item.thumbnail_url,
    state: item.state,
    status_label: status.label,
    status_tone: status.tone,
    status_subline: status.subline,
    policy_verdict_label: policyVerdictLabel(item.policy_verdict),
    submitted_by_name: item.submitted_by_name,
    submitted_at_label: submittedAt,
    submitted_subline: submittedSubline,
    resolved_at_label: resolvedAt,
    resolved_by_name: item.resolved_by_name,
    is_force_pass: item.is_force_pass,
    rejected_engines: item.rejected_engines,
    rejection_summary: item.rejection_notes,
    pack_cell: packCell,
    evidence_pack_id: item.evidence_pack_id,
    pack_download_url: item.pack_download_url,
    primary_action: primary,
  };
}

function packCellFor(
  item: ApprovalQueueItem,
  role: "Legal" | "Reviewer",
): LegalRowActionKind | undefined {
  if (item.state === "APPROVED_PENDING_PROOF") {
    if (role === "Legal") {
      return { kind: "text", label: "Pending Reviewer proof", tone: "neutral" };
    }
    return { kind: "text", label: "Generates after proof", tone: "muted" };
  }
  if (
    APPROVED_TERMINAL_STATES.has(item.state) &&
    item.pack_status === "COMPLETE"
  ) {
    const href = item.evidence_pack_id
      ? `/evidence/${encodeURIComponent(item.evidence_pack_id)}/preview`
      : item.pack_download_url ?? "#";
    return { kind: "link", label: "↓ Download PDF", href };
  }
  if (REJECTED_STATES.has(item.state)) {
    return role === "Legal"
      ? { kind: "text", label: "No pack generated", tone: "muted" }
      : { kind: "text", label: "—", tone: "muted" };
  }
  return { kind: "text", label: "—", tone: "muted" };
}

function primaryActionFor(
  item: ApprovalQueueItem,
  role: "Legal" | "Reviewer",
): LegalRowActionKind | undefined {
  if (role === "Legal") {
    return undefined;
  }
  if (item.state === "APPROVED_PENDING_PROOF") {
    return {
      kind: "cta-button",
      label: "Upload proof",
      href: `/preflight/${encodeURIComponent(item.preflight_run_id)}`,
      tone: "amber",
    };
  }
  if (REJECTED_STATES.has(item.state)) {
    return {
      kind: "cta-button",
      label: "Re-open Pre-Flight",
      href: `/preflight/${encodeURIComponent(item.preflight_run_id)}`,
      tone: "red",
    };
  }
  if (item.state === "UNDER_REVIEW" || PENDING_STATES.has(item.state)) {
    return { kind: "text", label: "Awaiting Legal", tone: "muted" };
  }
  return { kind: "text", label: "—", tone: "muted" };
}

function notNull<T>(v: T | null): v is T {
  return v != null;
}

function groupByPriority(items: ApprovalQueueItem[]): {
  critical: ApprovalQueueItem[];
  high: ApprovalQueueItem[];
  standard: ApprovalQueueItem[];
} {
  const sorted = [...items].sort(
    (a, b) => (b.age_minutes ?? 0) - (a.age_minutes ?? 0),
  );
  return {
    critical: sorted.filter((i) => i.priority === 1),
    high: sorted.filter((i) => i.priority === 2),
    standard: sorted.filter((i) => (i.priority ?? 3) >= 3),
  };
}

function filterByDateRange(
  items: ApprovalQueueItem[],
  filter: LegalDateFilter,
  now: Date,
): ApprovalQueueItem[] {
  if (filter === "all") return items;
  let cutoffMs = now.getTime();
  if (filter === "today") {
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    cutoffMs = startOfDay.getTime();
  } else if (filter === "7d") {
    cutoffMs = now.getTime() - 7 * 24 * 60 * 60 * 1000;
  } else if (filter === "30d") {
    cutoffMs = now.getTime() - 30 * 24 * 60 * 60 * 1000;
  }
  return items.filter((i) => {
    const at = i.resolved_at ?? i.submitted_at;
    if (!at) return true;
    const ms = Date.parse(at);
    if (Number.isNaN(ms)) return true;
    return ms >= cutoffMs;
  });
}
