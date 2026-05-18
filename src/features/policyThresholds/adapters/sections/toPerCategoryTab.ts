import type { ThresholdRow } from "@/api/schemas/policyThresholds";

export interface PerCategoryTabSection {
  syntheticRows: ThresholdRow[];
  brandRows: ThresholdRow[];
  lockedRows: ThresholdRow[];
  brandConfigurableCount: number;
  brandLockedCount: number;
  syntheticConfigurableCount: number;
}

export function toPerCategoryTab(rows: ThresholdRow[]): PerCategoryTabSection {
  const syntheticRows = rows.filter((row) => row.kind === "synthetic_block");
  const brandRows = rows.filter(
    (row) => row.kind === "brand_block" && !row.locked,
  );
  const lockedRows = rows.filter(
    (row) => row.kind === "system_locked_block" || row.locked,
  );
  return {
    syntheticRows,
    brandRows,
    lockedRows,
    syntheticConfigurableCount: syntheticRows.filter((r) => !r.locked).length,
    brandConfigurableCount: brandRows.length,
    brandLockedCount: lockedRows.length,
  };
}
