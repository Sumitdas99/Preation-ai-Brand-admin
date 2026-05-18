import { SectionShell } from "../layout/SectionShell";
import type { EvidencePackSectionData } from "../types";
import { KeyValueGrid } from "./KeyValueGrid";
import { EVIDENCE_PACK_PREVIEW_COPY as COPY } from "@/features/legalReview/adapters/copy";

interface Props {
  section: EvidencePackSectionData;
}

export function PolicyEngineSection({ section }: Props) {
  if (section.body.kind !== "policy_record") return null;
  const { keyValues, obligations, obligationsCaption } = section.body;

  const obligationsText =
    obligations.length > 0
      ? `${COPY.policy3ObligationsHeader}: ${obligations.join(" · ")}${obligationsCaption ? `. ${obligationsCaption}` : ""}.`
      : undefined;

  return (
    <SectionShell data={section.shell}>
      <div className="space-y-5">
        <KeyValueGrid rows={keyValues} columns={2} />

        {obligationsText ? (
          <p className="rounded-md border border-amber-200/60 bg-amber-50/60 px-3 py-2 text-sm leading-relaxed text-amber-900">
            {obligationsText}
          </p>
        ) : null}
      </div>
    </SectionShell>
  );
}
