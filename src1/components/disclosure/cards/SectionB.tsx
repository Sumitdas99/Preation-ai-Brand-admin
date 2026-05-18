import type { DisclosurePlacementType } from "@/api/schemas/disclosure";
import type { SectionBVM } from "../types";
import { PlacementRadio } from "../primitives/PlacementRadio";

interface Props {
  data: SectionBVM;
  disabled?: boolean;
  onSelect: (placement: DisclosurePlacementType) => void;
}

export function SectionB({ data, disabled, onSelect }: Props) {
  return (
    <section>
      <div className="overflow-hidden rounded-lg border-[1.25px] border-slate-200 bg-card shadow-sm [contain:layout_paint]">
        <header className="flex items-center gap-3 border-b border-slate-200 bg-slate-50/60 px-6 py-3.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0A1F44] text-sm font-semibold text-white">
            {data.badgeLetter}
          </span>
          <h3 className="text-xl font-semibold leading-none text-slate-600">
            {data.title}
          </h3>
        </header>

        <div className="space-y-4 px-6 py-5">
          <div className="rounded-md bg-slate-50 px-4 py-3">
            <p className="text-sm font-semibold text-slate-600">
              {data.defaultPrompt}
            </p>
          </div>

          <div
            role="radiogroup"
            aria-label={data.title}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {data.options.map((option) => (
              <PlacementRadio
                key={option.id}
                option={option}
                selected={data.selected === option.id}
                disabled={disabled}
                onSelect={onSelect}
                groupName="placement-type"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
