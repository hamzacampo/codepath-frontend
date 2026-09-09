"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { apiService } from "@/lib/api-service";
import { getApiErrorMessage } from "@/lib/errors";
import { ContestStatusBadge } from "@/components/contests/ContestStatusBadge";
import type { ContestSummary } from "@/types";

export default function AdminContestsPage() {
  const [contests, setContests] = useState<ContestSummary[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchContests = useCallback(() => {
    setLoading(true);
    setError(null);
    apiService
      .getContests(statusFilter || undefined)
      .then(setContests)
      .catch((err) => {
        setError(getApiErrorMessage(err, "Failed to load contests"));
        setContests([]);
      })
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => {
    fetchContests();
  }, [fetchContests]);

  const runAction = async (
    id: string,
    action: "publish" | "start" | "complete" | "cancel" | "delete",
  ) => {
    if (action === "delete" && !window.confirm("Delete this contest permanently?")) return;
    setActionId(id);
    setActionError(null);
    try {
      if (action === "publish") await apiService.publishContest(id);
      else if (action === "start") await apiService.startContest(id);
      else if (action === "complete") await apiService.completeContest(id);
      else if (action === "cancel") await apiService.cancelContest(id);
      else await apiService.deleteContest(id);
      fetchContests();
    } catch (err) {
      setActionError(getApiErrorMessage(err, `Failed to ${action} contest`));
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="flex flex-col gap-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Contests</h1>
            <p className="text-sm text-muted-foreground">Manage CodePath virtual contests</p>
          </div>
          <Link
            href="/admin/contests/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Icon icon="mdi:plus" className="w-5 h-5" aria-hidden />
            Create Contest
          </Link>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-48 rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="ONGOING">Ongoing</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        {actionError && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {actionError}
          </div>
        )}
        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-muted-foreground">Loading contests...</div>
        ) : contests.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
            No contests yet.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {contests.map((contest) => (
              <article
                key={contest.id}
                className="rounded-xl border border-border bg-secondary/40 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="font-semibold text-foreground truncate">{contest.title}</h2>
                    <ContestStatusBadge status={contest.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {contest.problemCount} problems · {contest.participantCount} participants · {contest.durationMinutes} min
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <Link
                    href={`/dashboard/contests/${contest.id}`}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                  >
                    View
                  </Link>
                  {contest.status === "DRAFT" && (
                    <button
                      type="button"
                      disabled={actionId === contest.id}
                      onClick={() => runAction(contest.id, "publish")}
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
                    >
                      Publish
                    </button>
                  )}
                  {contest.status === "SCHEDULED" && (
                    <button
                      type="button"
                      disabled={actionId === contest.id}
                      onClick={() => runAction(contest.id, "start")}
                      className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                    >
                      Start
                    </button>
                  )}
                  {contest.status === "ONGOING" && (
                    <button
                      type="button"
                      disabled={actionId === contest.id}
                      onClick={() => runAction(contest.id, "complete")}
                      className="rounded-lg border border-green-500/40 text-green-400 px-3 py-1.5 text-xs disabled:opacity-50"
                    >
                      Complete
                    </button>
                  )}
                  {contest.status !== "COMPLETED" && contest.status !== "CANCELLED" && (
                    <button
                      type="button"
                      disabled={actionId === contest.id}
                      onClick={() => runAction(contest.id, "cancel")}
                      className="rounded-lg border border-amber-500/40 text-amber-400 px-3 py-1.5 text-xs disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={actionId === contest.id}
                    onClick={() => runAction(contest.id, "delete")}
                    className="rounded-lg border border-destructive/40 text-destructive px-3 py-1.5 text-xs disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
