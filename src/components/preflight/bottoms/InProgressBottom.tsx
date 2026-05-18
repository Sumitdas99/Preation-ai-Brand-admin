import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AwaitingResultsPanel } from "../cards/AwaitingResultsPanel";
import type { PreFlightData } from "../types";

interface Props {
  data: PreFlightData;
}

export function InProgressBottom({ data }: Props) {
  if (data.verdict.kind !== "awaiting") return null;

  return (
    <section className="space-y-5 px-6 py-5">
      <AwaitingResultsPanel
        title={data.verdict.title}
        description={data.verdict.description}
      />

      <VerdictSkeleton header={data.verdict.header} />
    </section>
  );
}

function VerdictSkeleton({ header }: { header: string }) {
  return (
    <div>
      <header className="mb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {header}
        </h3>
      </header>

      <div>
        {VERDICT_SKELETON_ROWS.map((row, i) => (
          <div
            key={i}
            className="border-b-2 border-border py-2.5 last:border-b-0"
          >
            <div className="flex items-center gap-4">
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
                  "h-8 w-28 shrink-0 rounded-sm bg-muted-foreground/20",
                  row.delay,
                )}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const VERDICT_SKELETON_ROWS = [
  { label: "w-40", delay: "[animation-delay:0ms]" },
  { label: "w-52", delay: "[animation-delay:150ms]" },
  { label: "w-44", delay: "[animation-delay:300ms]" },
];
