"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { apiService } from "@/lib/api-service";
import { getApiErrorMessage } from "@/lib/errors";
import { useAuth } from "@/hooks/use-auth";
import type { NearbyMentee } from "@/types";

export default function NearbyPeersPage() {
  const { user } = useAuth();
  const [peers, setPeers] = useState<NearbyMentee[]>([]);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [minRating, setMinRating] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPeers = useCallback(() => {
    setLoading(true);
    setError(null);
    return apiService
      .getNearbyMentees({
        country: country.trim() || undefined,
        city: city.trim() || undefined,
        minRating: minRating ? Number(minRating) : undefined,
        limit: 50,
      })
      .then(setPeers)
      .catch((err) => {
        setError(getApiErrorMessage(err, "Failed to load nearby peers"));
        setPeers([]);
      })
      .finally(() => setLoading(false));
  }, [country, city, minRating]);

  useEffect(() => {
    return fetchPeers();
  }, [fetchPeers]);

  const filteredPeers = peers.filter((p) => p.userId !== user?.id);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="flex flex-col gap-6 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Nearby Peers</h1>
          <p className="text-sm text-muted-foreground">
            Find mentees with similar skill level, rating, and location.
          </p>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); fetchPeers(); }}
          className="grid grid-cols-1 sm:grid-cols-4 gap-3"
        >
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Country"
            className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
          />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
          />
          <input
            type="number"
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
            placeholder="Min rating"
            className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
          />
          <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Search
          </button>
        </form>

        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-muted-foreground">Finding peers...</div>
        ) : filteredPeers.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
            No nearby peers found. Try adjusting your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPeers.map((peer) => (
              <article
                key={peer.userId}
                className="rounded-lg border border-border bg-secondary/40 p-4 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-semibold text-foreground">
                      {peer.fullName ?? peer.username}
                    </h2>
                    <p className="text-xs text-muted-foreground">@{peer.username}</p>
                  </div>
                  <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    {Math.round(peer.similarityScore * 100)}% match
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {peer.level && (
                    <span className="inline-flex items-center gap-1">
                      <Icon icon="mdi:medal-outline" className="w-3.5 h-3.5" aria-hidden />
                      {peer.level}
                    </span>
                  )}
                  {peer.rating != null && (
                    <span className="inline-flex items-center gap-1">
                      <Icon icon="mdi:chart-line" className="w-3.5 h-3.5" aria-hidden />
                      {peer.rating}
                    </span>
                  )}
                  {peer.problemsSolved != null && (
                    <span>{peer.problemsSolved} solved</span>
                  )}
                  {peer.accuracy != null && (
                    <span>{Math.round(peer.accuracy)}% accuracy</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {[peer.city, peer.country].filter(Boolean).join(", ") || "Location unknown"}
                  {peer.organization && ` · ${peer.organization}`}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
