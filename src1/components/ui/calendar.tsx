import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-3",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-xs font-bold uppercase tracking-wider text-[#0A1F44]",
        nav: "space-x-1 flex items-center",
        nav_button:
          "inline-flex h-6 w-6 items-center justify-center rounded-md p-0 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#0A1F44] focus-visible:outline-none",
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-0.5",
        head_row: "flex",
        head_cell: "w-8 rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-400",
        row: "flex w-full mt-1",
        cell: "h-8 w-8 text-center p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-[#0A1F44]/5 [&:has([aria-selected])]:bg-[#0A1F44]/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-xs font-semibold text-slate-700 ring-offset-0 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:outline-none aria-selected:opacity-100",
        day_range_end: "day-range-end",
        day_selected:
          "bg-[#0A1F44] text-white hover:bg-[#0A1F44] hover:text-white focus:bg-[#0A1F44] focus:text-white",
        day_today: "",
        day_outside:
          "day-outside text-slate-300 opacity-100 aria-selected:bg-[#0A1F44]/5 aria-selected:text-slate-400 aria-selected:opacity-30",
        day_disabled: "text-slate-300",
        day_range_middle: "aria-selected:bg-[#0A1F44]/10 aria-selected:text-[#0A1F44]",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-3.5 w-3.5" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-3.5 w-3.5" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
