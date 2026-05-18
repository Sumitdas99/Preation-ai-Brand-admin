import type { LegalDashboardTabData, LegalDashboardSection } from "../types";
import { ReviewedSection } from "../sections/ReviewedSection";
import { EmptyState } from "../sections/EmptyState";

const COL_HEADERS = [
  { key: "asset",    label: "Asset",         col: "col-span-4" },
  { key: "approved", label: "Approved at",   col: "col-span-2" },
  { key: "reviewer", label: "Reviewer",      col: "col-span-2" },
  { key: "status",   label: "Status",        col: "col-span-2" },
  { key: "evidence", label: "Evidence pack", col: "col-span-2 text-right pr-8" },
];

interface Props {
  tab: LegalDashboardTabData;
  filteredSections: LegalDashboardSection[];
}

export function ReviewedTab({ tab, filteredSections }: Props) {
  if (filteredSections.length === 0) {
    return (
      <div className="px-6 py-4">
        <EmptyState
          title={
            tab.sections.length === 0
              ? (tab.emptyTitle ?? "Nothing reviewed in this window")
              : "No matches for the selected filters"
          }
          body={
            tab.sections.length === 0
              ? tab.emptyBody
              : "Try widening the date range or clearing the Approver / Status filters."
          }
        />
      </div>
    );
  }

  return (
    <div className="px-6 py-4">
      <div className="sticky top-0 z-10 rounded-t-lg border border-border bg-muted/60 backdrop-blur-sm">
        <div className="grid grid-cols-12 gap-x-4 pl-8 pr-4 py-2 text-[12px] font-extrabold uppercase tracking-wider text-foreground/80">
          {COL_HEADERS.map((h) => (
            <div key={h.key} className={h.col}>
              {h.label}
            </div>
          ))}
        </div>
      </div>

      {filteredSections.map((section, i) => (
        <ReviewedSection
          key={section.key}
          section={section}
          isLast={i === filteredSections.length - 1}
        />
      ))}
    </div>
  );
}
