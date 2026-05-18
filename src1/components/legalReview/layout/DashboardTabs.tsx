import { cn } from "@/lib/utils";
import type { LegalDashboardTabData, LegalDashboardTabKey } from "../types";
import type { ReactNode } from "react";

interface Props {
  tabs: LegalDashboardTabData[];
  activeKey: LegalDashboardTabKey;
  onChange: (key: LegalDashboardTabKey) => void;
  filterContent?: ReactNode;
  className?: string;
}

function countBadgeClass(
  tone: LegalDashboardTabData["countTone"],
  isActive: boolean,
): string {
  if (tone === "red") return "bg-red-600 text-white";
  if (tone === "amber") return "bg-amber-500 text-white";
  if (isActive) return "bg-[#0A1F44] text-white";
  if (tone === "blue") return "bg-slate-200 text-slate-600";
  return "bg-slate-200 text-slate-600";
}

export function DashboardTabs({
  tabs,
  activeKey,
  onChange,
  filterContent,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "flex w-full items-stretch bg-white shadow-[inset_0_-1px_0_0_theme(colors.border)]",
        className,
      )}
    >
      <div
        role="tablist"
        aria-label="Dashboard tabs"
        className="flex shrink-0 justify-start overflow-x-auto px-2 [scrollbar-width:none] sm:px-6 [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((tab) => {
          const isActive = tab.key === activeKey;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.key)}
              className={cn(
                "flex shrink-0 items-center justify-center gap-2 whitespace-nowrap border-b-[3px] px-4 py-3 text-sm font-bold transition-colors sm:px-8",
                isActive
                  ? "border-[#0A1F44] text-[#0A1F44]"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <span>{tab.label}</span>
              {typeof tab.count === "number" ? (
                <span
                  className={cn(
                    "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold tabular-nums",
                    countBadgeClass(tab.countTone, isActive),
                  )}
                >
                  {tab.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {filterContent ? (
        <div className="ml-auto flex items-stretch">{filterContent}</div>
      ) : null}
    </div>
  );
}
