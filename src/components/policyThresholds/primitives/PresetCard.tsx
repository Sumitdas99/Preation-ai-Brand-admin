import type { GeoPresetId } from "@/api/schemas/policyThresholds";
import { cn } from "@/lib/utils";

interface PresetCardProps {
  presetId: GeoPresetId;
  label: string;
  description: string;
  selected: boolean;
  onSelect: (presetId: GeoPresetId) => void;
}

export function PresetCard({
  presetId,
  label,
  description,
  selected,
  onSelect,
}: PresetCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(presetId)}
      className={cn(
        "h-full rounded-lg px-4 py-3 text-left transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected ? "bg-[#0A1F44] text-white" : "bg-muted/30 opacity-90 hover:bg-muted/50",
      )}
    >
      <span className="flex h-4 items-center justify-between gap-3">
        <span
          className={cn(
            "text-sm font-bold leading-4 tracking-wide",
            selected ? "text-white" : "text-foreground",
          )}
        >
          {label}
        </span>
        <span
          aria-hidden
          className={cn(
            "grid h-4 w-4 shrink-0 place-items-center rounded-full border",
            selected ? "border-white" : "border-muted-foreground/50",
          )}
        >
          {selected ? (
            <span className="h-2 w-2 rounded-full bg-white" />
          ) : null}
        </span>
      </span>
      <span
        className={cn(
          "mt-1.5 block text-xs font-bold leading-relaxed",
          selected ? "text-white/80" : "text-muted-foreground",
        )}
      >
        {description}
      </span>
    </button>
  );
}
