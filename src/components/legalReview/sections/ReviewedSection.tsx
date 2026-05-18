import { cn } from "@/lib/utils";
import type { LegalDashboardSection } from "../types";
import { ReviewedRow } from "../cards/ReviewedRow";

interface Props {
  section: LegalDashboardSection;
  isLast?: boolean;
}

const TONE: Record<
  NonNullable<LegalDashboardSection["tone"]>,
  { bandBg: string; titleColour: string; descColour: string; countBg: string; accent: string }
> = {
  amber: {
    bandBg:      "bg-amber-50",
    titleColour: "text-amber-900",
    descColour:  "text-amber-800",
    countBg:     "bg-amber-200 text-amber-800",
    accent:      "bg-amber-400",
  },
  green: {
    bandBg:      "bg-emerald-50",
    titleColour: "text-emerald-800",
    descColour:  "text-emerald-700",
    countBg:     "bg-emerald-200 text-emerald-800",
    accent:      "bg-emerald-500",
  },
  red: {
    bandBg:      "bg-red-50",
    titleColour: "text-red-900",
    descColour:  "text-red-800",
    countBg:     "bg-red-200 text-red-800",
    accent:      "bg-red-500",
  },
  muted: {
    bandBg:      "bg-slate-50",
    titleColour: "text-slate-700",
    descColour:  "text-slate-600",
    countBg:     "bg-slate-200 text-slate-700",
    accent:      "bg-slate-400",
  },
};

export function ReviewedSection({ section, isLast }: Props) {
  const t = TONE[section.tone ?? "muted"];
  return (
    <div className="flex">
      <div className={cn("w-1 shrink-0", t.accent)} />

      <section
        className={cn(
          "min-w-0 flex-1 overflow-hidden border-b border-r border-border",
          isLast ? "rounded-br-lg" : "",
        )}
      >
        <div className={cn("flex items-center gap-2 border-b border-border px-4 py-2", t.bandBg)}>
          {typeof section.count === "number" ? (
            <span
              className={cn(
                "inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold tabular-nums",
                t.countBg,
              )}
            >
              {section.count}
            </span>
          ) : null}
          <span className={cn("text-[12px] font-extrabold uppercase tracking-wider", t.titleColour)}>
            {section.title}
          </span>
          {section.description ? (
            <span className={cn("text-[12px] font-bold", t.descColour)}>
              {section.description}
            </span>
          ) : null}
        </div>

        {section.rows.map((row) => (
          <ReviewedRow key={row.approval_id} row={row} variant="legal-reviewed" />
        ))}
      </section>
    </div>
  );
}
