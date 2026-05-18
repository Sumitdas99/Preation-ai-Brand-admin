import { AlertCircle, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AssetVersions } from "../types";

const ORIGINAL_PILL =
  "inline-flex shrink-0 items-center rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600";

const GOVERNANCE_PILL_BASE =
  "rounded px-1.5 py-0.5 text-[10px] font-bold leading-snug";

const GOVERNANCE_PILL_TONE = {
  embedded: "bg-emerald-100 text-emerald-700",
  embedding: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
} as const;

const SUBTITLE = "text-[12px] font-semibold leading-snug text-foreground";

const FILE_NAME =
  "truncate text-[12px] font-semibold leading-snug text-foreground";

interface Props {
  data: AssetVersions;
}

export function AssetVersionsCard({ data }: Props) {
  const isEmbedded = data.embedStatus === "embedded";
  const isWarning = !isEmbedded && Boolean(data.governanceFileName);
  const pillTone: keyof typeof GOVERNANCE_PILL_TONE = isEmbedded
    ? "embedded"
    : isWarning
      ? "warning"
      : "embedding";
  const pendingSuffix = data.governanceFileName
    ? "pending"
    : "available once embedding completes";

  return (
    <section className="pb-3 pl-3.5 pr-4 pt-3">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Asset Versions & Downloads
      </h3>

      <div className="-ml-0.5 space-y-3">
        <Card className="space-y-2 p-3">
          <div className="flex items-center gap-2">
            <span className={ORIGINAL_PILL}>{data.originalLabel}</span>
            <p className={SUBTITLE}>Original uploaded asset</p>
          </div>
          <p className={FILE_NAME} title={data.originalFileName}>
            {data.originalFileName}
          </p>
          <Button variant="outline" size="sm" className="w-full">
            <Download />
            Download original
          </Button>
        </Card>

        <Card
          className={cn(
            "space-y-2 p-3",
            isEmbedded
              ? "border-emerald-200 bg-emerald-50"
              : "border-amber-200 bg-amber-50",
          )}
        >
          <div className="flex items-center gap-2">
            <span
              className={cn(
                GOVERNANCE_PILL_BASE,
                GOVERNANCE_PILL_TONE[pillTone],
                "shrink-0",
                !isWarning &&
                  "max-w-[68px] whitespace-normal text-center",
              )}
            >
              {isWarning ? (
                <AlertCircle
                  className="mr-1 inline-block h-2.5 w-2.5 align-[-1px]"
                  aria-hidden
                />
              ) : (
                <Check
                  className="mr-1 inline-block h-2.5 w-2.5 align-[-1px] stroke-[3]"
                  aria-hidden
                />
              )}
              {data.governanceLabel}
            </span>
            {!isWarning && (
              <p className={SUBTITLE}>Governance version</p>
            )}
          </div>

          {!isWarning && data.governanceFileName && (
            <p className={FILE_NAME} title={data.governanceFileName}>
              {data.governanceFileName}
            </p>
          )}

          {data.embedStatusLabel && (
            <p className="text-[11px] font-semibold text-amber-700">
              {data.embedStatusLabel}
            </p>
          )}

          {isEmbedded ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900"
            >
              <Download />
              Download embedded file
            </Button>
          ) : (
            <div className="rounded-md border border-dashed border-amber-300 bg-white px-3 py-3 text-center">
              <Download
                className="mx-auto mb-1 h-4 w-4 text-amber-700/70"
                aria-hidden
              />
              <p className="text-[11px] font-medium italic leading-snug text-amber-800">
                Download embedded file — {pendingSuffix}
              </p>
            </div>
          )}

          <p
            className={cn(
              "text-[11px] italic leading-snug",
              isEmbedded ? "text-emerald-700" : "text-amber-700",
            )}
          >
            {data.provenanceNote}
          </p>
        </Card>
      </div>
    </section>
  );
}
