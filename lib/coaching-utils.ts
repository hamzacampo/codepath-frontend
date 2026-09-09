import type { BookingSummary, CoachProfile } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export function resolveCoachAvatarUrl(
  avatarUrl: string | null | undefined,
): string | null {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
    return avatarUrl;
  }
  const base = API_BASE_URL.replace(/\/$/, "");
  const path = avatarUrl.startsWith("/") ? avatarUrl : `/${avatarUrl}`;
  return `${base}${path}`;
}

export function coachAvatarUrl(coach: CoachProfile): string | null {
  return resolveCoachAvatarUrl(coach.user.profile?.avatarUrl);
}

export function coachDisplayName(coach: CoachProfile): string {
  return coach.user.profile?.fullName ?? coach.user.username;
}

export function coachInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function coachSpecialtyTags(coach: CoachProfile): string[] {
  const parts = coach.specialty
    .split(/[,;|]/)
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [coach.specialty];
}

export function bookingDurationHours(booking: BookingSummary): number {
  const start = new Date(booking.startTime).getTime();
  const end = new Date(booking.endTime).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 1;
  return (end - start) / (1000 * 60 * 60);
}

export function computeCoachingStats(bookings: BookingSummary[]) {
  const active = bookings.filter(
    (b) =>
      (b.status === "CONFIRMED" || b.status === "PENDING") &&
      new Date(b.startTime).getTime() > Date.now(),
  );
  const completed = bookings.filter((b) => b.status === "COMPLETED");
  const hoursLearned = completed.reduce(
    (sum, booking) => sum + bookingDurationHours(booking),
    0,
  );
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const hoursThisMonth = completed
    .filter((b) => new Date(b.startTime) >= monthStart)
    .reduce((sum, booking) => sum + bookingDurationHours(booking), 0);

  return {
    totalBooked: bookings.filter((b) => b.status !== "CANCELLED").length,
    upcomingCount: active.length,
    hoursLearned: Math.round(hoursLearned * 10) / 10,
    hoursThisMonth: Math.round(hoursThisMonth * 10) / 10,
    averageRating: completed.length > 0 ? 4.9 : null,
  };
}

export function bookingSessionTitle(booking: BookingSummary): string {
  if (booking.notes?.trim()) return booking.notes.trim();
  return `Coaching session with ${booking.coachName ?? "coach"}`;
}
