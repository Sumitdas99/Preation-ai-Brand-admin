import type { LegalDashboardRowData } from "../types";
import { Thumbnail } from "../primitives/Thumbnail";
import { ForcePassBadge } from "../primitives/ForcePassBadge";
import { StatusDot } from "../primitives/StatusDot";
import { RowActionCell } from "../primitives/RowActionCell";

interface Props {
  row: LegalDashboardRowData;
  variant: "legal-reviewed" | "reviewer";
}

export function ReviewedRow({ row, variant }: Props) {
  if (variant === "legal-reviewed") {
    return (
      <div className="grid grid-cols-12 items-center gap-x-4 border-b border-border bg-white px-4 py-3 transition-colors last:border-b-0 hover:bg-slate-50/60">
        <div className="col-span-4 flex min-w-0 items-center gap-3">
          <Thumbnail
            modality={row.modality}
            thumbnailUrl={row.thumbnail_url}
            alt={row.asset_filename}
          />
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <span className="truncate text-sm font-bold text-foreground">
                {row.asset_filename}
              </span>
              {row.is_force_pass ? <ForcePassBadge /> : null}
            </div>
            {row.approval_id_short ? (
              <div className="mt-0.5 font-mono text-[11px] font-bold text-foreground/70">
                {row.approval_id_short}
              </div>
            ) : null}
          </div>
        </div>
        <div className="col-span-2 text-sm font-semibold text-gray-700">
          {row.resolved_at_label ?? row.submitted_at_label ?? "—"}
        </div>
        <div className="col-span-2 text-sm font-semibold text-gray-700">
          {row.resolved_by_name ?? row.submitted_by_name ?? "—"}
        </div>
        <div className="col-span-2">
          {row.status_label ? (
            <StatusDot
              tone={row.status_tone ?? "neutral"}
              label={row.status_label}
              subline={row.status_subline}
            />
          ) : null}
        </div>
        <div className="col-span-2 flex justify-end">
          <RowActionCell action={row.pack_cell} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 items-center gap-x-4 border-b border-border bg-white px-4 py-3 transition-colors last:border-b-0 hover:bg-slate-50/60">
      <div className="col-span-4 flex min-w-0 items-center gap-3">
        <Thumbnail
          modality={row.modality}
          thumbnailUrl={row.thumbnail_url}
          alt={row.asset_filename}
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold text-foreground">
            {row.asset_filename}
          </div>
          {row.submitted_subline ? (
            <div className="mt-0.5 text-[12px] font-medium text-muted-foreground">
              {row.submitted_subline}
            </div>
          ) : null}
        </div>
      </div>
      <div className="col-span-2 text-sm font-semibold text-gray-700">
        {row.submitted_at_label ?? "—"}
      </div>
      <div className="col-span-2">
        {row.status_label ? (
          <StatusDot
            tone={row.status_tone ?? "neutral"}
            label={row.status_label}
            subline={row.status_subline}
          />
        ) : null}
      </div>
      <div className="col-span-2">
        <RowActionCell action={row.pack_cell} />
      </div>
      <div className="col-span-2 flex justify-end">
        <RowActionCell action={row.primary_action} />
      </div>
    </div>
  );
}
