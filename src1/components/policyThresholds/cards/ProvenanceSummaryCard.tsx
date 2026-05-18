import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProvenanceSummary } from "@/api/schemas/policyThresholds";
import { ProvenanceSummaryStat } from "../primitives/ProvenanceSummaryStat";

interface ProvenanceSummaryCardProps {
  summary?: ProvenanceSummary;
  isPending: boolean;
}

const formatPercent = (n: number) => `${Math.round(n)}%`;

export function ProvenanceSummaryCard({
  summary,
  isPending,
}: ProvenanceSummaryCardProps) {
  return (
    <Card className="overflow-hidden">
      <header className="flex items-start justify-between gap-4 border-b bg-muted/30 px-5 py-4">
        <h2 className="text-xl font-[550] text-slate-700">
          Workspace Provenance Summary
        </h2>
      </header>
      <div className="grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {isPending || !summary ? (
          <>
            <div className="px-6 py-5">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="mt-3 h-4 w-44" />
              <Skeleton className="mt-2 h-3 w-28" />
            </div>
            <div className="px-6 py-5">
              <Skeleton className="h-10 w-16" />
              <Skeleton className="mt-3 h-4 w-36" />
              <Skeleton className="mt-2 h-3 w-32" />
            </div>
            <div className="px-6 py-5">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="mt-3 h-4 w-52" />
              <Skeleton className="mt-2 h-3 w-24" />
            </div>
          </>
        ) : (
          <>
            <ProvenanceSummaryStat
              value={formatPercent(summary.assets_with_c2pa_embedded_percent)}
              label="Assets with C2PA embedded"
              caption={summary.window_label}
            />
            <ProvenanceSummaryStat
              value={summary.embedding_failures_count}
              label="Embedding failures"
              caption="Logged for review"
            />
            <ProvenanceSummaryStat
              value={formatPercent(
                summary.evidence_packs_with_provenance_record_percent,
              )}
              label="Evidence Packs with provenance record"
              caption="Failures noted"
            />
          </>
        )}
      </div>
    </Card>
  );
}
