import type { LegalDashboardTabData } from "../types";
import { PrioritySection } from "../sections/PrioritySection";
import { EmptyState } from "../sections/EmptyState";

interface Props {
  tab: LegalDashboardTabData;
}

export function PendingReviewTab({ tab }: Props) {
  return (
    <div className="flex flex-col gap-4 px-6 py-4">
      {tab.sections.length === 0 ? (
        <EmptyState
          title={tab.emptyTitle ?? "No approvals waiting"}
          body={tab.emptyBody}
        />
      ) : (
        tab.sections.map((section) => (
          <PrioritySection key={section.key} section={section} />
        ))
      )}
    </div>
  );
}
