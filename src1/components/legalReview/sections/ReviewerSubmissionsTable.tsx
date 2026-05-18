import { cn } from "@/lib/utils";
import type { LegalDashboardSection } from "../types";
import { ReviewedRow } from "../cards/ReviewedRow";

interface Props {
  section: LegalDashboardSection;
  className?: string;
}

const HEADERS = [
  { key: "asset", label: "Asset", col: "col-span-4 pl-4" },
  { key: "submitted", label: "Submitted", col: "col-span-2" },
  { key: "status", label: "Status", col: "col-span-2" },
  { key: "evidence", label: "Evidence pack", col: "col-span-2" },
  {
    key: "action",
    label: "Action",
    col: "col-span-2 text-right pr-4",
  },
];

export function ReviewerSubmissionsTable({ section, className }: Props) {
  return (
    <div className={cn("flex flex-col", className)}>
      <div className="rounded-t-lg border border-border bg-muted/60">
        <div className="grid grid-cols-12 gap-x-4 px-4 py-2 text-[12px] font-extrabold uppercase tracking-wider text-foreground/80">
          {HEADERS.map((h) => (
            <div key={h.key} className={h.col}>
              {h.label}
            </div>
          ))}
        </div>
      </div>

      <div className="flex">
        <div className="w-1 shrink-0 rounded-bl-lg bg-slate-700" />
        <div className="min-w-0 flex-1 overflow-hidden rounded-br-lg border-b border-r border-border">
          {section.rows.map((row) => (
            <ReviewedRow
              key={row.approval_id}
              row={row}
              variant="reviewer"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
