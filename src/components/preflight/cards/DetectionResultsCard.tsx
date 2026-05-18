import { AlertCircle, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { DetectorRow } from "../rows/DetectorRow";
import type { DetectionResults } from "../types";

interface Props {
  data: DetectionResults;
}

export function DetectionResultsCard({ data }: Props) {
  return (
    <section className="@container border-b border-border px-6 py-4">
      <header className="mb-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Detection Results
        </h2>
      </header>

      <Body data={data} />
    </section>
  );
}

function Body({ data }: Props) {
  switch (data.mode) {
    case "skeleton":
      return <SkeletonBody />;
    case "normal":
      return <NormalBody data={data} />;
    case "system-error":
      return <SystemErrorBody />;
  }
}

function NormalBody({ data }: Props) {
  return (
    <div className="grid grid-cols-[12rem_1fr_3.5rem_auto] items-center gap-x-4">
      {data.rows.map((row, i) => (
        <DetectorRow
          key={`${row.label}-${i}`}
          row={row}
          last={i === data.rows.length - 1}
        />
      ))}
    </div>
  );
}

function SystemErrorBody() {
  return (
    <div>
      <div className="mb-2 flex items-start gap-3 rounded-md border border-dashed border-amber-400 bg-amber-50/60 px-4 py-3">
        <AlertCircle
          className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
          aria-hidden
        />
        <span className="text-sm font-medium text-amber-800/90">
          Policy evaluation did not complete. Raw detector scores cannot be
          interpreted as compliance conclusions.
        </span>
      </div>

      <SkeletonRows />
    </div>
  );
}

const SKELETON_ROWS = [
  { label: "w-56", delay: "[animation-delay:0ms]" },
  { label: "w-48", delay: "[animation-delay:150ms]" },
  { label: "w-60", delay: "[animation-delay:300ms]" },
  { label: "w-44", delay: "[animation-delay:450ms]" },
  { label: "w-52", delay: "[animation-delay:600ms]" },
];

function SkeletonBody() {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-2.5">
        <Loader2
          className="h-3.5 w-3.5 shrink-0 animate-spin stroke-[3] text-muted-foreground"
          aria-hidden
        />
        <span className="text-sm font-semibold text-muted-foreground">
          Results populating as each detector responds. Scores will appear below once available.
        </span>
      </div>

      <SkeletonRows />
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {SKELETON_ROWS.map((row, i) => (
        <div
          key={i}
          className="border-b-2 border-border py-2.5 last:border-b-0"
        >
          <Skeleton
            className={cn(
              "h-8 w-full rounded-sm bg-muted-foreground/20 md:hidden",
              row.delay,
            )}
          />
          <div className="hidden items-center gap-4 md:flex">
            <Skeleton
              className={cn(
                "h-7 shrink-0 rounded-sm bg-muted-foreground/20",
                row.label,
                row.delay,
              )}
            />
            <Skeleton
              className={cn(
                "h-5 flex-1 rounded-sm bg-muted-foreground/20",
                row.delay,
              )}
            />
            <Skeleton
              className={cn(
                "h-6 w-12 shrink-0 rounded-sm bg-muted-foreground/20",
                row.delay,
              )}
            />
            <Skeleton
              className={cn(
                "h-8 w-28 shrink-0 rounded-sm bg-muted-foreground/20",
                row.delay,
              )}
            />
          </div>
        </div>
      ))}
    </>
  );
}
