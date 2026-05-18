import { useMemo, useState } from "react";
import type { LegalDashboardTabData, LegalDashboardSection } from "../types";
import { FilterBarCell } from "../layout/FilterBar";
import {
  DateFilterChips,
  type DateFilterValue,
} from "../layout/DateFilterChips";
import { FilterDropdown, type FilterOption } from "../primitives/FilterDropdown";

const ALL_VALUE = "__all__";

export function useReviewedFilters(
  tab: LegalDashboardTabData,
  dateFilter: DateFilterValue,
  onDateFilterChange: (v: DateFilterValue) => void,
) {
  const [approverFilter, setApproverFilter] = useState<string>(ALL_VALUE);
  const [statusFilter, setStatusFilter] = useState<string>(ALL_VALUE);

  const { approverOptions, statusOptions } = useMemo(() => {
    const approverSet = new Set<string>();
    const statusSet = new Set<string>();
    for (const section of tab.sections) {
      for (const row of section.rows) {
        if (row.resolved_by_name) approverSet.add(row.resolved_by_name);
        if (row.status_label) statusSet.add(row.status_label);
      }
    }
    const approverOpts: FilterOption[] = [
      { value: ALL_VALUE, label: "All" },
      ...[...approverSet].sort().map((n) => ({ value: n, label: n })),
    ];
    const statusOpts: FilterOption[] = [
      { value: ALL_VALUE, label: "All" },
      ...[...statusSet].sort().map((s) => ({ value: s, label: s })),
    ];
    return { approverOptions: approverOpts, statusOptions: statusOpts };
  }, [tab.sections]);

  const filteredSections = useMemo<LegalDashboardSection[]>(() => {
    if (approverFilter === ALL_VALUE && statusFilter === ALL_VALUE) {
      return tab.sections;
    }
    return tab.sections
      .map((section) => ({
        ...section,
        rows: section.rows.filter((row) => {
          const approverOk =
            approverFilter === ALL_VALUE ||
            row.resolved_by_name === approverFilter;
          const statusOk =
            statusFilter === ALL_VALUE || row.status_label === statusFilter;
          return approverOk && statusOk;
        }),
      }))
      .filter((s) => s.rows.length > 0);
  }, [tab.sections, approverFilter, statusFilter]);

  const filterCells = (
    <>
      <DateFilterChips
        value={dateFilter}
        onChange={onDateFilterChange}
      />
      <FilterBarCell>
        <FilterDropdown
          label="Approver:"
          value={approverFilter}
          onChange={setApproverFilter}
          options={approverOptions}
        />
      </FilterBarCell>
      <FilterBarCell>
        <FilterDropdown
          label="Status:"
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
        />
      </FilterBarCell>
    </>
  );

  return { filterCells, filteredSections };
}
