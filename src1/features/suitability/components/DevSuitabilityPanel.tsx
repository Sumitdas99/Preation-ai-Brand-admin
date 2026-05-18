import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, FlaskConical } from "lucide-react";
import { USE_MSW } from "@/lib/env";
import {
  SUITABILITY_SCENARIO_IDS,
  getSuitabilityScenario,
  setSuitabilityScenario,
  subscribeSuitabilityScenario,
  type SuitabilityScenarioId,
} from "@/api/suitabilityScenario";
import { cn } from "@/lib/utils";

interface Props {
  runId?: string;
}

const COLLAPSED_KEY = "praetion.devSuitabilityPanel.collapsed";

const SCENARIO_LABELS: Record<SuitabilityScenarioId, string> = {
  "mixed-blocked-flagged": "Mixed (1 blocked · 2 flagged)",
  clear: "Clear (all allowed)",
  "flagged-only": "Flagged only",
  "all-blocked": "All blocked",
  "flagged-reviewed": "Flagged · accepted",
  withdrawn: "Asset withdrawn",
};

function readCollapsed(): boolean {
  try {
    const v = localStorage.getItem(COLLAPSED_KEY);
    return v === null ? true : v === "true";
  } catch {
    return true;
  }
}

export function DevSuitabilityPanel({ runId: _runId }: Props) {
  const [scenario, setScenario] = useState<SuitabilityScenarioId>(() =>
    getSuitabilityScenario(),
  );
  const [collapsed, setCollapsed] = useState<boolean>(() => readCollapsed());

  useEffect(() => {
    const unsubscribe = subscribeSuitabilityScenario(setScenario);
    return unsubscribe;
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSED_KEY, String(collapsed));
    } catch {}
  }, [collapsed]);

  if (!USE_MSW) return null;

  const ids = SUITABILITY_SCENARIO_IDS;
  const total = ids.length;
  const index = Math.max(0, ids.indexOf(scenario));

  const change = (nextScenario: SuitabilityScenarioId) => {
    setSuitabilityScenario(nextScenario);
  };

  const prev = () => change(ids[(index - 1 + total) % total]);
  const next = () => change(ids[(index + 1) % total]);

  if (collapsed) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          type="button"
          aria-label="Open suitability dev panel"
          onClick={() => setCollapsed(false)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#0f1d3b] text-white shadow-lg"
        >
          <FlaskConical className="h-4 w-4 text-white/80" aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-full border border-white/10 bg-[#0f1d3b] px-3 py-2 text-white shadow-lg">
      <button
        type="button"
        aria-label="Collapse panel"
        onClick={() => setCollapsed(true)}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
      >
        <FlaskConical className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={prev}
        aria-label="Previous scenario"
        className="rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-1.5">
        {ids.map((id, i) => (
          <button
            key={id}
            type="button"
            onClick={() => change(id)}
            aria-label={SCENARIO_LABELS[id]}
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
      <div className="ml-1 flex min-w-[12rem] flex-col border-l border-white/10 pl-3 leading-tight">
        <span className="text-[10px] uppercase tracking-wider text-white/50">
          Suitability · {index + 1} / {total}
        </span>
        <span className="text-xs font-medium">{SCENARIO_LABELS[scenario]}</span>
      </div>
    </div>
  );
}
