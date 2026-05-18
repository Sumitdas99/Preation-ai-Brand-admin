import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  DashboardGreeting,
  DashboardTabs,
  DashboardTopBar,
  FilterBarCell,
  PendingReviewTab,
  ReviewedTab,
  ReviewerSubmissionsTab,
  useReviewedFilters,
  type DateFilterValue,
} from "@/components/legalReview";
import { FilterDropdown } from "@/components/legalReview/primitives/FilterDropdown";
import type { LegalDashboardTabKey } from "@/components/legalReview/types";
import {
  DevLegalDashboardPanel,
  LegalDashboardErrorScreen,
  LegalDashboardSkeleton,
} from "@/features/legalReview/components";
import { useApprovalQueue } from "@/features/legalReview/hooks";
import {
  toLegalDashboardData,
  type LegalDateFilter,
} from "@/features/legalReview/adapters";
import { useCurrentViewerRole } from "@/features/auth/useCurrentViewerRole";
import { MOCK_REVIEWER_ID, MOCK_WORKSPACE_ID } from "@/mocks/constants";
import { USE_MSW } from "@/lib/env";

const MOCK_NOW = new Date("2026-04-18T16:00:00Z");

const LEGAL_TABS: LegalDashboardTabKey[] = ["pending", "reviewed"];
const REVIEWER_TABS: LegalDashboardTabKey[] = [
  "all",
  "pending-legal",
  "awaiting-action",
  "approved",
];

const DATE_FILTERS: DateFilterValue[] = ["today", "7d", "30d", "all"];

export default function LegalDashboard() {
  const { role, setRole, canSwitchRole } = useCurrentViewerRole();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    document.title =
      role === "Legal"
        ? "Legal Approver Queue · Praetion AI"
        : "My Submissions · Praetion AI";
  }, [role]);

  const queueParams = useMemo(
    () =>
      role === "Legal"
        ? { workspace_id: MOCK_WORKSPACE_ID }
        : { submitted_by: MOCK_REVIEWER_ID },
    [role],
  );

  const { data, isPending, error, refetch } = useApprovalQueue(queueParams);

  const allowedTabs = role === "Legal" ? LEGAL_TABS : REVIEWER_TABS;
  const tabParam = searchParams.get("tab") as LegalDashboardTabKey | null;
  const activeTabKey: LegalDashboardTabKey =
    tabParam && (allowedTabs as string[]).includes(tabParam)
      ? tabParam
      : allowedTabs[0];

  const rangeParam = searchParams.get("range") as DateFilterValue | null;
  const dateFilter: DateFilterValue =
    rangeParam && (DATE_FILTERS as string[]).includes(rangeParam)
      ? rangeParam
      : "today";

  const setTab = (key: LegalDashboardTabKey) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("tab", key);
        if (key !== "reviewed") next.delete("range");
        return next;
      },
      { replace: true },
    );
  };
  const setRange = (next: DateFilterValue) => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        params.set("range", next);
        return params;
      },
      { replace: true },
    );
  };

  if (error && !data) {
    return (
      <Shell role={role}>
        <LegalDashboardErrorScreen error={error} onRetry={refetch} />
        {canSwitchRole && (
          <DevLegalDashboardPanel role={role} onRoleChange={setRole} />
        )}
      </Shell>
    );
  }

  if (isPending || !data) {
    return (
      <Shell role={role}>
        <LegalDashboardSkeleton />
        {canSwitchRole && (
          <DevLegalDashboardPanel role={role} onRoleChange={setRole} />
        )}
      </Shell>
    );
  }

  return (
    <LegalDashboardContent
      data={data}
      role={role}
      activeTabKey={activeTabKey}
      dateFilter={dateFilter}
      setTab={setTab}
      setRange={setRange}
      canSwitchRole={canSwitchRole}
      setRole={setRole}
    />
  );
}

function Shell({
  role,
  children,
}: {
  role: "Legal" | "Reviewer";
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <div className="bg-[#0A1F44] pb-4">
        <DashboardTopBar
          title={role === "Legal" ? "Legal Dashboard" : "My Submissions"}
          roleLabel={role === "Legal" ? "Legal / Approver" : "Reviewer"}
          userName={role === "Legal" ? "S. Chen" : "J. Martin"}
          workspace="Acme EU"
        />
      </div>
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto w-full max-w-[1180px]">{children}</div>
      </main>
    </div>
  );
}

function LegalDashboardContent({
  data,
  role,
  activeTabKey,
  dateFilter,
  setTab,
  setRange,
  canSwitchRole,
  setRole,
}: {
  data: import("@/api/schemas/approvals").ApprovalQueueResponse;
  role: "Legal" | "Reviewer";
  activeTabKey: LegalDashboardTabKey;
  dateFilter: DateFilterValue;
  setTab: (key: LegalDashboardTabKey) => void;
  setRange: (next: DateFilterValue) => void;
  canSwitchRole: boolean;
  setRole: (role: "Legal" | "Reviewer") => void;
}) {
  const dashboard = toLegalDashboardData(data, role, {
    workspaceLabel: "Acme EU",
    approverName: role === "Legal" ? "S. Chen" : "J. Martin",
    dateFilter: dateFilter as LegalDateFilter,
    now: USE_MSW ? MOCK_NOW : new Date(),
  });

  const activeTab =
    dashboard.tabs.find((t) => t.key === activeTabKey) ?? dashboard.tabs[0];

  const reviewedTab =
    dashboard.tabs.find((t) => t.key === "reviewed") ?? dashboard.tabs[0];
  const {
    filterCells: reviewedFilterCells,
    filteredSections: reviewedFilteredSections,
  } = useReviewedFilters(reviewedTab, dateFilter, setRange);

  const pendingFilterContent =
    role === "Legal" && activeTab.key === "pending" && dashboard.workspaceLabel
      ? (
          <FilterBarCell>
            <FilterDropdown
              label="Workspace:"
              value={dashboard.workspaceLabel!}
              onChange={() => {}}
              options={[
                {
                  value: dashboard.workspaceLabel!,
                  label: dashboard.workspaceLabel!,
                },
              ]}
            />
          </FilterBarCell>
        )
      : null;

  const filterContent =
    role === "Legal" && activeTab.key === "reviewed"
      ? reviewedFilterCells
      : pendingFilterContent;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <div className="bg-[#0A1F44]">
        <DashboardTopBar
          title={role === "Legal" ? "Legal Dashboard" : "My Submissions"}
          roleLabel={role === "Legal" ? "Legal / Approver" : "Reviewer"}
          userName={role === "Legal" ? "S. Chen" : "J. Martin"}
          workspace="Acme EU"
        />
        {dashboard.greeting ? (
          <DashboardGreeting
            greeting={dashboard.greeting}
            kpis={dashboard.kpis}
          />
        ) : null}
      </div>

      <DashboardTabs
        tabs={dashboard.tabs}
        activeKey={activeTab.key}
        onChange={setTab}
        filterContent={filterContent}
      />

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto w-full max-w-[1180px]">
          {role === "Legal" && activeTab.key === "pending" ? (
            <PendingReviewTab tab={activeTab} />
          ) : null}
          {role === "Legal" && activeTab.key === "reviewed" ? (
            <ReviewedTab
              tab={reviewedTab}
              filteredSections={reviewedFilteredSections}
            />
          ) : null}
          {role === "Reviewer" ? (
            <ReviewerSubmissionsTab
              tab={activeTab}
              totalCount={data.items.length}
            />
          ) : null}


        </div>
      </main>

      {canSwitchRole && (
        <DevLegalDashboardPanel role={role} onRoleChange={setRole} />
      )}
    </div>
  );
}
