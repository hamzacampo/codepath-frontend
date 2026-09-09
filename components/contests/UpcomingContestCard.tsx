"use client";

import Link from "next/link";
import type { ContestSummary } from "@/types";
import {
  contestStartMs,
  DIFFICULTY_STYLES,
  formatCountdown,
  formatDurationHours,
} from "./contest-utils";

interface UpcomingContestCardProps {
  contest: ContestSummary;
  now: number;
}

export function UpcomingContestCard({ contest, now }: UpcomingContestCardProps) {
  const difficulty = DIFFICULTY_STYLES[contest.difficulty] ?? DIFFICULTY_STYLES.MEDIUM;
  const startMs = contestStartMs(contest);

  return (
    <article className="rounded-2xl border border-border/60 bg-[#1a1a1a] p-5 flex flex-col gap-4 min-h-[220px]">
      <div className="flex items-center justify-between gap-3">
        <span
          className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${difficulty.badge}`}
        >
          {difficulty.label}
        </span>
        {startMs && (
          <span className="text-xs font-medium text-amber-400">
            Starts in: {formatCountdown(startMs, now)}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5 flex-1">
        <h3 className="text-lg font-bold text-white leading-tight">{contest.title}</h3>
        <p className="text-sm text-muted-foreground">
          {contest.problemCount} Problems · {formatDurationHours(contest.durationMinutes)} Hours
        </p>
      </div>

      <Link
        href={`/dashboard/contests/${contest.id}`}
        className="inline-flex w-full items-center justify-center rounded-xl bg-[#7c3aed] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#6d28d9] transition-colors"
      >
        Join
      </Link>
    </article>
  );
}
