"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { apiService } from "@/lib/api-service";
import type { CodePathProblemListItem } from "@/types";
import { ProblemSourceBadge } from "@/components/problemset/ProblemSourceBadge";
import { ProblemsetFiltersDialog } from "@/components/problemset/ProblemsetFiltersDialog";
import { ProblemsetActiveFilters } from "@/components/problemset/ProblemsetActiveFilters";
import { ProblemsetToolbar } from "@/components/problemset/ProblemsetToolbar";
import { FavouriteToggleButton } from "@/components/problemset/FavouriteToggleButton";
import { useProblemFavourites } from "@/hooks/use-problem-favourites";
import {
  buildProblemListParams,
  hasActiveProblemFilters,
  type ProblemListSort,
} from "@/lib/problem-filters";

const PAGE_SIZE = 20;

export function CodePathProblemList() {
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [maxRating, setMaxRating] = useState<number | null>(null);
  const [tagFilter, setTagFilter] = useState("all");
  const [sort, setSort] = useState<ProblemListSort>("rating_asc");
  const [search, setSearch] = useState("");
  const [searchDraft, setSearchDraft] = useState("");

  const [data, setData] = useState<{
    items: CodePathProblemListItem[];
    total: number;
    totalPages: number;
    availableTags: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isFavourited, isToggling, toggleFavourite } = useProblemFavourites();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiService
      .listCodePathProblems(
        buildProblemListParams(page, PAGE_SIZE, {
          minRating,
          maxRating,
          tag: tagFilter,
          search,
          sort,
        }),
      )
      .then((res) => {
        if (!cancelled) {
          setData({
            items: res.items,
            total: res.total,
            totalPages: res.totalPages,
            availableTags: res.availableTags ?? [],
          });
          if (res.totalPages > 0 && page > res.totalPages) setPage(1);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message ?? "Failed to load CodePath problems");
          setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, minRating, maxRating, tagFilter, search, sort]);

  const pageCount = data?.totalPages ?? 1;
  const currentPage = Math.min(page, pageCount);
  const availableTags = data?.availableTags ?? [];

  const hasActiveFilters = hasActiveProblemFilters({
    minRating,
    maxRating,
    tag: tagFilter,
    search,
    sort,
  });

  const visiblePages = useMemo(() => {
    const pages: (number | string)[] = [];
    if (pageCount <= 5) {
      for (let i = 1; i <= pageCount; i += 1) pages.push(i);
      return pages;
    }
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(pageCount - 1, currentPage + 1);
    pages.push(1);
    if (start > 2) pages.push("prev-ellipsis");
    for (let i = start; i <= end; i += 1) pages.push(i);
    if (end < pageCount - 1) pages.push("next-ellipsis");
    pages.push(pageCount);
    return pages;
  }, [currentPage, pageCount]);

  const goToPage = useCallback(
    (target: number) => {
      setPage(Math.max(1, Math.min(pageCount, target)));
    },
    [pageCount],
  );

  const clearFilters = () => {
    setMinRating(null);
    setMaxRating(null);
    setTagFilter("all");
    setSort("rating_asc");
    setSearch("");
    setSearchDraft("");
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <ProblemsetToolbar
        searchDraft={searchDraft}
        onSearchDraftChange={setSearchDraft}
        onSearchSubmit={() => {
          setSearch(searchDraft);
          setPage(1);
        }}
        searchPlaceholder="Search title, slug, tags..."
        hasActiveFilters={hasActiveFilters}
        onOpenFilters={() => setFilterOpen(true)}
        resultLabel={
          loading
            ? "Loading..."
            : `${data?.total ?? 0} published CodePath problem${(data?.total ?? 0) === 1 ? "" : "s"}`
        }
      />

      {!loading && (
        <ProblemsetActiveFilters
          minRating={minRating}
          maxRating={maxRating}
          tagFilter={tagFilter}
          search={search}
          sort={sort}
          onClear={clearFilters}
        />
      )}

      {error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-xl border border-border bg-secondary/50 px-4 py-8 text-center text-muted-foreground">
          Loading CodePath problems...
        </div>
      )}

      {!loading && (data?.items.length ?? 0) === 0 && (
        <div className="rounded-xl border border-border bg-secondary/50 px-4 py-8 text-center text-muted-foreground">
          {hasActiveFilters
            ? "No problems match your filters."
            : "No published CodePath problems yet."}
        </div>
      )}

      {!loading && (data?.items.length ?? 0) > 0 && (
        <div className="flex flex-col gap-3">
          {data!.items.map((problem) => (
            <article
              key={problem.id}
              className="rounded-xl bg-linear-to-r from-75% to-100% from-secondary to-black hover:from-secondary/70 hover:to-black border border-border/80 px-4 sm:px-5 py-3.5 sm:py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between transition-colors"
            >
              <div className="flex flex-col gap-2 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">
                    {problem.title}
                  </h3>
                  <ProblemSourceBadge source="codepath" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {problem.tags.map((tag) => (
                    <span
                      key={`${problem.id}-${tag}`}
                      className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                <div className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 border border-accent/80">
                  <Icon icon="mdi:thunder-outline" className="w-4 h-4 text-accent" aria-hidden />
                  <span className="text-xs sm:text-sm text-accent">{problem.rating}</span>
                </div>
                <FavouriteToggleButton
                  isFavourited={isFavourited("CodePath", problem.id)}
                  loading={isToggling("CodePath", problem.id)}
                  onToggle={() => toggleFavourite("CodePath", problem.id)}
                />
                <Link
                  href={`/dashboard/problems/${problem.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-xs sm:text-sm font-semibold text-primary-foreground hover:shadow-[0_0_16px_rgba(87,43,174,0.9)] transition-shadow"
                >
                  Solve
                  <Icon icon="maki:arrow" className="w-3.5 h-3.5" aria-hidden />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && pageCount > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => goToPage(currentPage - 1)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted disabled:opacity-40 transition-colors"
          >
            Previous
          </button>
          {visiblePages.map((p, idx) =>
            typeof p === "string" ? (
              <span key={`${p}-${idx}`} className="px-1 text-muted-foreground">…</span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => goToPage(p)}
                className={`min-w-9 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  p === currentPage
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-foreground hover:bg-muted"
                }`}
              >
                {p}
              </button>
            ),
          )}
          <button
            type="button"
            disabled={currentPage >= pageCount}
            onClick={() => goToPage(currentPage + 1)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted disabled:opacity-40 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      <ProblemsetFiltersDialog
        open={filterOpen}
        onOpenChange={setFilterOpen}
        title="Filter CodePath Problems"
        minRating={minRating}
        maxRating={maxRating}
        tagFilter={tagFilter}
        sort={sort}
        availableTags={availableTags}
        onApply={({ minRating: nextMin, maxRating: nextMax, tagFilter: nextTag, sort: nextSort }) => {
          setMinRating(nextMin);
          setMaxRating(nextMax);
          setTagFilter(nextTag);
          setSort(nextSort);
          setPage(1);
        }}
      />
    </div>
  );
}
