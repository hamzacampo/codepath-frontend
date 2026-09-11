"use client";

import { useCallback, useEffect, useState } from "react";
import { apiService } from "@/lib/api-service";
import { getApiErrorMessage } from "@/lib/errors";
import {
  connectWithMentee,
  formatMenteeRatingLine,
  getMenteeInitials,
} from "@/lib/nearby-mentees-utils";
import { useAuth } from "@/hooks/use-auth";
import { FilterButtons } from "@/components/ui/FilterButtons";
import { NotificationToast } from "@/components/ui/NotificationToast";
import type { NearbyMentee } from "@/types";

export default function NearbyMenteesPage() {
  const { user } = useAuth();
  const [mentees, setMentees] = useState<NearbyMentee[]>([]);
  const [limit, setLimit] = useState("10");
  const [minRating, setMinRating] = useState("");
  const [appliedLimit, setAppliedLimit] = useState(10);
  const [appliedMinRating, setAppliedMinRating] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchMentees = useCallback(() => {
    setLoading(true);
    setError(null);
    return apiService
      .getNearbyMentees({
        minRating: appliedMinRating,
        limit: appliedLimit,
      })
      .then(setMentees)
      .catch((err) => {
        setError(getApiErrorMessage(err, "Failed to load nearby mentees"));
        setMentees([]);
      })
      .finally(() => setLoading(false));
  }, [appliedLimit, appliedMinRating]);

  useEffect(() => {
    fetchMentees();
  }, [fetchMentees]);

  const handleApplyFilter = (event: React.FormEvent) => {
    event.preventDefault();
    const parsedLimit = Number(limit);
    const parsedMinRating = minRating.trim() ? Number(minRating) : undefined;

    if (!Number.isFinite(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      setError("Limit must be between 1 and 100.");
      return;
    }
    if (
      parsedMinRating != null &&
      (!Number.isFinite(parsedMinRating) || parsedMinRating < 0)
    ) {
      setError("Minimum rating must be a non-negative number.");
      return;
    }

    setError(null);
    setAppliedLimit(parsedLimit);
    setAppliedMinRating(parsedMinRating);
  };

  const handleClearFilters = () => {
    setLimit("10");
    setMinRating("");
    setAppliedLimit(10);
    setAppliedMinRating(undefined);
    setError(null);
  };

  const handleConnect = async (peer: NearbyMentee) => {
    setConnectingId(peer.userId);
    try {
      const message = await connectWithMentee(peer);
      setToast({ type: "success", message });
    } catch {
      setToast({
        type: "error",
        message: "Could not connect with this mentee. Please try again.",
      });
    } finally {
      setConnectingId(null);
    }
  };

  const visibleMentees = mentees.filter((mentee) => mentee.userId !== user?.id);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {toast && (
        <NotificationToast
          type={toast.type}
          message={toast.message}
          onDismiss={() => setToast(null)}
        />
      )}

      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-foreground sm:text-[21px]">Nearby Mentees</h1>
          <p className="text-sm text-muted-foreground">
            Discover nearby peer mentees sorted by proximity and rating.
          </p>
        </header>

        <form
          onSubmit={handleApplyFilter}
          className="flex flex-col gap-4 rounded-[10px] border border-[#1e1e1e] bg-[#0c0c0c] p-5 sm:flex-row sm:flex-wrap sm:items-end"
        >
          <label className="flex w-full max-w-[150px] flex-col gap-1.5">
            <span className="text-xs font-semibold text-accent">Limit</span>
            <input
              type="number"
              min={1}
              max={100}
              value={limit}
              onChange={(event) => setLimit(event.target.value)}
              className="h-10 rounded-[10px] border border-[#1e1e1e] bg-black px-3.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
            />
          </label>

          <label className="flex w-full max-w-[200px] flex-col gap-1.5">
            <span className="text-xs font-semibold text-accent">Minimum Rating</span>
            <input
              type="number"
              min={0}
              value={minRating}
              onChange={(event) => setMinRating(event.target.value)}
              placeholder="1200"
              className="h-10 rounded-[10px] border border-[#1e1e1e] bg-black px-3.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
            />
          </label>

          <FilterButtons
            applyLabel="Apply Filter"
            loading={loading}
            onClear={handleClearFilters}
          />
        </form>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-muted-foreground">Finding nearby mentees...</div>
        ) : visibleMentees.length === 0 ? (
          <div className="rounded-[10px] border border-dashed border-[#1e1e1e] px-4 py-12 text-center text-sm text-muted-foreground">
            No nearby mentees found. Try adjusting your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleMentees.map((peer) => (
              <article
                key={peer.userId}
                className="flex flex-col items-center gap-3 rounded-[10px] border border-[#1e1e1e] bg-[#0c0c0c] p-5"
              >
                <div className="flex size-[60px] items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
                  {getMenteeInitials(peer)}
                </div>

                <div className="text-center">
                  <h2 className="text-base font-semibold text-foreground">@{peer.username}</h2>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    {formatMenteeRatingLine(peer)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleConnect(peer)}
                  disabled={connectingId === peer.userId}
                  className="w-full rounded-[10px] bg-accent px-[18px] py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {connectingId === peer.userId ? "Connecting..." : "Connect"}
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
