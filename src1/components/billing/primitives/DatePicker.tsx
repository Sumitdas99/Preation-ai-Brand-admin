import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  id?: string;
  value?: string;
  onChange: (iso: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

function toDate(iso: string | undefined): Date | undefined {
  if (!iso) return undefined;
  const d = parse(iso, "yyyy-MM-dd", new Date());
  return isValid(d) ? d : undefined;
}

function toIso(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function DatePicker({
  id,
  value,
  onChange,
  onBlur,
  placeholder = "Pick a date",
  disabled,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = toDate(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          onBlur={onBlur}
          className={cn(
            "flex h-10 w-full items-center rounded-md border border-slate-300 bg-white px-3 text-left text-sm font-semibold shadow-none transition-colors focus:border-2 focus:border-[#0A1F44] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            selected ? "text-slate-800" : "text-slate-400 font-normal",
            className,
          )}
        >
          <span className="flex-1 truncate">
            {selected ? format(selected, "d MMM yyyy") : placeholder}
          </span>
          <CalendarIcon className="ml-2 h-3.5 w-3.5 shrink-0 text-slate-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto rounded-lg border-slate-200 p-0 shadow-lg" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(day) => {
            if (day) {
              onChange(toIso(day));
              setOpen(false);
            }
          }}
          defaultMonth={selected}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
