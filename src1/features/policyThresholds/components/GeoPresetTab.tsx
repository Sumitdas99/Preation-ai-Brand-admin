import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChangesTakeEffectNotice,
  PresetComparisonCard,
  PresetSelectorCard,
  ResolutionOrderStrip,
} from "@/components/policyThresholds";
import { ValidationError } from "@/api/errors";
import type {
  GeoPresetId,
  PatchWorkspaceSettingsRequest,
  PolicyPreset,
  WorkspaceSettings,
} from "@/api/schemas/policyThresholds";
import { useToast } from "@/hooks/use-toast";
import { toGeoPresetTab } from "../adapters";

interface GeoPresetTabProps {
  settings: WorkspaceSettings;
  presets: PolicyPreset[];
  isSaving: boolean;
  onSave: (
    payload: PatchWorkspaceSettingsRequest,
  ) => Promise<WorkspaceSettings>;
}

export function GeoPresetTab({
  settings,
  presets,
  isSaving,
  onSave,
}: GeoPresetTabProps) {
  const { toast } = useToast();
  const tabData = useMemo(
    () => toGeoPresetTab(presets, settings.threshold_rows),
    [presets, settings.threshold_rows],
  );

  const [pendingPresetId, setPendingPresetId] = useState<GeoPresetId>(
    settings.geo_preset,
  );

  useEffect(() => {
    setPendingPresetId(settings.geo_preset);
  }, [settings.geo_preset]);

  const isDirty = pendingPresetId !== settings.geo_preset;

  const handleSave = async () => {
    if (!isDirty) return;
    try {
      await onSave({ geo_preset: pendingPresetId });
      toast({
        title: "Geo preset saved",
        description: `${pendingPresetId} will apply on the next preflight run.`,
      });
    } catch (err) {
      if (err instanceof ValidationError) {
        toast({
          variant: "destructive",
          title: "Geo preset rejected",
          description:
            "The selected preset was rejected by the policy engine.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Save failed",
          description:
            err instanceof Error ? err.message : "Unable to save preset.",
        });
      }
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">Geo Preset Override</h1>
          <p className="mt-1 max-w-3xl text-sm font-semibold leading-relaxed text-foreground/80">
            Select a geo regulatory profile to apply as the baseline for this
            workspace. Workspace-level overrides from the Per-category tab
            apply on top of the selected preset.
          </p>
        </div>
        <Button
          className="mt-0 w-full font-semibold sm:w-auto sm:shrink-0"
          onClick={handleSave}
          disabled={!isDirty || isSaving}
        >
          {isSaving ? "Saving…" : "Save preset"}
        </Button>
      </div>

      <ChangesTakeEffectNotice
        body={
          <>
            Assets already evaluated under the previous preset are not
            re-evaluated. Run a new preflight check to apply the new preset to
            an existing asset.
          </>
        }
      />

      <PresetSelectorCard
        presets={tabData.presets}
        pendingPresetId={pendingPresetId}
        activePresetId={settings.geo_preset}
        onSelect={setPendingPresetId}
        intro={
          <ResolutionOrderStrip
            active="geo-preset"
            description="Workspace overrides take precedence over geo preset values. Categories not set by the selected preset use system defaults."
          />
        }
      />

      <PresetComparisonCard
        baselinePresetId={tabData.baselinePresetId}
        pendingPresetId={pendingPresetId}
        presetIds={tabData.presetIds}
        rows={tabData.comparisonRows}
        lockedRows={tabData.lockedComparisonRows}
        lockedMessage={tabData.lockedMessage}
      />
    </div>
  );
}
