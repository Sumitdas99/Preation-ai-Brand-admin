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
        "group flex h-full w-full flex-col gap-2 rounded-lg border bg-white p-4 text-left transition outline-none",
        "focus-visible:ring-2 focus-visible:ring-[#0A1F44] focus-visible:ring-offset-1",
        selected
          ? "border-[#0A1F44] shadow-sm ring-1 ring-[#0A1F44]"
          : "border-slate-200 hover:border-slate-300 hover:shadow-sm",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-4 w-4 items-center justify-center rounded-full border",
              selected
                ? "border-[#0A1F44] bg-[#0A1F44]"
                : "border-slate-300 bg-white group-hover:border-slate-400",
            )}
          >
            {selected ? (
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
            ) : null}
          </span>
          <span className="text-sm font-semibold text-slate-900">
            {PACK_TYPE_LABEL[packType]}
          </span>
        </span>
        <OverrideTag packType={packType} />
      </div>
      <p className="text-xs leading-relaxed text-slate-600">
        {PACK_TYPE_DESCRIPTION[packType]}
      </p>
    </button>
  );
}
