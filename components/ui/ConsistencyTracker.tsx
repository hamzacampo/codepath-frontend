"use client";

import { useCallback, useMemo, useState } from "react";
import { Icon } from "@iconify/react";

interface ConsistencyTrackerProps {
  data?: Record<string, number>;
  year?: number;
  /** When provided, year is controlled by parent (e.g. to refetch activity when year changes). */
  onYearChange?: (year: number) => void;
  /** Show loading state while activity for the selected year is being fetched. */
  loading?: boolean;
}

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function generateSampleData(year: number): Record<string, number> {
  const data: Record<string, number> = {};
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  let dayIndex = 0;
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const seed = year * 1000 + dayIndex;
    const rand1 = seededRandom(seed);
    const rand2 = seededRandom(seed + 0.5);

    if (rand1 > 0.3) {
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      data[dateStr] = Math.floor(rand2 * 5);
    }
    dayIndex++;
  }
  return data;
}

function getActivityLevel(count: number | undefined): number {
  if (!count || count === 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return 3;
  return 4;
}

function getActivityColor(level: number): string {
  switch (level) {
    case 0:
      return "bg-card";
    case 1:
      return "bg-accent/40";
    case 2:
      return "bg-accent/60";
    case 3:
      return "bg-accent/80";
    case 4:
      return "bg-accent";
    default:
      return "bg-card";
  }
}

function formatDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function ConsistencyTracker({ data, year: initialYear, onYearChange, loading = false }: ConsistencyTrackerProps) {
  const [internalYear, setInternalYear] = useState(initialYear ?? new Date().getFullYear());
  const year = initialYear ?? internalYear;
  const currentYear = new Date().getFullYear();
  const setYear = useCallback(
    (updater: (y: number) => number) => {
      const next = Math.min(updater(year), currentYear);
      if (onYearChange) onYearChange(next);
      else setInternalYear(next);
    },
    [year, onYearChange, currentYear],
  );

  const activityData = useMemo(() => {
    return data ?? generateSampleData(year);
  }, [data, year]);

  const weeks = useMemo(() => {
    const result: { date: Date; dateStr: string }[][] = [];
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const firstDay = startDate.getDay();
    startDate.setDate(startDate.getDate() - firstDay);

    let currentWeek: { date: Date; dateStr: string }[] = [];

    for (let d = new Date(startDate); d <= endDate || currentWeek.length > 0; d.setDate(d.getDate() + 1)) {
      const dateStr = formatDateStr(d);
      currentWeek.push({ date: new Date(d), dateStr });

      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }

      if (d > endDate && currentWeek.length === 0) break;
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        const lastDate = currentWeek[currentWeek.length - 1].date;
        const nextDate = new Date(lastDate);
        nextDate.setDate(nextDate.getDate() + 1);
        currentWeek.push({ date: nextDate, dateStr: formatDateStr(nextDate) });
      }
      result.push(currentWeek);
    }

    return result;
  }, [year]);

  const monthPositions = useMemo(() => {
    const positions: { month: string; startWeek: number }[] = [];
    let currentMonth = -1;

    weeks.forEach((week, weekIndex) => {
      const firstDayOfWeek = week[0].date;
      const month = firstDayOfWeek.getMonth();

      if (month !== currentMonth && firstDayOfWeek.getFullYear() === year) {
        currentMonth = month;
        positions.push({ month: MONTHS[month], startWeek: weekIndex });
      }
    });

    return positions;
  }, [weeks, year]);

  return (
    <div className="bg-card rounded-lg p-4 sm:p-6 w-full max-w-5xl box-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-foreground text-lg font-semibold">Consistency Tracker</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setYear((y) => y - 1)}
            disabled={loading}
            className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:pointer-events-none"
            aria-label="Previous year"
          >
            <Icon icon="mdi:chevron-left" className="w-5 h-5" />
          </button>
          <span className="text-muted-foreground font-medium min-w-[60px] text-center">{year}</span>
          <button
            type="button"
            onClick={() => setYear((y) => y + 1)}
            disabled={loading || year >= currentYear}
            className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:pointer-events-none"
            aria-label="Next year"
          >
            <Icon icon="mdi:chevron-right" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="overflow-x-auto" aria-busy="true" aria-live="polite">
          <div className="min-w-[800px] flex flex-col gap-3">
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Icon icon="mdi:loading" className="w-6 h-6 animate-spin" aria-hidden />
              <span className="text-sm">Loading activity…</span>
            </div>
            <div className="flex gap-[2px] flex-wrap justify-center max-w-[400px] mx-auto">
              {Array.from({ length: 112 }).map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-sm bg-muted/60 animate-pulse"
                  style={{ animationDelay: `${i % 7}00ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="flex ml-8 mb-2">
              {monthPositions.map(({ month, startWeek }, index) => {
                const nextPosition = monthPositions[index + 1]?.startWeek ?? weeks.length;
                const width = (nextPosition - startWeek) * 14;
                return (
                  <div
                    key={`${month}-${startWeek}`}
                    className="text-xs text-muted-foreground"
                    style={{ width: `${width}px` }}
                  >
                    {month}
                  </div>
                );
              })}
            </div>

            <div className="flex">
              <div className="flex flex-col gap-[2px] mr-2">
                {DAYS.map((day, index) => (
                  <div
                    key={index}
                    className="h-3 w-5 text-[10px] text-muted-foreground flex items-center justify-end pr-1"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="flex gap-[2px]">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-[2px]">
                    {week.map(({ date, dateStr }, dayIndex) => {
                      const isCurrentYear = date.getFullYear() === year;
                      const activityLevel = isCurrentYear ? getActivityLevel(activityData[dateStr]) : 0;
                      const count = activityData[dateStr] ?? 0;

                      return (
                        <div
                          key={dateStr}
                          className={`w-3 h-3 rounded-sm ${getActivityColor(activityLevel)} ${
                            isCurrentYear ? "hover:ring-1 hover:ring-accent cursor-pointer" : "opacity-20"
                          } transition-all`}
                          title={isCurrentYear ? `${dateStr}: ${count} activities` : ""}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end mt-4 gap-2">
              <span className="text-xs text-muted-foreground">Less</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((level) => (
                  <div key={level} className={`w-3 h-3 rounded-sm ${getActivityColor(level)}`} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">More</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
