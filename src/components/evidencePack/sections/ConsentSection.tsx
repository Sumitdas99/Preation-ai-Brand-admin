import { SectionShell } from "../layout/SectionShell";
import type { EvidencePackSectionData } from "../types";

interface Props {
  section: EvidencePackSectionData;
}

export function ConsentSection({ section }: Props) {
  if (section.body.kind !== "consent_record") return null;
  const { rationale } = section.body;
  return (
    <SectionShell data={section.shell}>
      {rationale ? (
        <p className="text-base font-semibold leading-relaxed text-slate-600">
          <span className="font-bold text-slate-700">Not applicable: </span>
          {rationale}
        </p>
      ) : (
        <p className="text-sm font-medium text-muted-foreground">
          No consent record available.
        </p>
      )}
    </SectionShell>
  );
}
