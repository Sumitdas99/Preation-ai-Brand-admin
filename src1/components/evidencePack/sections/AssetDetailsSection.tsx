import { SectionShell } from "../layout/SectionShell";
import type { EvidencePackSectionData } from "../types";
import { KeyValueGrid } from "./KeyValueGrid";

interface Props {
  section: EvidencePackSectionData;
}

export function AssetDetailsSection({ section }: Props) {
  if (section.body.kind !== "key_values") return null;
  return (
    <SectionShell data={section.shell}>
      <KeyValueGrid rows={section.body.rows} columns={2} />
    </SectionShell>
  );
}
