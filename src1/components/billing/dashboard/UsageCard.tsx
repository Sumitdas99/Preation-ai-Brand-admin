import { Activity, Info, Plus } from "lucide-react";
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
        "overflow-hidden rounded-lg border-[1.25px] border-slate-200 bg-card shadow-sm",
        className,
      )}
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-accent/30 px-6 py-3.5">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0A1F44] text-white">
            <Activity className="h-4 w-4" aria-hidden />
          </span>
          <h2 className="text-xl font-semibold leading-none text-slate-600">
            {block.title}
          </h2>
        </div>
        {block.sourceLabel ? (
          <p className="font-mono text-[11px] text-slate-500">
            {block.sourceLabel}
          </p>
        ) : null}
      </header>

      {block.variant === "empty" ? (
        <div className="px-6 py-5">
          <EmptyState
            title={block.emptyTitle ?? "Usage unavailable"}
            body={block.emptyBody}
          />
        </div>
      ) : (
        <div className="space-y-4 px-6 py-5">
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
            <div className="flex items-start gap-2.5 rounded-md bg-slate-100 px-4 py-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" strokeWidth={2.5} aria-hidden />
              <p className="text-xs font-semibold leading-relaxed text-slate-700">
                {block.footerNote}
              </p>
            </div>
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
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-500 bg-slate-50/50 px-6 py-10 text-center">
      <span className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-500 bg-white text-slate-600">
        <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
      </span>
      <p className="text-sm font-bold text-slate-800">{title}</p>
      {body ? <p className="text-xs font-bold text-slate-500">{body}</p> : null}
    </div>
  );
}
