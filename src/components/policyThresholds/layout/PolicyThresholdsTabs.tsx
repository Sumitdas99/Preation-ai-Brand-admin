import type {
  PolicyThresholdTab,
  PolicyThresholdTabId,
} from "@/components/policyThresholds/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tabs: PolicyThresholdTab[] = [
  { id: "per-category", label: "Per-category thresholds" },
  { id: "geo-preset", label: "Geo preset override", isNew: true },
  { id: "provenance", label: "Provenance settings", isNew: true },
];

interface Props {
  activeTab: PolicyThresholdTabId;
  onTabChange: (tab: PolicyThresholdTabId) => void;
}

export function PolicyThresholdsTabs({ activeTab, onTabChange }: Props) {
  return (
    <div className="relative flex justify-start overflow-x-auto border-b bg-background px-2 [scrollbar-width:none] sm:justify-around sm:px-6 [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "-mb-px flex shrink-0 items-center justify-center gap-2 whitespace-nowrap border-b-[3px] px-4 py-3 text-sm font-bold transition-colors sm:min-w-56 sm:px-8",
            activeTab === tab.id
              ? "border-[#0A1F44] text-[#0A1F44]"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {tab.label}
          {tab.isNew ? (
            <Badge
              className={cn(
                "rounded-sm px-1.5 py-0 text-[10px] font-bold tracking-wide",
                activeTab === tab.id
                  ? "border-[#0A1F44] bg-[#0A1F44] text-white"
                  : "border-transparent bg-slate-200 text-slate-600",
              )}
              variant="outline"
            >
              NEW
            </Badge>
          ) : null}
        </button>
      ))}
    </div>
  );
}
