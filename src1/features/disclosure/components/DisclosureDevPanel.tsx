import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DisclosureScope } from "@/api/schemas/disclosure";

interface Props {
  scope: DisclosureScope | undefined;
  onScopeChange: (next: DisclosureScope) => void;
  disabled?: boolean;
}

const SCOPE_OPTIONS: DisclosureScope[] = ["FULL", "PARTIAL"];

const DEFAULT_SCOPE: DisclosureScope = "FULL";

export function DisclosureDevPanel({ scope, onScopeChange, disabled }: Props) {
  const effectiveScope = scope ?? DEFAULT_SCOPE;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-full border border-white/10 bg-[#0f1d3b] px-3 py-2 text-white shadow-lg">
      <FlaskConical className="h-4 w-4 text-white/60" aria-hidden />

      <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50">
        Detection scope
      </span>

      <div
        className="flex items-stretch overflow-hidden rounded-full border border-white/15 bg-white/5"
        role="radiogroup"
        aria-label="Detection scope"
      >
        {SCOPE_OPTIONS.map((option) => {
          const active = effectiveScope === option;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => onScopeChange(option)}
              className={cn(
                "px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-60",
                active
                  ? "bg-white text-[#0f1d3b]"
                  : "text-white/60 hover:bg-white/5 hover:text-white",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
