import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format, subDays, subMonths, subYears, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from "date-fns";
import { cn } from "@/lib/utils";

export type DateRange = {
  from: Date;
  to: Date;
};

type QuickFilter = "today" | "week" | "month" | "quarter" | "year" | "last7" | "last30" | "last90" | "custom";

interface DateRangeFilterProps {
  value?: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

export function DateRangeFilter({ value, onChange, className }: DateRangeFilterProps) {
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("month");
  const [customRange, setCustomRange] = useState<{ from?: Date; to?: Date }>({
    from: value?.from,
    to: value?.to,
  });

  const applyQuickFilter = (filter: QuickFilter) => {
    setQuickFilter(filter);
    const now = new Date();
    let range: DateRange;

    switch (filter) {
      case "today":
        range = { from: now, to: now };
        break;
      case "week":
        range = { from: startOfWeek(now), to: endOfWeek(now) };
        break;
      case "month":
        range = { from: startOfMonth(now), to: endOfMonth(now) };
        break;
      case "quarter":
        range = { from: startOfQuarter(now), to: endOfQuarter(now) };
        break;
      case "year":
        range = { from: startOfYear(now), to: endOfYear(now) };
        break;
      case "last7":
        range = { from: subDays(now, 7), to: now };
        break;
      case "last30":
        range = { from: subDays(now, 30), to: now };
        break;
      case "last90":
        range = { from: subDays(now, 90), to: now };
        break;
      default:
        return;
    }

    onChange(range);
  };

  const applyCustomRange = () => {
    if (customRange.from && customRange.to) {
      onChange({ from: customRange.from, to: customRange.to });
      setQuickFilter("custom");
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select value={quickFilter} onValueChange={(v) => applyQuickFilter(v as QuickFilter)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
          <SelectItem value="quarter">This Quarter</SelectItem>
          <SelectItem value="year">This Year</SelectItem>
          <SelectItem value="last7">Last 7 Days</SelectItem>
          <SelectItem value="last30">Last 30 Days</SelectItem>
          <SelectItem value="last90">Last 90 Days</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>

      {quickFilter === "custom" && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !customRange.from && !customRange.to && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {customRange.from && customRange.to ? (
                <>
                  {format(customRange.from, "MMM dd, yyyy")} - {format(customRange.to, "MMM dd, yyyy")}
                </>
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">From Date</label>
                <Calendar
                  mode="single"
                  selected={customRange.from}
                  onSelect={(date) => setCustomRange({ ...customRange, from: date })}
                  initialFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">To Date</label>
                <Calendar
                  mode="single"
                  selected={customRange.to}
                  onSelect={(date) => setCustomRange({ ...customRange, to: date })}
                />
              </div>
              <Button onClick={applyCustomRange} className="w-full" disabled={!customRange.from || !customRange.to}>
                Apply Range
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}

      {value && (
        <div className="text-sm text-muted-foreground">
          {format(value.from, "MMM dd, yyyy")} - {format(value.to, "MMM dd, yyyy")}
        </div>
      )}
    </div>
  );
}
