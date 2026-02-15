"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { apiService } from "@/lib/api-service";
import type { FavouriteProblemWithDetails } from "@/types";

export default function FavouriteProblemsPage() {
  const [list, setList] = useState<FavouriteProblemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiService
      .getFavouriteProblems()
      .then(setList)
      .catch(() => {
        setError("Failed to load favourite problems");
        setList([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const removeFromFavourites = async (id: string) => {
    try {
      await apiService.removeProblemFromFavourite(id);
      setList((prev) => prev.filter((f) => f.id !== id));
    } catch {
      // keep list unchanged
    }
  };

  if (error) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-200 mb-6">
          Favorite Problems
        </h1>

        {loading ? (
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 px-4 py-12 text-center text-gray-400">
            Loading...
          </div>
        ) : list.length === 0 ? (
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 px-4 py-12 text-center text-gray-400">
            No favorite problems yet. Add some from the Problemset.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {list.map((fav) => {
              const hasDetails =
                fav.platform === "Codeforces" &&
                fav.title != null &&
                fav.contestId != null &&
                fav.index != null;
              const problemId =
                hasDetails ? `${fav.contestId}${fav.index}` : fav.externalProblemId;

              return (
                <article
                  key={fav.id}
                  className="rounded-2xl bg-linear-to-b from-[#FFFFFF]/25 from-0% via-[#FFFFFF]/20 via-50% to-[#FFFFFF]/6 to-100% border border-black flex flex-col p-4 sm:p-5 min-h-[200px] transition-colors"
                >
                  {/* Header row: #id, rating, heart */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 text-accent text-sm shrink-0 min-w-0">
                      <span className="font-medium truncate">
                        # {problemId}
                      </span>
                      {hasDetails && fav.rating != null && (
                        <span className="inline-flex items-center gap-1 shrink-0">
                          <Icon
                            icon="mdi:thunder-outline"
                            className="w-4 h-4 text-accent"
                            aria-hidden
                          />
                          <span className="text-accent">{fav.rating}</span>
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromFavourites(fav.id)}
                      className="shrink-0 p-1 rounded text-accent hover:text-accent/90 transition-colors"
                      aria-label="Remove from favorites"
                    >
                      <Icon icon="mdi:heart" className="w-6 h-6" aria-hidden />
                    </button>
                  </div>

                  {/* Title */}
                  <h2 className="text-base sm:text-lg font-bold text-gray-200 text-center flex-1 flex items-center justify-center min-h-10">
                    {hasDetails ? fav.title : fav.externalProblemId}
                  </h2>

                  {/* Tags */}
                  {(hasDetails && fav.tags && fav.tags.length > 0) && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {fav.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex rounded-full bg-accent text-black px-2.5 py-1 text-[11px] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Arrow link */}
                  <div className="flex justify-end mt-3 pt-2 border-t border-gray-800/80">
                    {hasDetails ? (
                      <Link
                        href={`/problem/${fav.contestId}/${fav.index}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-foreground/90 transition-colors"
                      >
                        <Icon icon="mdi:arrow-right" className="w-5 h-5 text-foreground" aria-hidden />
                      </Link>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
