import { useEffect, useMemo, useState } from "react";
import { Bell, Blocks, Building2, SlidersHorizontal } from "lucide-react";
import {
  PolicyThresholdsTabs,
  PolicyThresholdsTopBar,
  type PolicyThresholdTabId,
} from "@/components/policyThresholds";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { toPolicyThresholdsData } from "@/features/policyThresholds/adapters";
import { GeoPresetTab } from "@/features/policyThresholds/components/GeoPresetTab";
import { PerCategoryTab } from "@/features/policyThresholds/components/PerCategoryTab";
import { PolicyThresholdsErrorScreen } from "@/features/policyThresholds/components/PolicyThresholdsErrorScreen";
import { PolicyThresholdsSkeleton } from "@/features/policyThresholds/components/PolicyThresholdsSkeleton";
import { ProvenanceTab } from "@/features/policyThresholds/components/ProvenanceTab";
import { DevPolicyThresholdsPanel } from "@/features/policyThresholds/dev/DevPolicyThresholdsPanel";
import { usePolicyThresholds } from "@/features/policyThresholds/hooks";
import { setPolicyThresholdsScenario } from "@/api/policyThresholdsScenario";
import { USE_MSW } from "@/lib/env";
import { cn } from "@/lib/utils";

const DEMO_WORKSPACE_ID = "ws_demo_acme_eu";

const workspaceNav = [
  {
    id: "policy-thresholds",
    label: "Policy Thresholds",
    icon: SlidersHorizontal,
    active: true,
  },
  { id: "brand-settings", label: "Brand Settings", icon: Building2, active: false },
  { id: "notifications", label: "Notifications", icon: Bell, active: false },
  { id: "integrations", label: "Integrations", icon: Blocks, active: false },
];

function WorkspaceNav({
  onItemSelect,
  inDrawer = false,
}: {
  onItemSelect?: () => void;
  inDrawer?: boolean;
}) {
  return (
    <>
      <p className="mb-3 px-6 text-xs font-extrabold uppercase tracking-wide text-foreground/70">
        Workspace
      </p>
      <nav className="space-y-1">
        {workspaceNav.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              disabled={!item.active}
              onClick={item.active ? onItemSelect : undefined}
              className={cn(
                "relative flex w-full items-center gap-3 px-6 py-2.5 text-left text-sm font-bold transition-colors",
                item.active
                  ? "bg-blue-50 text-[#0A1F44]"
                  : "text-muted-foreground",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {item.label}
              {item.active && !inDrawer ? (
                <span
                  aria-hidden
                  className="absolute bottom-px right-[-1px] top-px w-[3px] bg-[#0A1F44]"
                />
              ) : null}
            </button>
          );
        })}
      </nav>
    </>
  );
}

export default function PolicyThresholds() {
  const [activeTab, setActiveTab] =
    useState<PolicyThresholdTabId>("per-category");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth >= 768) setMobileNavOpen(false);
    };
    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, []);
  const {
    settings,
    presets,
    provenanceSummary,
    isPending,
    isProvenancePending,
    error,
    refetch,
    saveSettingsAsync,
    isSaving,
  } = usePolicyThresholds(DEMO_WORKSPACE_ID, {
    loadProvenanceSummary: activeTab === "provenance",
  });

  const pageData = useMemo(() => {
    if (!settings || !presets) return null;
    return toPolicyThresholdsData(settings, presets, provenanceSummary);
  }, [settings, presets, provenanceSummary]);

  if (isPending) {
    return (
      <>
        <PolicyThresholdsSkeleton />
        <DevPolicyThresholdsPanel />
      </>
    );
  }
  if (error) {
    return (
      <>
        <PolicyThresholdsErrorScreen
          error={error}
          onRetry={refetch}
          onResetDemoAccess={
            USE_MSW
              ? () => {
                  setPolicyThresholdsScenario("default");
                  window.setTimeout(refetch, 0);
                }
              : undefined
          }
        />
        <DevPolicyThresholdsPanel />
      </>
    );
  }
  if (!pageData || !settings) return null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-muted/30">
      <PolicyThresholdsTopBar
        workspaceName={pageData.workspaceName}
        viewerRole={pageData.viewerRole}
        onMenuClick={() => setMobileNavOpen(true)}
      />

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent
          side="left"
          className="w-64 max-w-[80vw] border-r p-0 pt-[19px] sm:max-w-[18rem] md:hidden"
        >
          <WorkspaceNav
            inDrawer
            onItemSelect={() => setMobileNavOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-64 flex-shrink-0 border-r bg-background pb-4 pt-[19px] md:block">
          <WorkspaceNav />
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <PolicyThresholdsTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="mx-auto max-w-5xl">
              {activeTab === "per-category" ? (
                <PerCategoryTab
                  settings={settings}
                  isSaving={isSaving}
                  onSave={saveSettingsAsync}
                />
              ) : null}

              {activeTab === "geo-preset" ? (
                <GeoPresetTab
                  settings={settings}
                  presets={pageData.presets}
                  isSaving={isSaving}
                  onSave={saveSettingsAsync}
                />
              ) : null}

              {activeTab === "provenance" ? (
                <ProvenanceTab
                  settings={settings}
                  provenanceSummary={provenanceSummary}
                  isProvenancePending={isProvenancePending}
                  isSaving={isSaving}
                  onSave={saveSettingsAsync}
                />
              ) : null}
            </div>
          </main>
        </section>
      </div>

      <DevPolicyThresholdsPanel />
    </div>
  );
}
