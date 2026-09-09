import type { ContestDifficulty, ContestSummary } from "@/types";

export const DIFFICULTY_STYLES: Record<
  ContestDifficulty,
  { badge: string; label: string }
> = {
  EASY: {
    badge: "bg-green-500/15 text-green-400 border-green-500/30",
    label: "Easy",
  },
  MEDIUM: {
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    label: "Medium",
  },
  HARD: {
    badge: "bg-red-500/15 text-red-400 border-red-500/30",
    label: "Hard",
  },
};

export function formatCountdown(targetMs: number, now = Date.now()): string {
  const diff = Math.max(0, targetMs - now);
  const totalMinutes = Math.floor(diff / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${String(hours).padStart(2, "0")}h`;
  }
  return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
}

export function formatDurationHours(durationMinutes: number): string {
  const hours = durationMinutes / 60;
  return hours % 1 === 0 ? String(hours) : hours.toFixed(1);
}

export function contestStartMs(contest: ContestSummary): number | null {
  const start = contest.scheduledStartTime ?? contest.virtualStartTime;
  return start ? new Date(start).getTime() : null;
}

export function contestEndMs(contest: ContestSummary): number | null {
  if (contest.scheduledEndTime) return new Date(contest.scheduledEndTime).getTime();
  const start = contestStartMs(contest);
  if (!start) return null;
  return start + contest.durationMinutes * 60 * 1000;
}

export function isContestContentLocked(
  contest: {
    status: string;
    scheduledStartTime: string | null;
  },
  now = Date.now(),
): boolean {
  if (contest.status !== "SCHEDULED") return false;
  if (!contest.scheduledStartTime) return false;
  return new Date(contest.scheduledStartTime).getTime() > now;
}
