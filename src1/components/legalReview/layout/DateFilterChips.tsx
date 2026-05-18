import { cn } from "@/lib/utils";

export type DateFilterValue = "today" | "7d" | "30d" | "all";

interface Props {
  value: DateFilterValue;
  onChange: (next: DateFilterValue) => void;
}

const ITEMS: { value: DateFilterValue; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "all", label: "All time" },
];

export function DateFilterChips({ value, onChange }: Props) {
  return (
    <>
      {ITEMS.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(item.value)}
            className={cn(
              "flex items-center px-5 text-[13px] font-bold whitespace-nowrap transition-colors",
              active
                ? "bg-[#0A1F44] text-white"
                : "border-l border-border text-gray-500 hover:bg-gray-50 hover:text-gray-800",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </>
  );
}
