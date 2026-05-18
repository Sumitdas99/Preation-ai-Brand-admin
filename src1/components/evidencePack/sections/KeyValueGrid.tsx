import { cn } from "@/lib/utils";
import type { EvidencePackKeyValue } from "../types";

interface Props {
  rows: EvidencePackKeyValue[];
  columns?: 2 | 3;
}

export function KeyValueGrid({ rows, columns = 2 }: Props) {
  if (rows.length === 0) return null;
  return (
    <dl
      className={cn(
        "grid gap-x-6 gap-y-4",
        columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2",
      )}
    >
      {rows.map((row, idx) => (
        <KeyValueRow key={`${row.label}-${idx}`} row={row} />
      ))}
    </dl>
  );
}

export function KeyValueRow({ row }: { row: EvidencePackKeyValue }) {
  const valueClass = cn(
    "mt-0.5 break-words text-sm font-semibold",
    row.tone === "muted"
      ? "text-muted-foreground"
      : row.tone === "warning"
        ? "font-bold text-amber-700"
        : row.tone === "approved"
          ? "font-bold text-emerald-700"
          : "text-foreground",
    row.tone === "mono" && "font-mono",
    row.truncate && "truncate",
  );
  return (
    <div className="min-w-0">
      <dt className="text-sm font-bold uppercase tracking-wider text-slate-500">
        {row.label}
      </dt>
      <dd className={valueClass} title={row.truncate ? row.value : undefined}>
        {row.value}
      </dd>
    </div>
  );
}
