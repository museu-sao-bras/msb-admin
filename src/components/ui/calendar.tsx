import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, month: monthProp, onMonthChange, ...props }: CalendarProps) {
  const isControlled = monthProp !== undefined;
  const [currentMonth, setCurrentMonth] = React.useState<Date>(monthProp ?? new Date());

  React.useEffect(() => {
    if (monthProp) setCurrentMonth(monthProp);
  }, [monthProp]);

  const displayMonth = isControlled ? (monthProp as Date) : currentMonth;

  function handleMonthChange(month: Date | undefined) {
    if (!month) return;
    if (isControlled) {
      onMonthChange?.(month);
    } else {
      setCurrentMonth(month);
    }
  }

  // year range for the select (helpful to jump back many years)
  const year = displayMonth.getFullYear();
  const startYear = year - 100;
  const endYear = year + 10;

  return (
    <div>
      <div className="flex items-center justify-between px-3 pb-2">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            className={cn(buttonVariants({ variant: "outline" }), "h-7 w-7 p-0")}
            onClick={() => handleMonthChange(new Date(year - 10, displayMonth.getMonth(), 1))}
            aria-label="Jump back 10 years"
          >
            «
          </button>
          <button
            type="button"
            className={cn(buttonVariants({ variant: "outline" }), "h-7 w-7 p-0")}
            onClick={() => handleMonthChange(new Date(year - 1, displayMonth.getMonth(), 1))}
            aria-label="Jump back 1 year"
          >
            ‹
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <select
            className="rounded-md border bg-muted px-2 py-1 text-sm text-muted-foreground"
            value={displayMonth.getMonth()}
            onChange={(e) => handleMonthChange(new Date(displayMonth.getFullYear(), Number(e.target.value), 1))}
            aria-label="Select month"
          >
            {Array.from({ length: 12 }, (_, i) => i).map((m) => (
              <option value={m} key={m}>
                {new Date(0, m).toLocaleString(undefined, { month: "long" })}
              </option>
            ))}
          </select>

          <select
            className="rounded-md border bg-muted px-2 py-1 text-sm text-muted-foreground"
            value={year}
            onChange={(e) => handleMonthChange(new Date(Number(e.target.value), displayMonth.getMonth(), 1))}
            aria-label="Select year"
          >
            {Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i).map((y) => (
              <option value={y} key={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            className={cn(buttonVariants({ variant: "outline" }), "h-7 w-7 p-0")}
            onClick={() => handleMonthChange(new Date(year + 1, displayMonth.getMonth(), 1))}
            aria-label="Jump forward 1 year"
          >
            ›
          </button>
          <button
            type="button"
            className={cn(buttonVariants({ variant: "outline" }), "h-7 w-7 p-0")}
            onClick={() => handleMonthChange(new Date(year + 10, displayMonth.getMonth(), 1))}
            aria-label="Jump forward 10 years"
          >
            »
          </button>
        </div>
      </div>

      <DayPicker
        month={displayMonth}
        onMonthChange={handleMonthChange}
        showOutsideDays={showOutsideDays}
        className={cn("p-3", className)}
        classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal aria-selected:opacity-100"),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
        {...props}
      />
    </div>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
