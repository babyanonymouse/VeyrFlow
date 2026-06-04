"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={`p-3 ${className || ""}`}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center mb-4",
        caption_label: "text-sm font-medium text-zinc-100",
        nav: "space-x-1 flex items-center",
        button_previous: "h-7 w-7 bg-transparent p-0 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-md flex items-center justify-center cursor-pointer absolute left-1",
        button_next: "h-7 w-7 bg-transparent p-0 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-md flex items-center justify-center cursor-pointer absolute right-1",
        weekdays: "flex justify-between",
        weekday: "text-zinc-500 rounded-md w-9 font-normal text-[0.8rem] text-center",
        week: "flex w-full mt-2 justify-between",
        day_button: "h-9 w-9 p-0 rounded-md font-normal text-zinc-200 transition-colors hover:bg-zinc-900 cursor-pointer flex items-center justify-center",
        today: "bg-zinc-800 text-zinc-100 font-bold border border-zinc-700",
        selected: "bg-indigo-500 text-white hover:bg-indigo-400 hover:text-white focus:bg-indigo-500 focus:text-white",
        outside: "text-zinc-600 opacity-50",
        disabled: "text-zinc-500 opacity-50 cursor-not-allowed",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...chevronProps }) => {
          if (orientation === "left") {
            return <ChevronLeft className="h-4 w-4" {...chevronProps} />;
          }
          return <ChevronRight className="h-4 w-4" {...chevronProps} />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
