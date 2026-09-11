"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { apiService } from "@/lib/api-service";
import { getApiErrorMessage } from "@/lib/errors";
import type { CoachProfile } from "@/types";
import { CoachAvatar } from "@/components/coaching/CoachAvatar";
import { DateTimeInput } from "@/components/ui/DateTimeInput";

export default function CoachDetailPage() {
  const params = useParams();
  const coachId = typeof params?.id === "string" ? params.id : "";

  const [coach, setCoach] = useState<CoachProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    if (!coachId) return;
    setLoading(true);
    apiService
      .getCoach(coachId)
      .then(setCoach)
      .catch((err) => {
        setError(getApiErrorMessage(err, "Failed to load coach"));
        setCoach(null);
      })
      .finally(() => setLoading(false));
  }, [coachId]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingError(null);
    setBookingSuccess(null);
    try {
      await apiService.createBooking(coachId, {
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        notes: notes.trim() || undefined,
      });
      setBookingSuccess("Booking request submitted. Check My Bookings for status.");
      setStartTime("");
      setEndTime("");
      setNotes("");
    } catch (err) {
      setBookingError(getApiErrorMessage(err, "Failed to create booking"));
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full px-4 py-16 text-center text-muted-foreground">Loading coach...</div>
    );
  }

  if (error || !coach) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-3xl mx-auto">
          <Link href="/dashboard/coaches" className="text-sm text-primary hover:underline">← Back</Link>
          <div className="mt-4 rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {error ?? "Coach not found"}
          </div>
        </div>
      </div>
    );
  }

  const displayName = coach.user.profile?.fullName ?? coach.user.username;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="flex flex-col gap-6 max-w-3xl mx-auto">
        <Link href="/dashboard/coaches" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
          <Icon icon="mdi:arrow-left" className="w-4 h-4" aria-hidden />
          Back to coaching sessions
        </Link>

        <div className="rounded-lg border border-border bg-secondary/40 p-6 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 min-w-0">
              <CoachAvatar coach={coach} size="md" />
              <div className="min-w-0">
              <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>
              <p className="text-primary font-medium">{coach.specialty}</p>
              <p className="text-sm text-muted-foreground mt-1">{coach.user.email}</p>
              </div>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-md border shrink-0 ${
                coach.isAvailable
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {coach.isAvailable ? "Available" : "Unavailable"}
            </span>
          </div>
          {coach.bio && <p className="text-sm text-muted-foreground leading-relaxed">{coach.bio}</p>}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {coach.user.profile?.country && (
              <span className="inline-flex items-center gap-1">
                <Icon icon="mdi:map-marker-outline" className="w-4 h-4" aria-hidden />
                {coach.user.profile.country}
              </span>
            )}
            {coach.hourlyRate && <span>${coach.hourlyRate} / hour</span>}
          </div>
          {coach.bookingLink && (
            <a
              href={coach.bookingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              External booking link
              <Icon icon="mdi:open-in-new" className="w-4 h-4" aria-hidden />
            </a>
          )}
        </div>

        {coach.isAvailable ? (
          <form onSubmit={handleBooking} className="rounded-lg border border-border p-6 flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-foreground">Request a Session</h2>
            {bookingSuccess && (
              <div className="rounded-lg bg-green-500/10 border border-green-500/30 px-4 py-3 text-sm text-green-400">
                {bookingSuccess}
              </div>
            )}
            {bookingError && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
                {bookingError}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Start time</span>
                <DateTimeInput
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">End time</span>
                <DateTimeInput
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </label>
            </div>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Notes (optional)</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
                placeholder="What would you like to focus on?"
              />
            </label>
            <button
              type="submit"
              disabled={bookingLoading}
              className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {bookingLoading ? "Submitting..." : "Request Booking"}
            </button>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">This coach is not accepting bookings right now.</p>
        )}
      </div>
    </div>
  );
}
