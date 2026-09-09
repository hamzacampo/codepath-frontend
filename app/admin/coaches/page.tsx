"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { apiService } from "@/lib/api-service";
import { coachDisplayName, coachSpecialtyTags } from "@/lib/coaching-utils";
import { CoachAvatarEditor } from "@/components/coaching/CoachAvatarEditor";
import { getApiErrorMessage } from "@/lib/errors";
import type { CoachProfile } from "@/types";

export default function AdminCoachSessionPage() {
  const [coaches, setCoaches] = useState<CoachProfile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [bookingLink, setBookingLink] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  const [newName, setNewName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [newSpecialty, setNewSpecialty] = useState("");
  const [newBio, setNewBio] = useState("");
  const [newHourlyRate, setNewHourlyRate] = useState("");
  const [newBookingLink, setNewBookingLink] = useState("");

  const selectedCoach = coaches.find((coach) => coach.id === selectedId) ?? null;

  const fetchCoaches = useCallback(() => {
    setLoading(true);
    setError(null);
    return apiService
      .getCoaches()
      .then((list) => {
        setCoaches(list);
        setSelectedId((current) => {
          if (!current && list.length > 0) return list[0].id;
          if (current && !list.some((coach) => coach.id === current)) {
            return list[0]?.id ?? null;
          }
          return current;
        });
      })
      .catch((err) => {
        setError(getApiErrorMessage(err, "Failed to load coaches"));
        setCoaches([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCoaches();
  }, [fetchCoaches]);

  useEffect(() => {
    if (!selectedCoach) {
      setName("");
      setSpecialty("");
      setBio("");
      setHourlyRate("");
      setBookingLink("");
      setIsAvailable(true);
      return;
    }
    setName(coachDisplayName(selectedCoach));
    setSpecialty(selectedCoach.specialty);
    setBio(selectedCoach.bio ?? "");
    setHourlyRate(selectedCoach.hourlyRate ?? "");
    setBookingLink(selectedCoach.bookingLink ?? "");
    setIsAvailable(selectedCoach.isAvailable);
    setSaveMessage(null);
  }, [selectedCoach]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoach) return;
    setSaving(true);
    setSaveMessage(null);
    setError(null);
    try {
      const result = await apiService.updateCoachProfile(selectedCoach.id, {
        name: name.trim(),
        specialty: specialty.trim(),
        bio,
        hourlyRate: hourlyRate ? Number(hourlyRate) : null,
        isAvailable,
        bookingLink: bookingLink.trim() || undefined,
      });
      setCoaches((prev) =>
        prev.map((coach) => (coach.id === result.coach.id ? result.coach : coach)),
      );
      setSaveMessage("Coach profile updated.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to update coach"));
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const result = await apiService.createCoachAccount({
        name: newName,
        username: newUsername,
        email: newEmail,
        password: newPassword,
        country: newCountry,
        specialty: newSpecialty,
        bio: newBio || undefined,
        hourlyRate: newHourlyRate ? Number(newHourlyRate) : null,
        bookingLink: newBookingLink || undefined,
        isAvailable: true,
      });
      setShowCreate(false);
      setNewName("");
      setNewUsername("");
      setNewEmail("");
      setNewPassword("");
      setNewCountry("");
      setNewSpecialty("");
      setNewBio("");
      setNewHourlyRate("");
      setNewBookingLink("");
      setSelectedId(result.coach.id);
      fetchCoaches();
    } catch (err) {
      setCreateError(getApiErrorMessage(err, "Failed to create coach"));
    } finally {
      setCreating(false);
    }
  };

  const tags = selectedCoach ? coachSpecialtyTags(selectedCoach) : [];

  return (
    <div className="w-full min-w-0 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-7">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Coach Session</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage mentoring configurations, scheduling settings, and coach profiles
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate((open) => !open)}
            className="inline-flex items-center gap-2 self-start rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Icon icon="mdi:plus" className="h-5 w-5" aria-hidden />
            {showCreate ? "Close" : "Create Coach"}
          </button>
        </header>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {showCreate && (
          <form
            onSubmit={handleCreate}
            className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6"
          >
            <h2 className="text-lg font-semibold text-foreground">Create Coach Account</h2>
            {createError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {createError}
              </div>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Full name"
                className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
              />
              <input
                required
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Username"
                className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
              />
              <input
                required
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Email"
                className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
              />
              <input
                required
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Password"
                className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
              />
              <input
                required
                value={newCountry}
                onChange={(e) => setNewCountry(e.target.value)}
                placeholder="Country"
                className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
              />
              <input
                required
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                placeholder="Areas of expertise"
                className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
              />
              <input
                type="number"
                value={newHourlyRate}
                onChange={(e) => setNewHourlyRate(e.target.value)}
                placeholder="Hourly rate (optional)"
                className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
              />
              <input
                value={newBookingLink}
                onChange={(e) => setNewBookingLink(e.target.value)}
                placeholder="Booking link (optional)"
                className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
              />
            </div>
            <textarea
              value={newBio}
              onChange={(e) => setNewBio(e.target.value)}
              placeholder="Biography & coaching philosophy"
              rows={4}
              className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={creating}
              className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Coach"}
            </button>
          </form>
        )}

        {loading ? (
          <div className="py-16 text-center text-muted-foreground">Loading coaches...</div>
        ) : coaches.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
            No coaches yet. Create one to get started.
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {coaches.map((coach) => {
                const label = coachDisplayName(coach);
                const active = coach.id === selectedId;
                return (
                  <button
                    key={coach.id}
                    type="button"
                    onClick={() => setSelectedId(coach.id)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "border-primary bg-primary/20 text-primary"
                        : "border-border text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {selectedCoach && (
              <form
                onSubmit={handleSave}
                className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6 sm:p-8"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-foreground">Coach Profile Details</h2>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                      isAvailable
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-secondary text-muted-foreground"
                    }`}
                  >
                    {isAvailable ? "Active Mentor" : "Inactive"}
                  </span>
                </div>

                {saveMessage && (
                  <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                    {saveMessage}
                  </div>
                )}

                <div className="flex flex-col gap-8 lg:flex-row">
                  <div className="flex flex-col items-center gap-4 lg:w-[220px] shrink-0">
                    <CoachAvatarEditor
                      coach={selectedCoach}
                      onUpdated={(coach) => {
                        setCoaches((prev) =>
                          prev.map((item) => (item.id === coach.id ? coach : item)),
                        );
                      }}
                    />
                    <div className="text-center">
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-lg border border-transparent bg-transparent text-center text-lg font-bold text-foreground outline-none focus:border-border focus:bg-background px-2 py-1"
                        aria-label="Coach name"
                      />
                      <input
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-transparent bg-transparent text-center text-sm text-primary outline-none focus:border-border focus:bg-background px-2 py-1"
                        aria-label="Coach title"
                      />
                      <p className="mt-1 text-xs text-muted-foreground">{selectedCoach.user.email}</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-4">
                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-semibold text-muted-foreground">
                        Biography & Coaching Philosophy
                      </span>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={5}
                        className="min-h-[110px] rounded-lg border border-border bg-background p-4 text-sm leading-relaxed text-foreground"
                        placeholder="Describe the coach's background and mentoring approach..."
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-sm font-semibold text-muted-foreground">
                        Areas of Expertise
                      </span>
                      <input
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="rounded-lg border border-border bg-background px-3 py-3 text-sm text-foreground"
                        placeholder="System Design, Algorithms, Python, Mentorship"
                      />
                    </label>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-muted-foreground">
                          Hourly Rate (USD)
                        </span>
                        <input
                          type="number"
                          value={hourlyRate}
                          onChange={(e) => setHourlyRate(e.target.value)}
                          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                          placeholder="Optional"
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-sm font-semibold text-muted-foreground">
                          Booking Link
                        </span>
                        <input
                          value={bookingLink}
                          onChange={(e) => setBookingLink(e.target.value)}
                          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                          placeholder="https://cal.com/..."
                        />
                      </label>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={isAvailable}
                        onChange={(e) => setIsAvailable(e.target.checked)}
                      />
                      Available for mentee bookings
                    </label>

                    <button
                      type="submit"
                      disabled={saving}
                      className="self-start rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save Profile"}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
