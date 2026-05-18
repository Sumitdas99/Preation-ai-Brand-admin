import type { PackType } from "@/api/schemas/billing";
import { SectionHeading } from "../primitives/SectionHeading";
import { PackTypeRadioCard } from "../primitives/PackTypeRadioCard";

const PACK_TYPES: PackType[] = ["TRIAL", "ENTERPRISE", "STANDARD"];

interface PackTypeSectionProps {
  value: PackType;
  onChange: (value: PackType) => void;
}

export function PackTypeSection({ value, onChange }: PackTypeSectionProps) {
  return (
    <section className="overflow-hidden rounded-lg border-[1.25px] border-slate-200 bg-card shadow-sm">
      <SectionHeading
        index={1}
        title="Pack type"
        subtitle="Determines billing behavior, trial logic, and which fields apply below."
      />
      <div
        role="radiogroup"
        aria-label="Pack type"
        className="grid gap-3 px-6 py-5 md:grid-cols-3"
      >
        {PACK_TYPES.map((packType) => (
          <PackTypeRadioCard
            key={packType}
            packType={packType}
            selected={value === packType}
            onSelect={onChange}
          />
        ))}
      </div>
    </section>
  );
}
