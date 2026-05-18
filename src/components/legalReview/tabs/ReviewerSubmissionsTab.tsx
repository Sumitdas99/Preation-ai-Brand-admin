import type { LegalDashboardTabData } from "../types";
import { ReviewerSubmissionsTable } from "../sections/ReviewerSubmissionsTable";
import { EmptyState } from "../sections/EmptyState";

interface Props {
  tab: LegalDashboardTabData;
  totalCount: number;
}

export function ReviewerSubmissionsTab({ tab }: Props) {
  return (
    <div className="flex flex-col gap-4 px-6 py-4">
      {tab.sections.length === 0 || tab.sections[0].rows.length === 0 ? (
        <EmptyState
          title={tab.emptyTitle ?? "No submissions yet"}
          body={tab.emptyBody}
        />
      ) : (
        tab.sections.map((section) => (
          <ReviewerSubmissionsTable key={section.key} section={section} />
        ))
      )}
    </div>
  );
}
