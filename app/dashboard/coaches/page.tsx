"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { apiService } from "@/lib/api-service";
import {
  bookingSessionTitle,
  coachDisplayName,
  coachSpecialtyTags,
  computeCoachingStats,
} from "@/lib/coaching-utils";
import { getApiErrorMessage } from "@/lib/errors";
import { BookingStatusBadge } from "@/components/coaching/BookingStatusBadge";
import { CoachingMiniCalendar } from "@/components/coaching/CoachingMiniCalendar";
import { CoachingStatCard } from "@/components/coaching/CoachingStatCard";
import { Select } from "@/components/ui/Select";
import { CoachAvatar } from "@/components/coaching/CoachAvatar";
import type { BookingSummary, CoachProfile } from "@/types";

const SPECIALIZATIONS = ["All", "Algorithms", "Graph Theory", "DP", "Math", "System Design"];
const RATINGS = ["All", "4.5+ Stars", "4.8+ Stars"];
const LANGUAGES = ["All", "C++", "Python", "Java"];

function coachRating(_coach: CoachProfile): number {
  return 5.0;
}

export default function CoachingSessionsPage() {
  const [coaches, setCoaches] = useState<CoachProfile[]>([]);
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [specialization, setSpecialization] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [languageFilter, setLanguageFilter] = useState("All");
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    return Promise.all([apiService.getCoaches(), apiService.getMyBookings()])
      .then(([coachList, bookingList]) => {
        setCoaches(coachList);
        setBookings(bookingList);
      })
      .catch((err) => {
        setError(getApiErrorMessage(err, "Failed to load coaching sessions"));
        setCoaches([]);
        setBookings([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = useMemo(() => computeCoachingStats(bookings), [bookings]);

  const filteredCoaches = useMemo(() => {
    return coaches.filter((coach) => {
      const tags = coachSpecialtyTags(coach).join(" ").toLowerCase();
      const specOk =
        specialization === "All" ||
        tags.includes(specialization.toLowerCase()) ||
        coach.specialty.toLowerCase().includes(specialization.toLowerCase());
      const rating = coachRating(coach);
      const ratingOk =
        ratingFilter === "All" ||
        (ratingFilter === "4.5+ Stars" && rating >= 4.5) ||
        (ratingFilter === "4.8+ Stars" && rating >= 4.8);
      const langOk =
        languageFilter === "All" ||
        tags.includes(languageFilter.toLowerCase()) ||
        coach.specialty.toLowerCase().includes(languageFilter.toLowerCase());
      return specOk && ratingOk && langOk && coach.isAvailable;
    });
  }, [coaches, specialization, ratingFilter, languageFilter]);

  const now = Date.now();
  const upcomingBookings = bookings
    .filter(
      (b) =>
        (b.status === "CONFIRMED" || b.status === "PENDING") &&
        new Date(b.startTime).getTime() >= now,
    )
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const pastBookings = bookings
    .filter((b) => b.status === "COMPLETED" || new Date(b.endTime).getTime() < now)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const highlightedDates = bookings
    .filter((b) => b.status !== "CANCELLED")
    .map((b) => new Date(b.startTime));

  const cancelBooking = async (id: string) => {
    if (!window.confirm("Cancel this booking?")) return;
    setActionId(id);
    try {
      await apiService.updateBookingStatus(id, { status: "CANCELLED" });
      fetchData();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to cancel booking"));
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="relative w-full min-w-0 overflow-x-hidden px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-7">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Coaching Sessions</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Book 1-on-1 sessions with world-class ICPC finalists and grandmasters to optimize
            your problem-solving paradigm.
          </p>
        </header>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <CoachingStatCard
            label="Total Sessions"
            value={loading ? "—" : `${stats.totalBooked} Booked`}
            hint={loading ? "" : `${stats.upcomingCount} active upcoming`}
            icon="mdi:calendar-check-outline"
          />
          <CoachingStatCard
            label="Hours Learned"
            value={loading ? "—" : `${stats.hoursLearned} Hours`}
            hint={loading ? "" : `+${stats.hoursThisMonth} hours this month`}
            icon="mdi:clock-outline"
          />
          <CoachingStatCard
            label="Average Rating"
            value={loading ? "—" : stats.averageRating?.toFixed(2) ?? "—"}
            hint={
              stats.averageRating
                ? "Outstanding feedback received"
                : "Complete a session to rate"
            }
            icon="mdi:star-outline"
          />
        </section>

        <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:flex-wrap sm:items-center">
          <span className="text-sm font-semibold text-foreground">Filters:</span>
          <FilterSelect
            label="Specialization"
            value={specialization}
            options={SPECIALIZATIONS}
            onChange={setSpecialization}
          />
          <FilterSelect
            label="Rating"
            value={ratingFilter}
            options={RATINGS}
            onChange={setRatingFilter}
          />
          <FilterSelect
            label="Language"
            value={languageFilter}
            options={LANGUAGES}
            onChange={setLanguageFilter}
          />
        </section>

        <section id="available-coaches" className="flex flex-col gap-4 scroll-mt-24">
          <h2 className="text-lg font-semibold text-foreground">Available Coaches</h2>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading coaches...</div>
          ) : filteredCoaches.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
              No coaches match your filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {filteredCoaches.map((coach) => {
                const name = coachDisplayName(coach);
                const tags = coachSpecialtyTags(coach);
                const rating = coachRating(coach);
                return (
                  <article
                    key={coach.id}
                    className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5"
                  >
                    <div className="flex items-start gap-3">
                      <CoachAvatar coach={coach} size="sm" />
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold text-foreground">{name}</h3>
                        <div className="mt-1 flex items-center gap-1 text-sm text-amber-400">
                          <Icon icon="mdi:star" className="h-4 w-4" aria-hidden />
                          <span className="font-medium">{rating.toFixed(1)}</span>
                          <span className="text-muted-foreground">/ 5.0</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={tag}
                          className={`rounded-md px-2.5 py-1 text-[11px] font-medium ${
                            index === 0
                              ? "bg-primary/20 text-primary"
                              : "border border-border bg-secondary/60 text-muted-foreground"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/dashboard/coaches/${coach.id}`}
                      className="mt-auto inline-flex items-center justify-center gap-2 self-end rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      Book Session
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
          <div className="flex min-w-0 flex-col gap-6">
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-foreground">Upcoming Booked Sessions</h2>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : upcomingBookings.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                  No upcoming sessions. Book a coach above.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {upcomingBookings.map((booking) => (
                    <article
                      key={booking.id}
                      className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground">
                          {bookingSessionTitle(booking)}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          with {booking.coachName ?? "Coach"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {format(new Date(booking.startTime), "PPP")} ·{" "}
                          {format(new Date(booking.startTime), "p")} –{" "}
                          {format(new Date(booking.endTime), "p")}
                        </p>
                        {booking.meetingUrl && (
                          <a
                            href={booking.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex text-xs text-primary hover:underline"
                          >
                            Join meeting
                          </a>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <BookingStatusBadge status={booking.status} />
                        {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                          <button
                            type="button"
                            disabled={actionId === booking.id}
                            onClick={() => cancelBooking(booking.id)}
                            className="rounded-lg border border-destructive/40 px-2.5 py-1 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-foreground">Past Consultations</h2>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : pastBookings.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                  No past sessions yet.
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="px-4 py-3 font-semibold">Session</th>
                        <th className="hidden px-4 py-3 font-semibold sm:table-cell">Coach</th>
                        <th className="px-4 py-3 font-semibold">Rating</th>
                        <th className="px-4 py-3 font-semibold">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pastBookings.map((booking) => (
                        <tr key={booking.id} className="border-b border-border/60 last:border-0">
                          <td className="px-4 py-3 font-medium text-foreground">
                            {bookingSessionTitle(booking)}
                          </td>
                          <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                            {booking.coachName ?? "—"}
                          </td>
                          <td className="px-4 py-3">
                            {booking.status === "COMPLETED" ? (
                              <span className="font-medium text-green-400">5.0</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {booking.notes ? (
                              <span className="text-primary">{booking.notes}</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>

          <CoachingMiniCalendar
            month={calendarMonth}
            onMonthChange={setCalendarMonth}
            highlightedDates={highlightedDates}
          />
        </div>
      </div>

      <Link
        href="#available-coaches"
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 lg:bottom-8 lg:right-8"
        aria-label="Book a new session"
      >
        <Icon icon="mdi:plus" className="h-7 w-7" aria-hidden />
      </Link>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="inline-flex min-w-[180px] flex-col gap-1.5 text-sm">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        options={options.map((option) => ({ value: option, label: option }))}
      />
    </label>
  );
}
