import { cn } from "@/lib/utils";
import { SectionShell } from "../layout/SectionShell";
import type { EvidencePackSectionData } from "../types";
import { sectionToneClasses } from "../layout/tone";
import { EVIDENCE_PACK_PREVIEW_COPY as COPY } from "@/features/legalReview/adapters/copy";

interface Props {
  section: EvidencePackSectionData;
}

export function DetectionResultsSection({ section }: Props) {
  if (section.body.kind !== "detection_table") return null;
  const { rows } = section.body;

  return (
    <SectionShell data={section.shell}>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{COPY.detectionEmpty}</p>
      ) : (
        <div className="-mx-6 -mt-6 overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-foreground/10 bg-muted/30 text-left text-[13px] font-extrabold uppercase tracking-wide text-foreground/65">
                <th className="px-5 py-3.5">{COPY.detectionTableDetector}</th>
                <th className="px-5 py-3.5 text-right">
                  {COPY.detectionTableScore}
                </th>
                <th className="px-5 py-3.5 text-right">
                  {COPY.detectionTableThreshold}
                </th>
                <th className="px-5 py-3.5">{COPY.detectionTableVerdict}</th>
                <th className="px-5 py-3.5">{COPY.detectionTableSource}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row, i) => (
                <tr
                  key={`${row.detectorLabel}-${i}`}
                  className="hover:bg-muted/10"
                >
                  <td className="px-5 py-3.5 text-sm font-bold text-foreground">
                    {row.detectorLabel}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-sm font-bold tabular-nums text-foreground/80">
                    {row.scoreLabel}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-sm font-bold tabular-nums text-muted-foreground">
                    {row.thresholdLabel}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={cn(
                        "inline-block whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
                        sectionToneClasses(row.verdictTone, "solid"),
                      )}
                    >
                      {row.verdictLabel}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-bold text-foreground">
                    {row.sourceLabel ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionShell>
  );
}
