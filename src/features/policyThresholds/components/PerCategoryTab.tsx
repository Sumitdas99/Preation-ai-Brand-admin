import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  BooleanLockedRow,
  ChangesTakeEffectNotice,
  LockedThresholdRow,
  SystemLockedDivider,
  ThresholdRow,
  ThresholdSectionCard,
} from "@/components/policyThresholds";
import { ValidationError } from "@/api/errors";
import type {
  PatchWorkspaceSettingsRequest,
  ThresholdRow as ThresholdRowSchema,
  WorkspaceSettings,
} from "@/api/schemas/policyThresholds";
import { useToast } from "@/hooks/use-toast";
import { toPerCategoryTab } from "../adapters";

interface PerCategoryTabProps {
  settings: WorkspaceSettings;
  isSaving: boolean;
  onSave: (
    payload: PatchWorkspaceSettingsRequest,
  ) => Promise<WorkspaceSettings>;
}

const buildInitialValues = (rows: ThresholdRowSchema[]) => {
  const map: Record<string, number> = {};
  rows.forEach((row) => {
    if (row.locked || row.display_as === "boolean") return;
    const baseline = row.geo_preset_baseline ?? row.system_default ?? 0;
    map[row.category_key] = row.workspace_override ?? baseline;
  });
  return map;
};

const GEO_PRESET_LABELS: Record<WorkspaceSettings["geo_preset"], string> = {
  EU_DEFAULT: "EU baseline",
  DE_STRICT: "Germany baseline",
  FR_STRICT: "France baseline",
  IT_STANDARD: "Italy baseline",
  ES_STANDARD: "Spain baseline",
};

const markerLabelFor = (
  row: ThresholdRowSchema,
  geoPresetLabel: string,
) => (row.category_key === "alcohol_block" ? `${geoPresetLabel}:` : "System default:");

export function PerCategoryTab({
  settings,
  isSaving,
  onSave,
}: PerCategoryTabProps) {
  const { toast } = useToast();
  const sections = useMemo(
    () => toPerCategoryTab(settings.threshold_rows),
    [settings.threshold_rows],
  );
  const initialValues = useMemo(
    () => buildInitialValues(settings.threshold_rows),
    [settings.threshold_rows],
  );

  const [values, setValues] = useState<Record<string, number>>(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const dirtyKeys = useMemo(
    () =>
      Object.keys(values).filter(
        (key) => Math.round((values[key] ?? 0) * 100) !==
          Math.round((initialValues[key] ?? 0) * 100),
      ),
    [values, initialValues],
  );
  const isDirty = dirtyKeys.length > 0;

  const handleChange = (categoryKey: string, next: number) => {
    setValues((prev) => ({ ...prev, [categoryKey]: next }));
  };

  const handleSave = async () => {
    if (!isDirty) return;
    try {
      await onSave({
        threshold_overrides: dirtyKeys.map((category_key) => ({
          category_key,
          value: values[category_key],
        })),
      });
      toast({
        title: "Thresholds saved",
        description: `${dirtyKeys.length} category override${
          dirtyKeys.length === 1 ? "" : "s"
        } applied to the next preflight run.`,
      });
    } catch (err) {
      if (err instanceof ValidationError) {
        toast({
          variant: "destructive",
          title: "Override rejected",
          description:
            "One or more thresholds are system-locked and cannot be overridden.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Save failed",
          description:
            err instanceof Error ? err.message : "Unable to save thresholds.",
        });
      }
    }
  };

  const geoPresetLabel = GEO_PRESET_LABELS[settings.geo_preset];

  const renderEditableRow = (row: ThresholdRowSchema) => {
    const baseline = row.geo_preset_baseline ?? row.system_default ?? 0;
    const value = values[row.category_key] ?? baseline;
    return (
      <ThresholdRow
        key={row.category_key}
        label={row.label}
        description={row.description}
        badge={row.badge}
        value={value}
        baseline={baseline}
        markerValue={baseline}
        markerLabel={markerLabelFor(row, geoPresetLabel)}
        showLoweredChip={row.can_only_be_lowered}
        onChange={(next) => handleChange(row.category_key, next)}
      />
    );
  };

  const renderBrandRow = (row: ThresholdRowSchema) => {
    const baseline = row.geo_preset_baseline ?? row.system_default ?? 0;
    const value = values[row.category_key] ?? baseline;
    return (
      <ThresholdRow
        key={row.category_key}
        label={row.label}
        description={row.description}
        badge={row.badge}
        value={value}
        baseline={baseline}
        markerValue={baseline}
        markerLabel={markerLabelFor(row, geoPresetLabel)}
        showLoweredChip={row.can_only_be_lowered}
        onChange={(next) => handleChange(row.category_key, next)}
        sliderTheme="darkRed"
        valueClassName="text-[#cb2121]"
      />
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">Per-Category Thresholds</h1>
          <p className="mt-1 max-w-3xl text-sm font-semibold leading-relaxed text-foreground/80">
            Set the review and blocking limits for each detection category.
            Workspace limits can be made stricter than the active geo preset,
            but they cannot be raised above it.
          </p>
        </div>
        <Button
          className="mt-0 w-full font-semibold sm:w-auto sm:shrink-0"
          onClick={handleSave}
          disabled={!isDirty || isSaving}
        >
          {isSaving ? "Saving…" : "Save changes"}
        </Button>
      </div>

      <ChangesTakeEffectNotice />

      {sections.syntheticRows.length > 0 ? (
        <ThresholdSectionCard
          title="Synthetic Content Detection"
          description="Controls when AI-generated or synthetic media requires disclosure."
          configurableCount={sections.syntheticConfigurableCount}
        >
          {sections.syntheticRows.map(renderEditableRow)}
        </ThresholdSectionCard>
      ) : null}

      {sections.brandRows.length + sections.lockedRows.length > 0 ? (
        <ThresholdSectionCard
          title="Brand Suitability Block Thresholds"
          description="These are block thresholds for brand safety categories. Flag thresholds are managed by the selected geo preset and cannot be changed here."
          configurableCount={sections.brandConfigurableCount}
          lockedCount={sections.brandLockedCount}
        >
          {sections.brandRows.map(renderBrandRow)}
          {sections.lockedRows.length > 0 ? (
            <div className="opacity-80">
              <SystemLockedDivider />
              {sections.lockedRows.map((row) => {
                if (row.display_as === "boolean") {
                  return (
                    <BooleanLockedRow
                      key={row.category_key}
                      label={row.label}
                      description={row.description}
                    />
                  );
                }
                return (
                  <LockedThresholdRow
                    key={row.category_key}
                    label={row.label}
                    description={row.description}
                    systemDefault={
                      row.system_default ?? row.geo_preset_baseline ?? 0
                    }
                    sliderTheme="darkRed"
                  />
                );
              })}
            </div>
          ) : null}
        </ThresholdSectionCard>
      ) : null}
    </div>
  );
}
