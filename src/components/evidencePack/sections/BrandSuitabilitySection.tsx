import { cn } from "@/lib/utils";
import { SectionShell } from "../layout/SectionShell";
import type { EvidencePackSectionData } from "../types";
import { sectionToneClasses } from "../layout/tone";
import { EVIDENCE_PACK_PREVIEW_COPY as COPY } from "@/features/legalReview/adapters/copy";

interface Props {
  section: EvidencePackSectionData;
}

export function BrandSuitabilitySection({ section }: Props) {
  if (section.body.kind !== "brand_suitability_record") return null;
  const {
    categories,
    otherCategoriesCaption,
    legalCommentary,
    legalCommentaryHeader,
    overrideCommentary,
    overrideCommentaryHeader,
  } = section.body;

  return (
    <SectionShell data={section.shell}>
      <div className="space-y-4">
        <div className="-mx-6 -mt-6 overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-foreground/10 bg-muted/30 text-left text-[13px] font-extrabold uppercase tracking-wide text-foreground/65">
                <th className="px-5 py-3.5">{COPY.brand5TableCategory}</th>
                <th className="px-5 py-3.5 text-right">
                  {COPY.brand5TableScore}
                </th>
                <th className="px-5 py-3.5">{COPY.brand5TableVerdict}</th>
                <th className="px-5 py-3.5">{COPY.brand5TableResolution}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {categories.map((cat) => (
                <tr
                  key={cat.key}
                  className="align-top hover:bg-muted/10"
                >
                  <td className="px-5 py-3.5 text-sm font-bold text-foreground">
                    {cat.label}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-sm font-bold tabular-nums text-foreground/80">
                    {cat.scoreLabel}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={cn(
                        "inline-block whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
                        sectionToneClasses(cat.verdictTone, "solid"),
                      )}
                    >
                      {cat.verdictLabel}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {cat.resolutionLabel ? (
                      <p
                        className={cn(
                          "text-sm leading-snug",
                          cat.resolutionTone === "approved"
                            ? "font-bold text-emerald-700"
                            : "font-medium text-foreground",
                        )}
                      >
                        {cat.resolutionLabel}
                      </p>
                    ) : null}
                    {cat.commentary ? (
                      <p className="mt-1 rounded-md bg-emerald-50/60 px-2 py-1 text-[12px] italic leading-relaxed text-emerald-900">
                        "{cat.commentary}"
                      </p>
                    ) : null}
                    {cat.commentaryFooter ? (
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        — {cat.commentaryFooter}
                      </p>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {otherCategoriesCaption ? (
          <p className="text-xs text-muted-foreground">{otherCategoriesCaption}</p>
        ) : null}

        {legalCommentary ? (
          <div className="rounded-md border border-rose-200 bg-rose-50/60 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-700">
              {legalCommentaryHeader ?? COPY.brand5LegalCommentaryHeader}
            </p>
            <p className="mt-2 text-sm italic leading-relaxed text-rose-900">
              "{legalCommentary}"
            </p>
          </div>
        ) : null}

        {overrideCommentary ? (
          <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {overrideCommentaryHeader}
            </p>
            <p className="mt-2 text-sm italic leading-relaxed text-slate-800">
              "{overrideCommentary}"
            </p>
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}
