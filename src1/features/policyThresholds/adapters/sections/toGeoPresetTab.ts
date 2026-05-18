import type {
  GeoPresetId,
  PolicyPreset,
  ThresholdRow,
} from "@/api/schemas/policyThresholds";
import type {
  BaselineCell,
  ChangeCell,
  ComparisonLockedRowVm,
  ComparisonRowVm,
} from "@/components/policyThresholds/cards/PresetComparisonCard";
import {
  COMPARISON_TABLE_LOCKED_ORDER,
  COMPARISON_TABLE_ORDER,
  categoryLabelParts,
  isFlagCategory,
} from "@/components/policyThresholds/categoryLabels";

export interface GeoPresetTabData {
  baselinePresetId: GeoPresetId;
  presetIds: GeoPresetId[];
  presets: PolicyPreset[];
  comparisonRows: ComparisonRowVm[];
  lockedComparisonRows: ComparisonLockedRowVm[];
  lockedMessage: string;
}

const BASELINE_PRESET_ID: GeoPresetId = "EU_DEFAULT";

const LOCKED_MESSAGE =
  "Fixed at the system level and cannot be changed for any preset or workspace";

const fmtSuffix = (key: string): "flag" | "block" =>
  isFlagCategory(key) ? "flag" : "block";

const baselineCellFor = (
  baselineMap: Record<string, number>,
  key: string,
): BaselineCell =>
  Object.prototype.hasOwnProperty.call(baselineMap, key)
    ? { kind: "value", value: baselineMap[key] }
    : { kind: "absent" };

const sameValue = (a: number, b: number) =>
  Math.round(a * 100) === Math.round(b * 100);

const changeCellFor = (
  baselineMap: Record<string, number>,
  presetMap: Record<string, number>,
  key: string,
): ChangeCell => {
  const baselineHas = Object.prototype.hasOwnProperty.call(baselineMap, key);
  const presetHas = Object.prototype.hasOwnProperty.call(presetMap, key);
  if (!baselineHas && !presetHas) return { kind: "unchanged" };
  if (baselineHas && !presetHas) return { kind: "unchanged" };
  if (!baselineHas && presetHas) {
    return { kind: "adds", next: presetMap[key], suffix: fmtSuffix(key) };
  }
  if (sameValue(baselineMap[key], presetMap[key])) return { kind: "unchanged" };
  return {
    kind: "delta",
    previous: baselineMap[key],
    next: presetMap[key],
  };
};

const buildPresetMap = (preset: PolicyPreset | undefined) =>
  preset?.threshold_baselines ?? {};

const orderedRowKeys = (
  presets: PolicyPreset[],
  lockedKeys: Set<string>,
): string[] => {
  const known = new Set(COMPARISON_TABLE_ORDER);
  const seen = new Set<string>(COMPARISON_TABLE_ORDER);
  const extras: string[] = [];
  presets.forEach((preset) => {
    Object.keys(preset.threshold_baselines).forEach((key) => {
      if (lockedKeys.has(key)) return;
      if (seen.has(key)) return;
      seen.add(key);
      if (!known.has(key)) extras.push(key);
    });
  });
  return [...COMPARISON_TABLE_ORDER, ...extras];
};

const orderedLockedKeys = (
  presets: PolicyPreset[],
  lockedKeys: Set<string>,
): string[] => {
  const ordered = COMPARISON_TABLE_LOCKED_ORDER.filter((k) => lockedKeys.has(k));
  const seen = new Set(ordered);
  presets.forEach((preset) => {
    Object.keys(preset.threshold_baselines).forEach((key) => {
      if (!lockedKeys.has(key) || seen.has(key)) return;
      seen.add(key);
      ordered.push(key);
    });
  });
  return ordered;
};

export function toGeoPresetTab(
  presets: PolicyPreset[],
  thresholdRows: ThresholdRow[],
): GeoPresetTabData {
  const presetIds = presets.map((p) => p.preset_id);
  const baselinePreset = presets.find(
    (p) => p.preset_id === BASELINE_PRESET_ID,
  );
  const baselineMap = buildPresetMap(baselinePreset);

  const lockedKeys = new Set(
    thresholdRows
      .filter((row) => row.locked || row.kind === "system_locked_block")
      .map((row) => row.category_key),
  );

  const rowKeys = orderedRowKeys(presets, lockedKeys);
  const lockedRowKeys = orderedLockedKeys(presets, lockedKeys);

  const otherPresets = presets.filter(
    (p) => p.preset_id !== BASELINE_PRESET_ID,
  );

  const comparisonRows: ComparisonRowVm[] = rowKeys
    .filter((key) => {
      if (Object.prototype.hasOwnProperty.call(baselineMap, key)) return true;
      return otherPresets.some((p) =>
        Object.prototype.hasOwnProperty.call(p.threshold_baselines, key),
      );
    })
    .map((key) => {
      const changesByPreset = {} as Record<GeoPresetId, ChangeCell>;
      otherPresets.forEach((preset) => {
        changesByPreset[preset.preset_id] = changeCellFor(
          baselineMap,
          buildPresetMap(preset),
          key,
        );
      });
      return {
        categoryKey: key,
        labelParts: categoryLabelParts(key),
        baseline: baselineCellFor(baselineMap, key),
        changesByPreset,
      };
    });

  const lockedComparisonRows: ComparisonLockedRowVm[] = lockedRowKeys
    .filter((key) =>
      presets.some((p) =>
        Object.prototype.hasOwnProperty.call(p.threshold_baselines, key),
      ),
    )
    .map((key) => ({
      categoryKey: key,
      labelParts: categoryLabelParts(key),
      baseline: baselineCellFor(baselineMap, key),
    }));

  return {
    baselinePresetId: BASELINE_PRESET_ID,
    presetIds,
    presets,
    comparisonRows,
    lockedComparisonRows,
    lockedMessage: LOCKED_MESSAGE,
  };
}
