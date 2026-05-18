import { cn } from "@/lib/utils";
import type { AssetDetailRow, AssetDetails } from "../types";

const EMPHASIS: Record<NonNullable<AssetDetailRow["emphasis"]>, string> = {
  amber: "text-amber-600",
  purple: "text-indigo-600",
};

interface Props {
  data: AssetDetails;
}

export function AssetDetailsCard({ data }: Props) {
  return (
    <div className="pb-4 pl-3.5 pr-4 pt-3">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Asset Details
      </h3>

      <dl className="space-y-1.5 text-[13px]">
        {data.rows.map((row, i) => (
          <div
            key={`${row.label}-${i}`}
            className="flex items-baseline justify-between gap-3"
          >
            <dt className="font-bold text-muted-foreground">{row.label}</dt>
            <dd
              className={cn(
                "truncate text-right font-semibold text-foreground",
                row.emphasis && EMPHASIS[row.emphasis],
              )}
              title={row.value}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
