import { Check, ChevronDown } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

interface Props {
  label: string;
  value: string;
  onChange: (next: string) => void;
  options: FilterOption[];
  className?: string;
}

export function FilterDropdown({
  label,
  value,
  onChange,
  options,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const activeOption = options.find((o) => o.value === value);
  const displayLabel = activeOption?.label ?? value;
  const isDefault =
    options.length === 0 ? true : options[0].value === value;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] font-bold transition-colors",
            open || !isDefault
              ? "text-[#0A1F44]"
              : "text-gray-500 hover:text-gray-800",
            className,
          )}
        >
          <span
            className={cn(
              "font-semibold",
              open || !isDefault ? "text-gray-500" : "text-gray-400",
            )}
          >
            {label}
          </span>
          <span className="text-[#0A1F44]">{displayLabel}</span>
          <ChevronDown
            className={cn(
              "h-3 w-3 transition-transform duration-150",
              open && "rotate-180",
              open || !isDefault ? "text-gray-600" : "text-gray-400",
            )}
            aria-hidden
          />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={12}
          className="z-50 min-w-[12rem] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <div className="px-3 pb-1 pt-2.5 text-xs font-extrabold uppercase tracking-wider text-gray-500">
            {label.replace(":", "")}
          </div>
          <div className="flex flex-col">
            {options.map((opt, idx) => {
              const isActive = opt.value === value;
              const isLast = idx === options.length - 1;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-4 px-3 py-2 text-[13px] font-semibold transition-colors",
                    isLast && "rounded-b-lg",
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isActive ? (
                    <Check
                      className="h-3.5 w-3.5 shrink-0 text-gray-500"
                      aria-hidden
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
