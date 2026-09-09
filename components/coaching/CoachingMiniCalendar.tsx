"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { Icon } from "@iconify/react";

type CoachingMiniCalendarProps = {
  highlightedDates: Date[];
  month: Date;
  onMonthChange: (month: Date) => void;
};

export function CoachingMiniCalendar({
  highlightedDates,
  month,
  onMonthChange,
}: CoachingMiniCalendarProps) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  const isHighlighted = (day: Date) =>
    highlightedDates.some((date) => isSameDay(date, day));

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          {format(month, "MMMM yyyy")}
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMonthChange(addMonths(month, -1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Previous month"
          >
            <Icon icon="mdi:chevron-left" className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => onMonthChange(addMonths(month, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Next month"
          >
            <Icon icon="mdi:chevron-right" className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground">
        {weekDays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const highlighted = isHighlighted(day);
          const inMonth = isSameMonth(day, month);
          return (
            <div
              key={day.toISOString()}
              className={`flex h-9 items-center justify-center rounded-lg text-sm ${
                highlighted
                  ? "bg-primary font-semibold text-primary-foreground"
                  : inMonth
                    ? "text-foreground"
                    : "text-muted-foreground/40"
              }`}
            >
              {format(day, "d")}
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
        Purple highlights denote days you have scheduled coaching sessions.
      </p>
    </div>
  );
}
