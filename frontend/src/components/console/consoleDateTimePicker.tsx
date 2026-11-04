"use client";

import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { CalendarIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/shadcn/ui/button";
import { Calendar } from "@/components/shadcn/ui/calendar";
import { Input } from "@/components/shadcn/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/ui/popover";

type ConsoleDateTimePickerProps = {
  value: string;
  onChange: (value: string) => void;
};

function toLocalDateTimeValue(date: Date) {
  const pad = (value: number) => value.toString().padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function parseLocalDateTime(value: string) {
  const matched = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!matched) return undefined;

  const [, year, month, day, hour, minute] = matched;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
  );

  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default function ConsoleDateTimePicker({
  value,
  onChange,
}: ConsoleDateTimePickerProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const selectedDate = parseLocalDateTime(value);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onChange("");
      return;
    }

    date.setHours(
      selectedDate?.getHours() ?? 0,
      selectedDate?.getMinutes() ?? 0,
      0,
      0,
    );
    onChange(toLocalDateTimeValue(date));
    setIsCalendarOpen(false);
  };

  const handleTimeChange = (time: string) => {
    if (!selectedDate) return;
    const [hours, minutes] = time.split(":").map(Number);
    const nextDate = new Date(selectedDate);
    nextDate.setHours(hours, minutes, 0, 0);
    onChange(toLocalDateTimeValue(nextDate));
  };

  return (
    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_8rem_auto]">
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
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
          />
        </PopoverContent>
      </Popover>
      <Input
        type="time"
        aria-label="公開時刻"
        value={selectedDate ? format(selectedDate, "HH:mm") : ""}
        onChange={(event) => handleTimeChange(event.target.value)}
        disabled={!selectedDate}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="公開日時をクリア"
        disabled={!selectedDate}
        onClick={() => onChange("")}
      >
        <XIcon />
      </Button>
    </div>
  );
}
