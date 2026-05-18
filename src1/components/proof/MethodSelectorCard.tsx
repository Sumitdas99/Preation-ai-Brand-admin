import type { ProofMethod } from "@/api/schemas/proof";
import { MethodOptionCard } from "./MethodOptionCard";
import { StepHeader } from "./StepHeader";
import type { ProofMethodSelector } from "./types";

interface Props {
  data: ProofMethodSelector;
  selected: ProofMethod;
  onChange: (next: ProofMethod) => void;
}

export function MethodSelectorCard({ data, selected, onChange }: Props) {
  return (
    <section className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
      <StepHeader
        step={1}
        title={data.label}
        badge={selected ? undefined : data.requiredLabel}
        badgeTone="required"
        rightSlot={
          data.placementHint ? (
            <span className="font-semibold text-slate-600">
              {data.placementHint.split(":")[0]}:
              <span className="ml-1 font-bold text-slate-800">
                {data.placementHint.split(":").slice(1).join(":").trim()}
              </span>
            </span>
          ) : null
        }
      />

      <fieldset
        role="radiogroup"
        aria-label={data.label}
        className="space-y-3 px-6 py-5"
      >
        {data.options.map((option) => (
          <MethodOptionCard
            key={option.id}
            option={option}
            selected={selected === option.id}
            onSelect={() => onChange(option.id)}
            inputName="proof_method"
            inputId={`proof-method-${option.id}`}
          />
        ))}
      </fieldset>
    </section>
  );
}
