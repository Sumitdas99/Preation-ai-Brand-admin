import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type SettingsTab = "thresholds" | "suitability" | "geo" | "integrations" | "team" | "billing";
type SettingsNavItem =
  | { id: SettingsTab; label: string }
  | { id: "policy-threshold-configuration"; label: string; href: string };

const settingsNav: SettingsNavItem[] = [
  { id: "thresholds" as SettingsTab, label: "Detection Thresholds" },
  {
    id: "policy-threshold-configuration",
    label: "Policy Threshold Configuration",
    href: "/settings/policy-thresholds",
  },
  { id: "suitability" as SettingsTab, label: "Brand Suitability" },
  { id: "geo" as SettingsTab, label: "Geo Policies" },
  { id: "integrations" as SettingsTab, label: "Integrations" },
  { id: "team" as SettingsTab, label: "Team & Roles" },
  { id: "billing" as SettingsTab, label: "Billing" },
];

const isSettingsTab = (item: SettingsNavItem): item is { id: SettingsTab; label: string } =>
  !("href" in item);

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("thresholds");
  const [syntheticThreshold, setSyntheticThreshold] = useState([70]);
  const [alcoholThreshold, setAlcoholThreshold] = useState([50]);
  const [minorThreshold, setMinorThreshold] = useState([30]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your detection thresholds have been updated successfully.",
    });
  };

  const applyPreset = (preset: string) => {
    toast({
      title: `${preset} Applied`,
      description: "Thresholds updated to preset configuration.",
    });
  };

  return (
    <div className="flex h-full bg-background">
      <aside className="w-64 border-r border-border bg-card p-4">
        <h2 className="mb-4 px-3 text-lg font-semibold text-foreground">Settings</h2>
        <nav className="space-y-1">
          {settingsNav.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (isSettingsTab(item)) {
                  setActiveTab(item.id);
                } else {
                  navigate(item.href);
                }
              }}
              className={cn(
                "w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                isSettingsTab(item) && activeTab === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        {activeTab === "thresholds" && (
          <Card>
            <CardHeader>
              <CardTitle>Detection Thresholds</CardTitle>
              <CardDescription>
                Configure threshold levels for content detection and flagging
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Synthetic Content Detection
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Assets above this threshold require AI disclosure
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-success">Allow</span>
                    <span className="font-medium text-primary">{syntheticThreshold[0]}%</span>
                    <span className="text-danger">Block</span>
                  </div>
                  <Slider
                    value={syntheticThreshold}
                    onValueChange={setSyntheticThreshold}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span className="text-warning">Flag</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-foreground">Alcohol Content</h3>
                  <p className="text-sm text-muted-foreground">
                    Strictness for alcohol-related content
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-success">Allow</span>
                    <span className="font-medium text-primary">{alcoholThreshold[0]}%</span>
                    <span className="text-danger">Block</span>
                  </div>
                  <Slider
                    value={alcoholThreshold}
                    onValueChange={setAlcoholThreshold}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span className="text-warning">Flag</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-foreground">Minor Detection</h3>
                  <p className="text-sm text-muted-foreground">
                    Sensitivity for detecting individuals under 18
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-success">Low</span>
                    <span className="font-medium text-primary">{minorThreshold[0]}%</span>
                    <span className="text-danger">High</span>
                  </div>
                  <Slider
                    value={minorThreshold}
                    onValueChange={setMinorThreshold}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span className="text-warning">Medium</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-foreground">Geographic Presets</h3>
                  <p className="text-sm text-muted-foreground">
                    Apply regional compliance presets
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-auto py-3"
                    onClick={() => applyPreset("EU Default")}
                  >
                    Apply EU Default
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-3"
                    onClick={() => applyPreset("Germany Strict")}
                  >
                    Apply Germany Strict
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-3"
                    onClick={() => applyPreset("France Beauty")}
                  >
                    Apply France Beauty
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-3"
                    onClick={() => applyPreset("Italy Fashion")}
                  >
                    Apply Italy Fashion
                  </Button>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSave} size="lg">
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab !== "thresholds" && (
          <Card>
            <CardHeader>
              <CardTitle>{settingsNav.find((n) => n.id === activeTab)?.label}</CardTitle>
              <CardDescription>This section is under construction</CardDescription>
            </CardHeader>
          </Card>
        )}
      </main>
    </div>
  );
}
