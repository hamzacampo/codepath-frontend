"use client";

import Link from "next/link";
import type { ContestSummary } from "@/types";
import { contestEndMs, formatCountdown } from "./contest-utils";

interface LiveContestCardProps {
  contest: ContestSummary;
  now: number;
}

export function LiveContestCard({ contest, now }: LiveContestCardProps) {
  const endMs = contestEndMs(contest);
  const solved = contest.myProgress?.solvedCount ?? 0;
  const total = contest.myProgress?.totalProblems ?? contest.problemCount;
  const rank = contest.myProgress?.rank;
  const progressPct = total > 0 ? Math.round((solved / total) * 100) : 0;
  const isParticipant = contest.myProgress?.isParticipant ?? false;

  return (
    <article className="rounded-2xl border border-[#7c3aed] bg-[#141414] p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-md bg-red-950/80 border border-red-500/30 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          Live Now
        </span>
        <span className="text-xs text-muted-foreground">
          {contest.activeParticipantCount} Programmers Active
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className="text-2xl font-bold text-white">{contest.title}</h3>
        {contest.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{contest.description}</p>
        )}
      </div>

      {isParticipant && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Your Progress: {solved} / {total} Solved
            </span>
            {rank != null && (
              <span className="font-semibold text-green-400">Rank #{rank}</span>
            )}
          </div>
          <div className="h-2 w-full rounded-full bg-[#2a2a2a] overflow-hidden">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Link
          href={`/dashboard/contests/${contest.id}`}
          className="inline-flex items-center justify-center rounded-xl bg-[#7c3aed] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#6d28d9] transition-colors"
        >
          {isParticipant ? "Resume Simulation" : "Join Contest"}
        </Link>
        {endMs && (
          <span className="text-sm font-medium text-amber-400">
            {formatCountdown(endMs, now)} remaining
          </span>
        )}
      </div>
    </article>
  );
}
