import type { DisclosurePlacementType } from "@/api/schemas/disclosure";
import { cn } from "@/lib/utils";
import type { PlacementOptionVM } from "../types";

interface Props {
  option: PlacementOptionVM;
  selected: boolean;
  disabled?: boolean;
  onSelect: (id: DisclosurePlacementType) => void;
  groupName: string;
}

export function PlacementRadio({
  option,
  selected,
  disabled,
  onSelect,
  groupName,
}: Props) {
  const isDisabled = Boolean(disabled || option.disabled);

  function handleClick() {
    if (!isDisabled && !selected) onSelect(option.id);
  }

  return (
    <label
      className={cn(
        "group relative flex h-full cursor-pointer flex-col gap-2 rounded-lg border bg-card p-4 transition-colors",
        selected
          ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
          : "border-slate-200 hover:border-slate-300",
        isDisabled && "cursor-not-allowed opacity-60 hover:border-slate-200",
      )}
      onClick={handleClick}
    >
      <input
        type="radio"
        name={groupName}
        value={option.id}
        checked={selected}
        disabled={isDisabled}
        onChange={() => onSelect(option.id)}
        className="sr-only"
      />

      <span
        aria-hidden
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          selected
            ? "border-blue-600 bg-white"
            : "border-slate-300 bg-white group-hover:border-slate-400",
        )}
      >
        {selected ? (
          <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
        ) : null}
      </span>

      <div className="space-y-1">
        <div className="text-[15px] font-bold text-slate-900">
          {option.label}
        </div>
        <p
          className={cn(
            "text-[13px] font-medium leading-relaxed",
            selected ? "text-blue-700" : "text-slate-500",
          )}
        >
          {option.description}
        </p>
      </div>
    </label>
  );
}
