"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { apiService } from "@/lib/api-service";
import { getApiErrorMessage } from "@/lib/errors";
import { Select } from "@/components/ui/Select";
import { ContestStatusBadge } from "@/components/contests/ContestStatusBadge";
import { LiveContestCard } from "@/components/contests/LiveContestCard";
import { UpcomingContestCard } from "@/components/contests/UpcomingContestCard";
import type { ContestSummary } from "@/types";

type Tab = "all" | "mine";

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-secondary/40 p-4 flex items-center gap-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent}`}>
        <Icon icon={icon} className="w-5 h-5" aria-hidden />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function ContestsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [contests, setContests] = useState<ContestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  const fetchContests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data =
        tab === "mine"
          ? await apiService.getMyContests()
          : await apiService.getContests(statusFilter || undefined);
      setContests(data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load contests"));
      setContests([]);
    } finally {
      setLoading(false);
    }
  }, [tab, statusFilter]);

  useEffect(() => {
    fetchContests();
  }, [fetchContests]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const stats = useMemo(() => {
    const ongoing = contests.filter((c) => c.status === "ONGOING").length;
    const scheduled = contests.filter((c) => c.status === "SCHEDULED").length;
    const completed = contests.filter((c) => c.status === "COMPLETED").length;
    return { total: contests.length, ongoing, scheduled, completed };
  }, [contests]);

  const liveContests = contests.filter((c) => c.status === "ONGOING");
  const upcomingContests = contests.filter((c) => c.status === "SCHEDULED");
  const otherContests = contests.filter(
    (c) => c.status !== "ONGOING" && c.status !== "SCHEDULED",
  );

  const renderContestCard = (contest: ContestSummary, highlight = false) => (
    <article
      key={contest.id}
      className={`rounded-xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors ${
        highlight
          ? "border-green-500/30 bg-green-500/5"
          : "border-border bg-secondary/40 hover:bg-secondary/60"
      }`}
    >
      <div className="flex flex-col gap-2 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base sm:text-lg font-semibold text-foreground truncate">
            {contest.title}
          </h2>
          <ContestStatusBadge status={contest.status} />
        </div>
        {contest.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{contest.description}</p>
        )}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Icon icon="mdi:clock-outline" className="w-4 h-4" aria-hidden />
            {contest.durationMinutes} min
          </span>
          <span className="inline-flex items-center gap-1">
            <Icon icon="mdi:code-braces" className="w-4 h-4" aria-hidden />
            {contest.problemCount} problems
          </span>
          <span className="inline-flex items-center gap-1">
            <Icon icon="mdi:account-group-outline" className="w-4 h-4" aria-hidden />
            {contest.participantCount} participants
          </span>
        </div>
      </div>
      <Link
        href={`/dashboard/contests/${contest.id}`}
        className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shrink-0 ${
          highlight
            ? "bg-green-600 text-white hover:bg-green-600/90"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        }`}
      >
        {contest.status === "ONGOING" ? "Join Now" : "View Contest"}
        <Icon icon="mdi:arrow-right" className="w-4 h-4" aria-hidden />
      </Link>
    </article>
  );

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="flex flex-col gap-6 max-w-6xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Virtual Contests</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Compete in CodePath contests with real judging, track your standing, and improve your
            problem-solving skills.
          </p>
        </div>

        {!loading && tab === "all" && contests.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Total contests"
              value={stats.total}
              icon="mdi:trophy-outline"
              accent="bg-purple-500/20 text-purple-400"
            />
            <StatCard
              label="Live now"
              value={stats.ongoing}
              icon="mdi:play-circle-outline"
              accent="bg-green-500/20 text-green-400"
            />
            <StatCard
              label="Upcoming"
              value={stats.scheduled}
              icon="mdi:calendar-clock"
              accent="bg-blue-500/20 text-blue-400"
            />
            <StatCard
              label="Completed"
              value={stats.completed}
              icon="mdi:check-circle-outline"
              accent="bg-muted text-muted-foreground"
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(["all", "mine"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  tab === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "all" ? "Browse" : "My Contests"}
              </button>
            ))}
          </div>
          {tab === "all" && (
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48"
              options={[
                { value: "", label: "All statuses" },
                { value: "ONGOING", label: "Ongoing" },
                { value: "SCHEDULED", label: "Scheduled" },
                { value: "COMPLETED", label: "Completed" },
                { value: "CANCELLED", label: "Cancelled" },
              ]}
            />
          )}
        </div>

        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-muted-foreground">Loading contests...</div>
        ) : contests.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-secondary/30 px-4 py-12 text-center">
            <Icon icon="mdi:trophy-outline" className="w-12 h-12 mx-auto text-muted-foreground mb-3" aria-hidden />
            <p className="text-sm text-muted-foreground">
              {tab === "mine"
                ? "You have not joined any contests yet."
                : "No contests available. Check back later."}
            </p>
          </div>
        ) : tab === "all" && !statusFilter ? (
          <div className="flex flex-col gap-8">
            {liveContests.length > 0 && (
              <section className="flex flex-col gap-4">
                {liveContests.map((contest) => (
                  <LiveContestCard key={contest.id} contest={contest} now={now} />
                ))}
              </section>
            )}

            {upcomingContests.length > 0 && (
              <section className="flex flex-col gap-4">
                <h2 className="text-xl font-bold text-white">Upcoming Contests</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {upcomingContests.map((contest) => (
                    <UpcomingContestCard key={contest.id} contest={contest} now={now} />
                  ))}
                </div>
              </section>
            )}

            {otherContests.length > 0 && (
              <section className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Past & Other
                </h2>
                {otherContests.map((c) => renderContestCard(c))}
              </section>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {contests.map((contest) =>
              contest.status === "ONGOING"
                ? <LiveContestCard key={contest.id} contest={contest} now={now} />
                : contest.status === "SCHEDULED"
                  ? <UpcomingContestCard key={contest.id} contest={contest} now={now} />
                  : renderContestCard(contest, false),
            )}
          </div>
        )}
      </div>
    </div>
  );
}
