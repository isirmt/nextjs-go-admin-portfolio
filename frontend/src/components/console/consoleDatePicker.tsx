"use client";

import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/shadcn/ui/button";
import { Calendar } from "@/components/shadcn/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/ui/popover";

type ConsoleDatePickerProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
};

function parseLocalDate(value: string) {
  const matched = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!matched) return undefined;

  const [, year, month, day] = matched;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default function ConsoleDatePicker({
  id,
  value,
  onChange,
}: ConsoleDatePickerProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const selectedDate = parseLocalDate(value);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    onChange(format(date, "yyyy-MM-dd"));
    setIsCalendarOpen(false);
  };

  return (
    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className="w-full justify-start font-normal"
        >
          <CalendarIcon />
          {selectedDate ? (
            format(selectedDate, "PPP (EEE)", { locale: ja })
          ) : (
            <span className="text-muted-foreground">日付を選択</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          locale={ja}
          captionLayout="dropdown"
          startMonth={new Date(2016, 0)}
          endMonth={new Date(2050, 11)}
        />
      </PopoverContent>
    </Popover>
  );
}
