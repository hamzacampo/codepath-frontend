"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { apiService } from "@/lib/api-service";
import { getApiErrorMessage } from "@/lib/errors";
import { VERDICT_COLORS, VERDICT_LABELS } from "@/lib/codepath-problem";
import { ContestStatusBadge } from "@/components/contests/ContestStatusBadge";
import { RulesOfEngagementCard } from "@/components/contests/RulesOfEngagementCard";
import { formatCountdown, isContestContentLocked } from "@/components/contests/contest-utils";
import { useAuth } from "@/hooks/use-auth";
import type {
  ContestDetail,
  ContestScoreboardResponse,
  ContestSubmissionRecord,
  SubmissionVerdict,
} from "@/types";

type ViewTab = "problems" | "scoreboard" | "submissions";

function formatRemaining(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

function problemHref(contestId: string, contestProblemId: string, codePathProblemId: string) {
  const params = new URLSearchParams({
    contestId,
    contestProblemId,
  });
  return `/dashboard/problems/${codePathProblemId}?${params.toString()}`;
}

export default function ContestDetailPage() {
  const params = useParams();
  const contestId = typeof params?.id === "string" ? params.id : "";
  const { user, isAdmin } = useAuth();

  const [contest, setContest] = useState<ContestDetail | null>(null);
  const [scoreboard, setScoreboard] = useState<ContestScoreboardResponse | null>(null);
  const [mySubmissions, setMySubmissions] = useState<ContestSubmissionRecord[]>([]);
  const [tab, setTab] = useState<ViewTab>("problems");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [now, setNow] = useState(Date.now());

  const loadContest = useCallback(async () => {
    if (!contestId) return;
    setLoading(true);
    setError(null);
    try {
      const [detail, subs] = await Promise.all([
        apiService.getContest(contestId),
        apiService.getMyContestSubmissions(contestId),
      ]);
      setContest(detail);
      setMySubmissions(subs.submissions);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load contest"));
      setContest(null);
    } finally {
      setLoading(false);
    }
  }, [contestId]);

  const loadScoreboard = useCallback(async () => {
    if (!contestId) return;
    try {
      const data = await apiService.getContestScoreboard(
        contestId,
        contest?.status === "COMPLETED",
      );
      setScoreboard(data);
    } catch {
      setScoreboard(null);
    }
  }, [contestId, contest?.status]);

  useEffect(() => {
    loadContest();
  }, [loadContest]);

  useEffect(() => {
    if (tab === "scoreboard") loadScoreboard();
  }, [tab, loadScoreboard]);

  useEffect(() => {
    if (contest?.status === "COMPLETED") {
      loadScoreboard();
    }
  }, [contest?.status, loadScoreboard]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isContentLocked = useMemo(() => {
    if (!contest) return false;
    if (contest.contentLocked) return true;
    return isContestContentLocked(contest, now) && !isAdmin;
  }, [contest, now, isAdmin]);

  const wasContentLockedRef = useRef(false);
  useEffect(() => {
    if (wasContentLockedRef.current && !isContentLocked) {
      loadContest();
    }
    wasContentLockedRef.current = isContentLocked;
  }, [isContentLocked, loadContest]);

  const myParticipant = useMemo(
    () => contest?.participants.find((p) => p.userId === user?.id) ?? null,
    [contest, user?.id],
  );

  const isHost = contest?.createdByUserId === user?.id || isAdmin;

  const timeRemainingMs = useMemo(() => {
    if (!myParticipant?.virtualStartTime || !contest) return null;
    const start = new Date(myParticipant.virtualStartTime).getTime();
    const end = start + contest.durationMinutes * 60 * 1000;
    return end - now;
  }, [myParticipant, contest, now]);

  const runAction = async (action: () => Promise<void>, successMsg: string) => {
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await action();
      setActionSuccess(successMsg);
      await loadContest();
      if (tab === "scoreboard") await loadScoreboard();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Action failed"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartVirtual = () =>
    runAction(
      () => apiService.startVirtualContest(contestId).then(() => undefined),
      "Virtual simulation started",
    );

  const handleJoin = () =>
    runAction(() => apiService.joinContest(contestId).then(() => undefined), "Joined contest");

  const handlePublish = () =>
    runAction(() => apiService.publishContest(contestId).then(() => undefined), "Contest published");

  const handleStart = () =>
    runAction(() => apiService.startContest(contestId).then(() => undefined), "Contest started");

  const handleFinish = () =>
    runAction(() => apiService.finishContest(contestId).then(() => undefined), "Participation finished");

  const handleComplete = () =>
    runAction(() => apiService.completeContest(contestId).then(() => undefined), "Contest completed");

  const handleCancel = () => {
    if (!window.confirm("Cancel this contest?")) return;
    runAction(() => apiService.cancelContest(contestId).then(() => undefined), "Contest cancelled");
  };

  const handleDelete = () => {
    if (!window.confirm("Delete this contest permanently?")) return;
    runAction(async () => {
      await apiService.deleteContest(contestId);
      window.location.href = "/dashboard/contests";
    }, "Contest deleted");
  };

  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="max-w-6xl mx-auto py-16 text-center text-muted-foreground">
          Loading contest...
        </div>
      </div>
    );
  }

  if (error || !contest) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="max-w-6xl mx-auto">
          <Link href="/dashboard/contests" className="text-sm text-primary hover:underline mb-4 inline-block">
            ← Back to contests
          </Link>
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {error ?? "Contest not found"}
          </div>
        </div>
      </div>
    );
  }

  const canJoin = !myParticipant && contest.status === "ONGOING";

  const isVirtualRunning =
    myParticipant?.isVirtualReplay &&
    !myParticipant.finished &&
    contest.status === "COMPLETED" &&
    timeRemainingMs != null &&
    timeRemainingMs > 0;

  const isLiveRunning =
    myParticipant &&
    !myParticipant.isVirtualReplay &&
    !myParticipant.finished &&
    contest.status === "ONGOING" &&
    timeRemainingMs != null &&
    timeRemainingMs > 0;

  const isRunningForMe = isVirtualRunning || isLiveRunning;

  const canStartVirtual = contest.status === "COMPLETED" && !isVirtualRunning;

  const getProblemAvailabilityMessage = () => {
    if (isRunningForMe) return null;
    if (contest.status === "COMPLETED") {
      return canStartVirtual
        ? "Start virtual simulation to solve"
        : "Virtual session ended";
    }
    if (contest.status === "ONGOING") {
      return !myParticipant ? "Join to solve" : "Time ended";
    }
    if (contest.status === "SCHEDULED") {
      return "Available when contest starts";
    }
    return "Contest is not open";
  };

  const solvedByLabel = new Map<string, string>();
  for (const sub of mySubmissions) {
    if (sub.verdict === "AC" && !solvedByLabel.has(sub.contestProblemId)) {
      solvedByLabel.set(sub.contestProblemId, sub.verdict);
    }
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="flex flex-col gap-6 max-w-6xl mx-auto">
        <Link href="/dashboard/contests" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
          <Icon icon="mdi:arrow-left" className="w-4 h-4" aria-hidden />
          Back to contests
        </Link>

        <div className="rounded-xl border border-border bg-gradient-to-br from-secondary/60 to-secondary/20 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex flex-col gap-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{contest.title}</h1>
                <ContestStatusBadge status={contest.status} />
              </div>
              {contest.description && (
                <p className="text-sm text-muted-foreground max-w-2xl">{contest.description}</p>
              )}
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-1">
                <span className="inline-flex items-center gap-1">
                  <Icon icon="mdi:clock-outline" className="w-4 h-4" aria-hidden />
                  {contest.durationMinutes} min
                </span>
                <span className="inline-flex items-center gap-1">
                  <Icon icon="mdi:code-braces" className="w-4 h-4" aria-hidden />
                  {contest.problemCount ?? contest.problems.length} problems
                </span>
                <span className="inline-flex items-center gap-1">
                  <Icon icon="mdi:account-group-outline" className="w-4 h-4" aria-hidden />
                  {contest.participants.length} participants
                </span>
                {contest.freezeEnabled && contest.freezeMinutes != null && (
                  <span className="inline-flex items-center gap-1">
                    <Icon icon="mdi:snowflake" className="w-4 h-4" aria-hidden />
                    Freeze: last {contest.freezeMinutes} min
                  </span>
                )}
              </div>
            </div>

            {isRunningForMe && timeRemainingMs != null && (
              <div className="rounded-lg bg-primary/20 border border-primary/40 px-5 py-3 text-center shrink-0">
                <p className="text-xs text-muted-foreground mb-1">
                  {isVirtualRunning ? "Virtual time remaining" : "Time remaining"}
                </p>
                <p className="text-2xl font-mono font-bold text-primary">
                  {formatRemaining(timeRemainingMs)}
                </p>
              </div>
            )}
          </div>
        </div>

        {contest.status === "COMPLETED" && (
          <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-3 text-sm text-purple-200">
            This contest has ended. Start a virtual simulation to practice with the same problems
            and view the official scoreboard.
          </div>
        )}

        {isContentLocked && contest.scheduledStartTime && (
          <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">
            Problems, scoreboard, and submissions unlock when the contest starts in{" "}
            {formatCountdown(new Date(contest.scheduledStartTime).getTime(), now)}.
          </div>
        )}

        {contest.status === "SCHEDULED" && !isContentLocked && contest.scheduledStartTime && (
          <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">
            The contest is about to begin.
          </div>
        )}

        <RulesOfEngagementCard rules={contest.rulesOfEngagement} />

        {(actionSuccess || actionError) && (
          <div
            className={`rounded-xl px-4 py-3 text-sm border ${
              actionSuccess
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-destructive/10 border-destructive/30 text-destructive"
            }`}
          >
            {actionSuccess ?? actionError}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {canJoin && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleJoin}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Join Contest
            </button>
          )}
          {canStartVirtual && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleStartVirtual}
              className="rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-medium text-white hover:bg-[#6d28d9] disabled:opacity-50"
            >
              {myParticipant?.finished ? "Restart Virtual Simulation" : "Start Virtual Simulation"}
            </button>
          )}
          {isHost && contest.status === "DRAFT" && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={handlePublish}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Publish Contest
            </button>
          )}
          {isHost && contest.status === "SCHEDULED" && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleStart}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-600/90 disabled:opacity-50"
            >
              Start Contest
            </button>
          )}
          {isRunningForMe && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleFinish}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              Finish My Participation
            </button>
          )}
          {isHost && contest.status === "ONGOING" && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleComplete}
              className="rounded-lg border border-green-500/40 text-green-400 px-4 py-2 text-sm font-medium hover:bg-green-500/10 disabled:opacity-50"
            >
              Complete Contest
            </button>
          )}
          {isHost && contest.status !== "COMPLETED" && contest.status !== "CANCELLED" && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleCancel}
              className="rounded-lg border border-destructive/40 text-destructive px-4 py-2 text-sm font-medium hover:bg-destructive/10 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          {isHost && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleDelete}
              className="rounded-lg border border-destructive/40 text-destructive px-4 py-2 text-sm font-medium hover:bg-destructive/10 disabled:opacity-50"
            >
              Delete
            </button>
          )}
        </div>

        {isContentLocked ? (
          <div className="rounded-xl border border-dashed border-border bg-secondary/20 px-6 py-14 text-center flex flex-col items-center gap-3">
            <Icon icon="mdi:lock-outline" className="w-10 h-10 text-muted-foreground" aria-hidden />
            <h2 className="text-lg font-semibold text-foreground">Contest content locked</h2>
            <p className="text-sm text-muted-foreground max-w-md">
              The problem set, scoreboard, and submissions will be available when the contest
              starts
              {contest.scheduledStartTime
                ? ` in ${formatCountdown(new Date(contest.scheduledStartTime).getTime(), now)}`
                : ""}
              .
            </p>
          </div>
        ) : (
          <>
        <div className="flex rounded-lg border border-border overflow-hidden">
          {(["problems", "scoreboard", "submissions"] as ViewTab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "problems" && (
          <div className="flex flex-col gap-3">
            {contest.problems.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                No problems in this contest yet.
              </div>
            ) : (
              contest.problems.map((cp) => {
                const solved = solvedByLabel.has(cp.id);
                const canSolve = Boolean(myParticipant && isRunningForMe);
                return (
                  <article
                    key={cp.id}
                    className="rounded-lg border border-border bg-secondary/30 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono font-bold text-sm ${
                          solved
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-muted text-foreground border border-border"
                        }`}
                      >
                        {cp.label}
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-medium text-foreground truncate">{cp.codePathProblem.title}</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            Rating {cp.codePathProblem.rating}
                          </span>
                          {cp.codePathProblem.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs rounded-md bg-primary/10 text-primary px-2 py-0.5"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {canSolve ? (
                      <Link
                        href={problemHref(contestId, cp.id, cp.codePathProblem.id)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 shrink-0"
                      >
                        Solve
                        <Icon icon="mdi:arrow-right" className="w-4 h-4" aria-hidden />
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {getProblemAvailabilityMessage()}
                      </span>
                    )}
                  </article>
                );
              })
            )}
          </div>
        )}

        {tab === "scoreboard" && (
          <div className="overflow-x-auto rounded-lg border border-border">
            {scoreboard?.frozen && (
              <p className="px-4 py-2 text-xs text-amber-400 bg-amber-500/10 border-b border-amber-500/20">
                Scoreboard is frozen for the last {scoreboard.freezeMinutes} minutes.
              </p>
            )}
            {!scoreboard || scoreboard.scoreboard.length === 0 ? (
              <p className="px-4 py-8 text-center text-muted-foreground text-sm">No standings yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Participant</th>
                    <th className="px-4 py-3 text-center">Solved</th>
                    <th className="px-4 py-3 text-center">Penalty</th>
                    {contest.problems.map((p) => (
                      <th key={p.id} className="px-2 py-3 text-center font-mono">{p.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {scoreboard.scoreboard.map((row) => (
                    <tr key={row.participantId} className="border-b border-border/50">
                      <td className="px-4 py-3 font-medium">{row.rank}</td>
                      <td className="px-4 py-3">
                        <span className="font-medium">{row.username}</span>
                        {row.fullName && (
                          <span className="text-muted-foreground text-xs block">{row.fullName}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">{row.solvedCount}</td>
                      <td className="px-4 py-3 text-center">{row.penalty}</td>
                      {row.problems.map((cell, idx) => (
                        <td
                          key={idx}
                          className={`px-2 py-3 text-center text-xs font-mono ${
                            cell.accepted ? "text-green-400" : ""
                          }`}
                        >
                          {cell.accepted
                            ? `+${cell.timeMinutes ?? 0}${cell.wrongAttempts > 0 ? ` (${cell.wrongAttempts})` : ""}`
                            : cell.wrongAttempts > 0
                              ? `-${cell.wrongAttempts}`
                              : "·"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === "submissions" && (
          <div className="rounded-lg border border-border">
            {mySubmissions.length === 0 ? (
              <p className="px-4 py-8 text-center text-muted-foreground text-sm">
                No submissions yet. Solve problems in the contest to submit solutions.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="px-4 py-3 text-left">Problem</th>
                    <th className="px-4 py-3 text-left">Verdict</th>
                    <th className="px-4 py-3 text-left">Language</th>
                    <th className="px-4 py-3 text-left">Time (min)</th>
                  </tr>
                </thead>
                <tbody>
                  {mySubmissions.map((sub) => {
                    const problem = contest.problems.find((p) => p.id === sub.contestProblemId);
                    const verdictKey = sub.verdict as SubmissionVerdict;
                    const verdictLabel = VERDICT_LABELS[verdictKey] ?? sub.verdict;
                    const verdictColor = VERDICT_COLORS[verdictKey] ?? "text-foreground";
                    return (
                      <tr key={sub.id} className="border-b border-border/50">
                        <td className="px-4 py-3 font-mono">
                          {sub.problemLabel ?? problem?.label ?? sub.contestProblemId}
                        </td>
                        <td className={`px-4 py-3 font-medium ${verdictColor}`}>{verdictLabel}</td>
                        <td className="px-4 py-3">{sub.programmingLanguage}</td>
                        <td className="px-4 py-3">{sub.submissionTimeMinutes}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}
