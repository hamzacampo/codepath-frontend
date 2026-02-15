"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiService } from "@/lib/api-service";
import type { CodeforcesProblem, FavouriteProblem } from "@/types";

const PAGE_SIZE = 20;

export default function ProblemsetPage() {
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [draftMinRating, setDraftMinRating] = useState<number | null>(null);
  const [draftTagFilter, setDraftTagFilter] = useState<string>("all");

  useEffect(() => {
    if (filterOpen) {
      setDraftMinRating(minRating);
      setDraftTagFilter(tagFilter);
    }
  }, [filterOpen, minRating, tagFilter]);

  const [data, setData] = useState<{
    items: CodeforcesProblem[];
    total: number;
    totalPages: number;
    availableTags?: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [favourites, setFavourites] = useState<FavouriteProblem[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiService
      .getProblems({
        page,
        limit: PAGE_SIZE,
        minRating: minRating ?? undefined,
        tag: tagFilter === "all" ? undefined : tagFilter,
      })
      .then((res) => {
        if (!cancelled) {
          setData({
            items: res.items,
            total: res.total,
            totalPages: res.totalPages,
            availableTags: res.availableTags,
          });
          if (res.totalPages > 0 && page > res.totalPages) setPage(1);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message ?? "Failed to load problems");
          setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, minRating, tagFilter]);

  useEffect(() => {
    apiService
      .getFavouriteProblems()
      .then(setFavourites)
      .catch(() => setFavourites([]));
  }, []);

  const getExternalProblemId = (p: CodeforcesProblem) =>
    p.contestId != null && p.index != null ? `${p.contestId}${p.index}` : null;
  const getFavouriteForProblem = (p: CodeforcesProblem): FavouriteProblem | undefined =>
    favourites.find(
      (f) =>
        f.platform === "Codeforces" && f.externalProblemId === getExternalProblemId(p)
    );
  const isFavourited = (p: CodeforcesProblem) => !!getFavouriteForProblem(p);

  const [togglingId, setTogglingId] = useState<string | null>(null);

  const toggleFavourite = useCallback(
    async (problem: CodeforcesProblem) => {
      const externalId = getExternalProblemId(problem);
      if (externalId == null) return;
      const existing = getFavouriteForProblem(problem);
      if (togglingId === externalId) return;
      setTogglingId(externalId);
      const toRemove = existing;
      try {
        if (toRemove) {
          setFavourites((prev) => prev.filter((f) => f.id !== toRemove.id));
          if (!toRemove.id.startsWith("temp-")) {
            await apiService.removeProblemFromFavourite(toRemove.id);
          }
        } else {
          const tempFav: FavouriteProblem = {
            id: `temp-${externalId}`,
            externalProblemId: externalId,
            platform: "Codeforces",
            createdAt: new Date().toISOString(),
          };
          setFavourites((prev) => [...prev, tempFav]);
          await apiService.addProblemToFavourite({
            externalProblemId: externalId,
            platform: "Codeforces",
          });
          const list = await apiService.getFavouriteProblems();
          setFavourites(list);
        }
      } catch {
        if (toRemove) {
          setFavourites((prev) => [...prev, toRemove]);
        } else {
          setFavourites((prev) =>
            prev.filter(
              (f) =>
                !(
                  f.platform === "Codeforces" &&
                  f.externalProblemId === externalId &&
                  f.id.startsWith("temp-")
                )
            )
          );
        }
      } finally {
        setTogglingId(null);
      }
    },
    [favourites, togglingId]
  );

  const problemsToShow = data?.items ?? [];
  const uniqueTags = useMemo(() => {
    return (data?.availableTags ?? []).slice();
  }, [data?.availableTags]);

  const pageCount = data?.totalPages ?? 1;
  const currentPage = Math.min(page, pageCount);
  const startNumber = data ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const endNumber = data
    ? Math.min(currentPage * PAGE_SIZE, data.total)
    : 0;
  const total = data?.total ?? 0;

  const goToPage = useCallback(
    (target: number) => {
      const clamped = Math.max(1, Math.min(pageCount, target));
      setPage(clamped);
    },
    [pageCount]
  );

  const visiblePages = useMemo(() => {
    const pages: (number | string)[] = [];
    if (pageCount <= 5) {
      for (let i = 1; i <= pageCount; i += 1) pages.push(i);
      return pages;
    }
    const currentWindowStart = Math.max(2, currentPage - 1);
    const currentWindowEnd = Math.min(pageCount - 1, currentPage + 1);
    pages.push(1);
    if (currentWindowStart > 2) pages.push("prev-ellipsis");
    for (let i = currentWindowStart; i <= currentWindowEnd; i += 1) {
      pages.push(i);
    }
    if (currentWindowEnd < pageCount - 1) pages.push("next-ellipsis");
    pages.push(pageCount);
    return pages;
  }, [currentPage, pageCount]);

  const problemKey = (p: CodeforcesProblem) =>
    `${p.contestId ?? "x"}-${p.index}-${p.title}`;
  const canSolve = (p: CodeforcesProblem) =>
    p.contestId != null && p.index != null;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="flex flex-col gap-4 sm:gap-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-[#666666]">
              {loading
                ? "Loading..."
                : `Showing ${PAGE_SIZE} problems per page`}
            </span>
            {(minRating != null || (tagFilter !== "all" && tagFilter)) && (
              <span className="text-xs text-primary font-medium">
                Filter active
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setDraftMinRating(minRating);
              setDraftTagFilter(tagFilter);
              setFilterOpen(true);
            }}
            className="relative inline-flex items-center justify-center px-3 py-2 text-sm text-[#666666] transition-colors hover:text-foreground"
            aria-label={
              minRating != null || (tagFilter !== "all" && tagFilter)
                ? "Filters active – change filters"
                : "Filter problems"
            }
          >
            <Icon
              icon="mage:filter-fill"
              className={`w-8 h-8 ${minRating != null || (tagFilter !== "all" && tagFilter) ? "text-primary" : "text-[#666666]"}`}
              aria-hidden
            />
            {(minRating != null || (tagFilter !== "all" && tagFilter)) && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 rounded-full bg-primary ring-2 ring-background" aria-hidden />
            )}
          </button>
        </div>

        {(minRating != null || (tagFilter !== "all" && tagFilter)) && !loading && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
            <Icon icon="mdi:filter-check" className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span className="text-sm font-medium text-foreground">Active filters:</span>
            <div className="flex flex-wrap items-center gap-2">
              {minRating != null && (
                <span className="inline-flex items-center gap-1 rounded-lg border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  <Icon icon="mdi:thunder-outline" className="h-3.5 w-3.5" />
                  {minRating}+
                </span>
              )}
              {tagFilter !== "all" && tagFilter && (
                <span className="inline-flex items-center gap-1 rounded-lg border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  <Icon icon="mdi:tag-outline" className="h-3.5 w-3.5" />
                  {tagFilter}
                </span>
              )}
            </div>
            <button
              type="button"
              className="ml-auto rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => {
                setMinRating(null);
                setTagFilter("all");
                setPage(1);
              }}
            >
              Clear filters
            </button>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading && (
          <div className="rounded-xl border border-border bg-secondary/50 px-4 py-8 text-center text-muted-foreground">
            Loading problems...
          </div>
        )}

        {!loading && data && (
          <>
            <div className="flex flex-col gap-3">
              {problemsToShow.length === 0 ? (
                <div className="rounded-xl border border-border bg-secondary/50 px-4 py-8 text-center text-muted-foreground">
                  No problems match your filters. Try a different rating or topic.
                </div>
              ) : (
                problemsToShow.map((problem) => (
                  <article
                    key={problemKey(problem)}
                    className="rounded-xl bg-linear-to-r from-75% to-100% from-secondary to-black hover:from-secondary/70 hover:to-black border border-border/80 px-4 sm:px-5 py-3.5 sm:py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between transition-colors"
                  >
                    <div className="flex flex-col gap-2 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">
                          {problem.title}
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {problem.tags.map((tag) => (
                          <span
                            key={`${problemKey(problem)}-${tag}`}
                            className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <div className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 border border-accent/80">
                          <Icon
                            icon="ant-design:number-outlined"
                            className="w-4 h-4 text-accent"
                            aria-hidden
                          />
                          <span className="text-xs sm:text-sm text-accent">
                            {problem.contestId ?? "—"}
                          </span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 border border-accent/80">
                          <Icon
                            icon="mdi:thunder-outline"
                            className="w-4 h-4 text-accent"
                            aria-hidden
                          />
                          <span className="text-xs sm:text-sm text-accent">
                            {problem.rating ?? "—"}
                          </span>
                        </div>
                      </div>

                      {canSolve(problem) ? (
                        <Link
                          href={`/problem/${problem.contestId}/${problem.index}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-xs sm:text-sm font-semibold text-primary-foreground hover:shadow-[0_0_16px_rgba(87,43,174,0.9)] transition-shadow"
                        >
                          Solve
                          <Icon
                            icon="maki:arrow"
                            className="w-3.5 h-3.5"
                            aria-hidden
                          />
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-5 py-2 text-xs sm:text-sm font-medium text-muted-foreground">
                          Solve
                          <Icon icon="maki:arrow" className="w-3.5 h-3.5" />
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleFavourite(problem)}
                        disabled={
                          getExternalProblemId(problem) == null ||
                          togglingId === getExternalProblemId(problem)
                        }
                        className={`inline-flex items-center justify-center w-9 h-9 min-w-9 min-h-9 shrink-0 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          isFavourited(problem)
                            ? "text-primary hover:text-primary/90"
                            : "text-muted-foreground hover:text-accent"
                        }`}
                        aria-label={isFavourited(problem) ? "Remove from favourites" : "Add to favourites"}
                        aria-busy={togglingId === getExternalProblemId(problem)}
                      >
                        <Icon
                          icon={isFavourited(problem) ? "mdi:heart" : "mdi:heart-outline"}
                          className="w-9 h-9 shrink-0"
                          aria-hidden
                        />
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
              <span className="text-xs sm:text-sm text-[#666666]">
                Showing {startNumber}-{endNumber} of {total} problems
              </span>

              <div className="flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-transparent border border-primary text-primary text-sm hover:text-primary/90 disabled:opacity-40 disabled:text-muted-foreground disabled:border-border"
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <Icon icon="mdi:chevron-left" className="w-4 h-4" />
                </button>

                {visiblePages.map((item) => {
                  if (typeof item === "string") {
                    return (
                      <span
                        key={item}
                        className="w-10 h-10 flex items-center justify-center text-sm text-[#666666]"
                      >
                        ...
                      </span>
                    );
                  }
                  const pageNumber = item;
                  const isActive = pageNumber === currentPage;
                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => goToPage(pageNumber)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium flex items-center justify-center border ${
                        isActive
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-transparent text-primary border-primary hover:text-primary/90"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-transparent border border-primary text-primary text-sm hover:text-primary/90 disabled:opacity-40 disabled:text-muted-foreground disabled:border-border"
                  disabled={currentPage === pageCount}
                  aria-label="Next page"
                >
                  <Icon icon="mdi:chevron-right" className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}

        <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
          <DialogContent className="p-0 gap-0 max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
            <DialogHeader className="px-6 pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Icon icon="mage:filter-fill" className="h-5 w-5 text-primary" aria-hidden />
                </div>
                <div className="space-y-1">
                  <DialogTitle className="text-lg font-semibold tracking-tight">
                    Filter problems
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    Filters apply to the full problemset. Results are paginated.
                  </DialogDescription>
                </div>
              </div>
              {(minRating != null || (tagFilter !== "all" && tagFilter)) && (
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  <Icon icon="mdi:filter-check" className="h-3.5 w-3.5" />
                  {[minRating != null && `${minRating}+`, tagFilter !== "all" && tagFilter]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              )}
            </DialogHeader>

            <div className="space-y-6 px-6 pb-6">
              <div className="space-y-3 rounded-xl border border-border/80 bg-muted/30 px-4 py-4">
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:thunder-outline" className="h-4 w-4 text-primary" aria-hidden />
                  <span className="text-sm font-medium text-foreground">Minimum rating</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[null, 1200, 1400, 1700, 2000, 2300].map((value) => {
                    const isActive = draftMinRating === value;
                    const label = value === null ? "Any" : `${value}+`;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setDraftMinRating(value)}
                        className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-border/80 bg-muted/30 px-4 py-4">
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:tag-outline" className="h-4 w-4 text-primary" aria-hidden />
                  <span className="text-sm font-medium text-foreground">Topic tag</span>
                </div>
                <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto py-0.5 pr-1">
                  <button
                    type="button"
                    onClick={() => setDraftTagFilter("all")}
                    className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
                      draftTagFilter === "all"
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    All topics
                  </button>
                  {uniqueTags.map((tag) => {
                    const isActive = draftTagFilter === tag;
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setDraftTagFilter(tag)}
                        className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border/80 pt-4">
                <button
                  type="button"
                  className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => {
                    setDraftMinRating(null);
                    setDraftTagFilter("all");
                  }}
                >
                  Reset all
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                  onClick={() => {
                    setMinRating(draftMinRating);
                    setTagFilter(draftTagFilter);
                    setPage(1);
                    setFilterOpen(false);
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
