import { cn } from "@/lib/utils";
import type { LegalDashboardSection } from "../types";
import { PendingRowCard } from "../cards/PendingRowCard";

interface Props {
  section: LegalDashboardSection;
  className?: string;
}

const TONE: Record<
  NonNullable<LegalDashboardSection["tone"]>,
  {
    headerBg: string;
    titleColour: string;
    descColour: string;
    countBg: string;
    bar: string;
  }
> = {
  red: {
    headerBg: "bg-red-50",
    titleColour: "text-red-900",
    descColour: "text-red-800",
    countBg: "bg-red-200 text-red-800",
    bar: "bg-red-700",
  },
  amber: {
    headerBg: "bg-amber-50",
    titleColour: "text-amber-900",
    descColour: "text-amber-800",
    countBg: "bg-amber-200 text-amber-800",
    bar: "bg-amber-500",
  },
  green: {
    headerBg: "bg-emerald-50",
    titleColour: "text-emerald-700",
    descColour: "text-emerald-600",
    countBg: "bg-emerald-200 text-emerald-800",
    bar: "bg-emerald-600",
  },
  muted: {
    headerBg: "bg-slate-50",
    titleColour: "text-slate-700",
    descColour: "text-slate-600",
    countBg: "bg-slate-200 text-slate-800",
    bar: "bg-slate-700",
  },
};

export function PrioritySection({ section, className }: Props) {
  const tone = TONE[section.tone ?? "muted"];
  return (
    <div className={cn("flex", className)}>
      <div className={cn("w-1 shrink-0", tone.bar)} />
      <section className="min-w-0 flex-1 overflow-hidden rounded-r-lg border-y border-r border-border">
        <header
          className={cn(
            "flex items-center gap-2 border-b border-border px-4 py-3",
            tone.headerBg,
          )}
        >
          {typeof section.count === "number" ? (
            <span
              className={cn(
                "inline-flex h-6 w-6 items-center justify-center rounded-full text-[13px] font-bold tabular-nums",
                tone.countBg,
              )}
            >
              {section.count}
            </span>
          ) : null}
          <span
            className={cn(
              "text-[15px] font-extrabold uppercase tracking-wider",
              tone.titleColour,
            )}
          >
            {section.title}
          </span>
          {section.description ? (
            <span className={cn("text-[13px] font-bold", tone.descColour)}>
              {section.description}
            </span>
          ) : null}
        </header>
        <div className="flex flex-col">
          {section.rows.map((row) => (
            <PendingRowCard key={row.approval_id} row={row} />
          ))}
        </div>
      </section>
    </div>
  );
}
