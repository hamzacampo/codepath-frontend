"use client";

import { useCallback, useEffect, useState } from "react";
import { apiService } from "@/lib/api-service";
import type { FavouriteProblem } from "@/types";

export type FavouritePlatform = "Codeforces" | "CodePath";

function favouriteKey(platform: FavouritePlatform, externalProblemId: string) {
  return `${platform}:${externalProblemId}`;
}

export function useProblemFavourites() {
  const [favourites, setFavourites] = useState<FavouriteProblem[]>([]);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  useEffect(() => {
    apiService
      .getFavouriteProblems()
      .then(setFavourites)
      .catch(() => setFavourites([]));
  }, []);

  const getFavourite = useCallback(
    (platform: FavouritePlatform, externalProblemId: string) =>
      favourites.find(
        (f) => f.platform === platform && f.externalProblemId === externalProblemId,
      ),
    [favourites],
  );

  const isFavourited = useCallback(
    (platform: FavouritePlatform, externalProblemId: string) =>
      !!getFavourite(platform, externalProblemId),
    [getFavourite],
  );

  const isToggling = useCallback(
    (platform: FavouritePlatform, externalProblemId: string) =>
      togglingKey === favouriteKey(platform, externalProblemId),
    [togglingKey],
  );

  const toggleFavourite = useCallback(
    async (platform: FavouritePlatform, externalProblemId: string) => {
      const key = favouriteKey(platform, externalProblemId);
      if (togglingKey === key) return;

      const existing = getFavourite(platform, externalProblemId);
      setTogglingKey(key);

      try {
        if (existing) {
          setFavourites((prev) => prev.filter((f) => f.id !== existing.id));
          if (!existing.id.startsWith("temp-")) {
            await apiService.removeProblemFromFavourite(existing.id);
          }
        } else {
          const tempFav: FavouriteProblem = {
            id: `temp-${key}`,
            externalProblemId,
            platform,
            createdAt: new Date().toISOString(),
          };
          setFavourites((prev) => [...prev, tempFav]);
          await apiService.addProblemToFavourite({
            externalProblemId,
            platform,
          });
          const list = await apiService.getFavouriteProblems();
          setFavourites(list);
        }
      } catch {
        if (existing) {
          setFavourites((prev) => [...prev, existing]);
        } else {
          setFavourites((prev) =>
            prev.filter(
              (f) =>
                !(
                  f.platform === platform &&
                  f.externalProblemId === externalProblemId &&
                  f.id.startsWith("temp-")
                ),
            ),
          );
        }
      } finally {
        setTogglingKey(null);
      }
    },
    [getFavourite, togglingKey],
  );

  return {
    favourites,
    getFavourite,
    isFavourited,
    isToggling,
    toggleFavourite,
  };
}
