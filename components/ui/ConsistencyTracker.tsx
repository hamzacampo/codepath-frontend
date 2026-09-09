"use client";

import { useCallback, useMemo, useState } from "react";
import { Icon } from "@iconify/react";

interface ConsistencyTrackerProps {
  codeprintData?: Record<string, number>;
  codeforcesData?: Record<string, number>;
  year?: number;
  onYearChange?: (year: number) => void;
  loading?: boolean;
  codeforcesLinked?: boolean;
}

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CELL_SIZE_PX = 14;
const CELL_GAP_PX = 3;

function weekSpanWidth(weekCount: number): number {
  if (weekCount <= 0) return 0;
  return weekCount * CELL_SIZE_PX + (weekCount - 1) * CELL_GAP_PX;
}

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

type ActivitySource = "codeprint" | "codeforces";

function getActivityLevel(count: number | undefined): number {
  if (!count || count === 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count === 3) return 3;
  return 4;
}

function getActivityColor(source: ActivitySource, level: number): string {
  if (level === 0) return "bg-muted/30";

  if (source === "codeforces") {
    switch (level) {
      case 1:
        return "bg-emerald-500/35";
      case 2:
        return "bg-emerald-500/55";
      case 3:
        return "bg-emerald-500/75";
      default:
        return "bg-emerald-500";
    }
  }

  switch (level) {
    case 1:
      return "bg-accent/40";
    case 2:
      return "bg-accent/60";
    case 3:
      return "bg-accent/80";
    default:
      return "bg-accent";
  }
}

function formatDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function LegendScale({ source, label }: { source: ActivitySource; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground min-w-[72px]">{label}</span>
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((level) => (
          <div key={level} className={`w-3 h-3 rounded-sm ${getActivityColor(source, level)}`} />
        ))}
      </div>
    </div>
  );
}

function ActivityCell({
  dateStr,
  codeprintCount,
  codeforcesCount,
  inRange,
  isToday,
}: {
  dateStr: string;
  codeprintCount: number;
  codeforcesCount: number;
  inRange: boolean;
  isToday: boolean;
}) {
  const cpLevel = getActivityLevel(codeprintCount);
  const cfLevel = getActivityLevel(codeforcesCount);
  const hasCodeprint = cpLevel > 0;
  const hasCodeforces = cfLevel > 0;

  if (!inRange) {
    return <div className="w-3.5 h-3.5 rounded-sm" aria-hidden />;
  }

  const title = `${dateStr}: ${codeprintCount} CodePrint · ${codeforcesCount} Codeforces`;
  const todayRing = isToday ? "ring-2 ring-foreground/80 ring-offset-1 ring-offset-card" : "";

  if (!hasCodeprint && !hasCodeforces) {
    return (
      <div
        className={`w-3.5 h-3.5 rounded-sm bg-muted/25 border border-border/40 ${todayRing}`}
        title={title}
        aria-label={title}
      />
    );
  }

  if (hasCodeprint && !hasCodeforces) {
    return (
      <div
        className={`w-3.5 h-3.5 rounded-sm ${getActivityColor("codeprint", cpLevel)} hover:ring-1 hover:ring-accent/70 cursor-pointer transition-all ${todayRing}`}
        title={title}
        aria-label={title}
      />
    );
  }

  if (hasCodeforces && !hasCodeprint) {
    return (
      <div
        className={`w-3.5 h-3.5 rounded-sm ${getActivityColor("codeforces", cfLevel)} hover:ring-1 hover:ring-emerald-400/70 cursor-pointer transition-all ${todayRing}`}
        title={title}
        aria-label={title}
      />
    );
  }

  return (
    <div
      className={`w-3.5 h-3.5 rounded-sm overflow-hidden flex hover:ring-1 hover:ring-foreground/25 cursor-pointer transition-all border border-border/30 ${todayRing}`}
      title={title}
      aria-label={title}
    >
      <div className={`flex-1 h-full ${getActivityColor("codeprint", cpLevel)}`} />
      <div className={`flex-1 h-full ${getActivityColor("codeforces", cfLevel)}`} />
    </div>
  );
}

export function ConsistencyTracker({
  codeprintData = {},
  codeforcesData = {},
  year: initialYear,
  onYearChange,
  loading = false,
  codeforcesLinked = false,
}: ConsistencyTrackerProps) {
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

  const summary = useMemo(() => {
    let codeprintDays = 0;
    let codeforcesDays = 0;
    let codeprintTotal = 0;
    let codeforcesTotal = 0;

    for (const [date, count] of Object.entries(codeprintData)) {
      if (date.startsWith(String(year)) && count > 0) {
        codeprintDays += 1;
        codeprintTotal += count;
      }
    }
    for (const [date, count] of Object.entries(codeforcesData)) {
      if (date.startsWith(String(year)) && count > 0) {
        codeforcesDays += 1;
        codeforcesTotal += count;
      }
    }

    return { codeprintDays, codeforcesDays, codeprintTotal, codeforcesTotal };
  }, [codeprintData, codeforcesData, year]);

  const today = useMemo(() => startOfDay(new Date()), []);
  const todayStr = formatDateStr(today);

  const weeks = useMemo(() => {
    type DayCell = {
      date: Date;
      dateStr: string;
      inRange: boolean;
    };

    const yearStart = new Date(year, 0, 1);
    const yearEnd =
      year < currentYear
        ? new Date(year, 11, 31)
        : year === currentYear
          ? today
          : new Date(year, 11, 31);

    const gridStart = new Date(yearStart);
    gridStart.setDate(gridStart.getDate() - gridStart.getDay());

    const result: DayCell[][] = [];
    let currentWeek: DayCell[] = [];
    const cursor = new Date(gridStart);

    while (cursor <= yearEnd) {
      const inRange = cursor.getFullYear() === year;
      currentWeek.push({
        date: new Date(cursor),
        dateStr: formatDateStr(cursor),
        inRange,
      });

      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        const lastDate = currentWeek[currentWeek.length - 1].date;
        const nextDate = new Date(lastDate);
        nextDate.setDate(nextDate.getDate() + 1);
        currentWeek.push({
          date: nextDate,
          dateStr: formatDateStr(nextDate),
          inRange: false,
        });
      }
      result.push(currentWeek);
    }

    return result;
  }, [year, currentYear, today]);

  const monthPositions = useMemo(() => {
    const positions: { month: string; startWeek: number }[] = [];

    weeks.forEach((week, weekIndex) => {
      const monthStartDay = week.find(
        (day) => day.inRange && day.date.getFullYear() === year && day.date.getDate() === 1,
      );

      if (monthStartDay) {
        positions.push({ month: MONTHS[monthStartDay.date.getMonth()], startWeek: weekIndex });
        return;
      }

      if (weekIndex === 0) {
        const firstInYear = week.find((day) => day.inRange && day.date.getFullYear() === year);
        if (firstInYear) {
          positions.push({ month: MONTHS[firstInYear.date.getMonth()], startWeek: 0 });
        }
      }
    });

    return positions;
  }, [weeks, year]);

  return (
    <div className="bg-card rounded-xl border border-border/60 p-4 sm:p-6 w-full max-w-5xl box-border shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-foreground text-lg font-semibold">Consistency Tracker</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Daily activity from CodePath platform and your linked Codeforces account.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <button
            type="button"
            onClick={() => setYear((y) => y - 1)}
            disabled={loading}
            className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:pointer-events-none"
            aria-label="Previous year"
          >
            <Icon icon="mdi:chevron-left" className="w-5 h-5" />
          </button>
          <span className="text-foreground font-medium min-w-[60px] text-center">{year}</span>
          <button
            type="button"
            onClick={() => setYear((y) => y + 1)}
            disabled={loading || year >= currentYear}
            className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:pointer-events-none"
            aria-label="Next year"
          >
            <Icon icon="mdi:chevron-right" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <div className="rounded-lg border border-accent/30 bg-accent/10 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-accent/80 font-medium">CodePrint</p>
            <p className="text-lg font-semibold text-foreground mt-1">
              {summary.codeprintDays} active days
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {summary.codeprintTotal} platform activities
            </p>
          </div>
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-emerald-400 font-medium">Codeforces</p>
            <p className="text-lg font-semibold text-foreground mt-1">
              {codeforcesLinked ? `${summary.codeforcesDays} active days` : "Not connected"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {codeforcesLinked
                ? `${summary.codeforcesTotal} submissions`
                : "Connect Codeforces on your profile to track CF activity"}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="overflow-x-auto" aria-busy="true" aria-live="polite">
          <div className="min-w-[800px] flex flex-col gap-3">
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Icon icon="mdi:loading" className="w-6 h-6 animate-spin" aria-hidden />
              <span className="text-sm">Loading activity…</span>
            </div>
            <div className="flex gap-[3px] flex-wrap justify-center max-w-[420px] mx-auto">
              {Array.from({ length: 112 }).map((_, i) => (
                <div
                  key={i}
                  className="w-3.5 h-3.5 rounded-sm bg-muted/60 animate-pulse"
                  style={{ animationDelay: `${i % 7}00ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto pb-1">
          <div style={{ minWidth: `${32 + weekSpanWidth(weeks.length)}px` }}>
            <div className="flex ml-9 mb-2" style={{ gap: `${CELL_GAP_PX}px` }}>
              {monthPositions.map(({ month, startWeek }, index) => {
                const nextPosition = monthPositions[index + 1]?.startWeek ?? weeks.length;
                const weekCount = nextPosition - startWeek;
                return (
                  <div
                    key={`${month}-${startWeek}`}
                    className="text-xs text-muted-foreground font-medium shrink-0"
                    style={{ width: `${weekSpanWidth(weekCount)}px` }}
                  >
                    {month}
                  </div>
                );
              })}
            </div>

            <div className="flex">
              <div
                className="flex flex-col mr-2 shrink-0"
                style={{ gap: `${CELL_GAP_PX}px` }}
              >
                {DAYS.map((day, index) => (
                  <div
                    key={index}
                    className="text-[10px] text-muted-foreground flex items-center justify-end pr-1"
                    style={{ width: "24px", height: `${CELL_SIZE_PX}px` }}
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="flex" style={{ gap: `${CELL_GAP_PX}px` }}>
                {weeks.map((week, weekIndex) => (
                  <div
                    key={weekIndex}
                    className="flex flex-col shrink-0"
                    style={{ gap: `${CELL_GAP_PX}px` }}
                  >
                    {week.map(({ dateStr, inRange }) => (
                      <ActivityCell
                        key={dateStr}
                        dateStr={dateStr}
                        codeprintCount={inRange ? (codeprintData[dateStr] ?? 0) : 0}
                        codeforcesCount={inRange ? (codeforcesData[dateStr] ?? 0) : 0}
                        inRange={inRange}
                        isToday={inRange && dateStr === todayStr && year === currentYear}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-5 pt-4 border-t border-border/50">
              <div className="flex flex-col gap-2">
                <LegendScale source="codeprint" label="CodePrint" />
                <LegendScale source="codeforces" label="Codeforces" />
              </div>
              <p className="text-xs text-muted-foreground max-w-xs">
                Days with both sources show a split cell. Hover a square for exact counts.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
