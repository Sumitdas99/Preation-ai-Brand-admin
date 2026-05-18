import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LegalDashboardRowData } from "../types";
import { Thumbnail } from "../primitives/Thumbnail";
import { VerdictBadge } from "../primitives/VerdictBadge";
import { ActionChip } from "../primitives/ActionChip";
import { ForcePassBadge } from "../primitives/ForcePassBadge";

interface Props {
  row: LegalDashboardRowData;
}

export function PendingRowCard({ row }: Props) {
  const href =
    row.primary_action?.kind === "cta-button"
      ? row.primary_action.href
      : undefined;

  const content = (
    <>
      <Thumbnail
        modality={row.modality}
        thumbnailUrl={row.thumbnail_url}
        alt={row.asset_filename}
      />

      <div className="flex min-w-0 flex-shrink basis-[16rem] flex-col">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-[15px] font-bold text-foreground">
            {row.asset_filename}
          </span>
          {row.is_force_pass ? <ForcePassBadge /> : null}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs font-bold text-foreground/70">
          {row.submitted_by_name ? (
            <span>{row.submitted_by_name}</span>
          ) : null}
          {row.age_label ? (
            <span className="whitespace-nowrap">{row.age_label} ago</span>
          ) : null}
        </div>
        {row.age_caption ? (
          <div
            className={cn(
              "mt-1 text-[12px] font-[650] leading-snug",
              row.age_tone === "red"
                ? "text-red-700"
                : row.age_tone === "amber"
                  ? "text-amber-700"
                  : "text-muted-foreground",
            )}
          >
            {row.age_caption}
          </div>
        ) : null}
      </div>

      <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
        {row.policy_verdict_label ? (
          <VerdictBadge verdict={row.policy_verdict_label} />
        ) : null}

        {row.action_chips && row.action_chips.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {row.action_chips.map((chip) => (
              <ActionChip key={chip} label={chip} />
            ))}
          </div>
        ) : null}

        <ChevronRight className="h-7 w-7 shrink-0 text-foreground/80" aria-hidden />
      </div>
    </>
  );

  const classes =
    "group flex items-center gap-x-4 border-b border-border bg-card px-4 py-3 transition-colors hover:bg-muted/50 last:border-b-0";

  if (href) {
    return (
      <Link to={href} className={classes}>
        {content}
      </Link>
    );
  }

  return <article className={classes}>{content}</article>;
}
