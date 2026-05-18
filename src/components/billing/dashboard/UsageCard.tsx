import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UsageBlockVM } from "@/features/billing/adapters/toBillingDashboardData";
import { InlineNotice } from "../primitives/InlineNotice";
import { UsageMeterBar } from "./UsageMeterBar";

interface UsageCardProps {
  block: UsageBlockVM;
  className?: string;
}

export function UsageCard({ block, className }: UsageCardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5 shadow-sm",
        className,
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <h2 className="text-sm font-semibold text-slate-900">{block.title}</h2>
        {block.sourceLabel ? (
          <p className="font-mono text-[11px] text-slate-500">
            {block.sourceLabel}
          </p>
        ) : null}
      </header>

      {block.variant === "empty" ? (
        <EmptyState
          title={block.emptyTitle ?? "Usage unavailable"}
          body={block.emptyBody}
        />
      ) : (
        <div className="mt-4 space-y-4">
          {block.topNote ? (
            <InlineNotice tone={block.topNote.tone}>
              {block.topNote.body}
            </InlineNotice>
          ) : null}

          <div className="space-y-5">
            {block.meters.map((meter) => (
              <UsageMeterBar
                key={meter.key}
                meter={meter}
                greyedOut={block.isGreyedOut}
              />
            ))}
          </div>

          {block.footerNote ? (
            <p className="rounded-md bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-600">
              {block.footerNote}
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}

interface EmptyStateProps {
  title: string;
  body?: string;
}

function EmptyState({ title, body }: EmptyStateProps) {
  return (
    <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50/50 px-6 py-10 text-center">
      <span className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-400">
        <Plus className="h-4 w-4" aria-hidden />
      </span>
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {body ? <p className="text-xs text-slate-500">{body}</p> : null}
    </div>
  );
}
