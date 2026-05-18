import { cn } from "@/lib/utils";
import type { ProofMethodOption } from "./types";

interface Props {
  option: ProofMethodOption;
  selected: boolean;
  onSelect: () => void;
  inputName: string;
  inputId: string;
}

export function MethodOptionCard({
  option,
  selected,
  onSelect,
  inputName,
  inputId,
}: Props) {
  return (
    <label
      htmlFor={inputId}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-md border bg-card p-4 transition-colors",
        selected
          ? "border-blue-800 bg-blue-50 ring-1 ring-blue-800/40"
          : "border-border hover:border-foreground/30",
      )}
    >
      <input
        id={inputId}
        name={inputName}
        type="radio"
        value={option.id}
        checked={selected}
        onChange={onSelect}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
          selected ? "border-blue-800" : "border-muted-foreground/40",
        )}
      >
        <span
          className={cn(
            "h-2 w-2 rounded-full transition-opacity",
            selected ? "bg-blue-800 opacity-100" : "opacity-0",
          )}
        />
      </span>
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "text-base font-bold",
            selected ? "text-blue-800" : "text-foreground",
          )}
        >
          {option.headline}
        </div>
        <p
          className={cn(
            "mt-1 text-sm font-semibold leading-relaxed",
            selected ? "text-blue-800/85" : "text-foreground/80",
          )}
        >
          {option.description}
        </p>
      </div>
    </label>
  );
}
