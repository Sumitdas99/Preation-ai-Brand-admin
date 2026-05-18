import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, FlaskConical } from "lucide-react";
import {
  getConsentScenario,
  setConsentScenario,
  subscribeConsentScenario,
  type ConsentScenarioId,
} from "@/api/consentScenario";
import { cn } from "@/lib/utils";
import { consentKeys } from "../hooks/queryKeys";

interface ScenarioOption {
  id: ConsentScenarioId;
  label: string;
}

const SCENARIO_OPTIONS: readonly ScenarioOption[] = [
  { id: "both-fresh", label: "Both triggered" },
  { id: "rpl-only-fresh", label: "RPL only" },
  { id: "hp-only-fresh", label: "Human presence only" },
];

interface Props {
  specId?: string;
}

export function ConsentDevPanel({ specId }: Props) {
  const qc = useQueryClient();
  const [scenario, setScenario] = useState<ConsentScenarioId>(
    () => getConsentScenario(),
  );

  useEffect(() => subscribeConsentScenario(setScenario), []);

  const total = SCENARIO_OPTIONS.length;
  const index = Math.max(
    0,
    SCENARIO_OPTIONS.findIndex((s) => s.id === scenario),
  );
  const current = SCENARIO_OPTIONS[index] ?? SCENARIO_OPTIONS[0];

  const handleChange = (next: ConsentScenarioId) => {
    setConsentScenario(next);
    if (specId) {
      qc.invalidateQueries({ queryKey: consentKeys.detail(specId) });
    } else {
      qc.invalidateQueries({ queryKey: consentKeys.all });
    }
  };

  const prev = () =>
    handleChange(SCENARIO_OPTIONS[(index - 1 + total) % total].id);
  const next = () =>
    handleChange(SCENARIO_OPTIONS[(index + 1) % total].id);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-full border border-white/10 bg-[#0f1d3b] px-3 py-2 text-white shadow-lg">
      <FlaskConical className="h-4 w-4 text-white/60" aria-hidden />

      <button
        type="button"
        onClick={prev}
        aria-label="Previous scenario"
        className="rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-1.5">
        {SCENARIO_OPTIONS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => handleChange(s.id)}
            aria-label={s.label}
            aria-current={i === index}
            className={cn(
              "h-2 w-2 rounded-full transition",
              i === index ? "bg-white" : "bg-white/30 hover:bg-white/60",
            )}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={next}
        aria-label="Next scenario"
        className="rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <div className="ml-1 flex min-w-[10rem] flex-col border-l border-white/10 pl-3 leading-tight">
        <span className="text-[10px] uppercase tracking-wider text-white/50">
          Consent · {index + 1} / {total}
        </span>
        <span className="text-xs font-medium">{current.label}</span>
      </div>
    </div>
  );
}
