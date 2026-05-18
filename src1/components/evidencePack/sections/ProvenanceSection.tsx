import { AlertTriangle } from "lucide-react";
import { SectionShell } from "../layout/SectionShell";
import type { EvidencePackSectionData } from "../types";
import { KeyValueGrid } from "./KeyValueGrid";
import { EVIDENCE_PACK_PREVIEW_COPY as COPY } from "@/features/legalReview/adapters/copy";

interface Props {
  section: EvidencePackSectionData;
}

export function ProvenanceSection({ section }: Props) {
  if (section.body.kind !== "provenance_record") return null;
  const { keyValues, notApplicableRationale } = section.body;

  return (
    <SectionShell data={section.shell}>
      <div className="space-y-4">
        <KeyValueGrid rows={keyValues} columns={2} />
        {notApplicableRationale ? (
          <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50/60 px-4 py-3">
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
              aria-hidden
            />
            <div className="min-w-0 text-sm leading-relaxed text-amber-900">
              <span className="mr-1 font-semibold uppercase tracking-wide text-amber-800">
                {COPY.provenance4NotApplicableLabel}:
              </span>
              {notApplicableRationale}
            </div>
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}
