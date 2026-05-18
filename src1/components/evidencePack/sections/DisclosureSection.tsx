import { SectionShell } from "../layout/SectionShell";
import type { EvidencePackSectionData } from "../types";
import { KeyValueGrid } from "./KeyValueGrid";

interface Props {
  section: EvidencePackSectionData;
}

export function DisclosureSection({ section }: Props) {
  if (section.body.kind !== "disclosure_record") return null;
  const { keyValues, notApplicableRationale } = section.body;

  return (
    <SectionShell data={section.shell}>
      {notApplicableRationale ? (
        <p className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700">
          <span className="mr-1 font-semibold uppercase tracking-wide text-slate-600">
            NOT_APPLICABLE:
          </span>
          {notApplicableRationale}
        </p>
      ) : (
        <KeyValueGrid rows={keyValues} columns={2} />
      )}
    </SectionShell>
  );
}
