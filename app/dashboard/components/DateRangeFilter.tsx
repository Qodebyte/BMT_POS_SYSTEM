'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const dateRanges = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 Days", value: "last7" },
  { label: "This Month", value: "thisMonth" },
  { label: "Last Month", value: "lastMonth" },
  { label: "Custom Range", value: "custom" },
];

interface DateRangeFilterProps {
  onDateRangeChange: (range: string, dates?: { from: Date; to: Date }) => void;
}

export function DateRangeFilter({ onDateRangeChange }: DateRangeFilterProps) {
  const [selectedRange, setSelectedRange] = useState("thisMonth");
  const [date, setDate] = useState<{ from: Date; to: Date } | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });

  const handleRangeChange = (value: string) => {
    setSelectedRange(value);
    if (value !== "custom") {
      onDateRangeChange(value);
    }
  };

  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      setDate({ from: range.from, to: range.to });
      onDateRangeChange("custom", { from: range.from, to: range.to });
    }
  };

  return (
    <div className="flex bg-gray-900 flex-col xs:flex-row xs:items-center gap-3 sm:gap-4">
      <Select value={selectedRange} onValueChange={handleRangeChange} >
        <SelectTrigger className="w-full 
      min-w-45
      xs:w-44 
      sm:w-52
      bg-gray-900 border-gray-700 text-white h-10">
          <SelectValue placeholder="Select date range" />
        </SelectTrigger>
        <SelectContent className="bg-gray-900 border-gray-700 text-white">
          {dateRanges.map((range) => (
            <SelectItem key={range.value} value={range.value} className="hover:bg-gray-800">
              {range.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedRange === "custom" && (
        <Popover>
          <PopoverTrigger asChild>
      <Button
          variant="outline"
          className={cn(
            "w-full xs:w-auto xs:min-w-[240px] justify-start text-left font-normal",
            "bg-gray-900 border-gray-700 text-white hover:bg-gray-800 h-10",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "d MMM")} – {format(date.to, "d MMM yy")}
              </>
            ) : (
              format(date.from, "d MMM yy")
            )
          ) : (
            <span>Custom range</span>
          )}
        </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-700" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleDateSelect}
              numberOfMonths={2}
              className="text-white"
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}