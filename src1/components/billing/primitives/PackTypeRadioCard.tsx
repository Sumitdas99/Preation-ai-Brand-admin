import type { PackType } from "@/api/schemas/billing";
import { cn } from "@/lib/utils";
import {
  PACK_TYPE_DESCRIPTION,
  PACK_TYPE_LABEL,
} from "@/features/billing/adapters/copy";
import { OverrideTag } from "./OverrideTag";

interface PackTypeRadioCardProps {
  packType: PackType;
  selected: boolean;
  onSelect: (packType: PackType) => void;
}

export function PackTypeRadioCard({
  packType,
  selected,
  onSelect,
}: PackTypeRadioCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(packType)}
      className={cn(
        "group flex h-full w-full flex-col gap-2 rounded-lg p-4 text-left transition outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? "bg-[#0A1F44] text-white"
          : "bg-muted/30 opacity-90 hover:bg-muted/50",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-4 w-4 items-center justify-center rounded-full border",
              selected
                ? "border-white/40 bg-white/15"
                : "border-slate-300 bg-white group-hover:border-slate-400",
            )}
          >
            {selected ? (
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
            ) : null}
          </span>
          <span
            className={cn(
              "text-base",
              selected
                ? "font-semibold text-white"
                : "font-bold text-foreground/80",
            )}
          >
            {PACK_TYPE_LABEL[packType]}
          </span>
        </span>
        <OverrideTag packType={packType} />
      </div>
      <p
        className={cn(
          "text-xs leading-relaxed",
          selected
            ? "font-semibold text-white/85"
            : "font-bold text-foreground/70",
        )}
      >
        {PACK_TYPE_DESCRIPTION[packType]}
      </p>
    </button>
  );
}
