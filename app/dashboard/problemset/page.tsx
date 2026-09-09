"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { apiService } from "@/lib/api-service";
import type { CodeforcesProblem } from "@/types";
import { CodePathProblemList } from "@/components/problemset/CodePathProblemList";
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

type ProblemsetTab = "codepath" | "codeforces";

function ProblemsetPageContent() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<ProblemsetTab>("codepath");

  useEffect(() => {
    const requested = searchParams.get("tab");
    if (requested === "codeforces" || requested === "codepath") {
      setTab(requested);
    }
  }, [searchParams]);
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [maxRating, setMaxRating] = useState<number | null>(null);
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [sort, setSort] = useState<ProblemListSort>("rating_asc");
  const [search, setSearch] = useState("");
  const [searchDraft, setSearchDraft] = useState("");

  const [data, setData] = useState<{
    items: CodeforcesProblem[];
    total: number;
    totalPages: number;
    availableTags?: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isFavourited, isToggling, toggleFavourite } = useProblemFavourites();

  useEffect(() => {
    if (tab !== "codeforces") return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiService
      .getProblems(
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
  }, [tab, page, minRating, maxRating, tagFilter, search, sort]);

  const getExternalProblemId = (p: CodeforcesProblem) =>
    p.contestId != null && p.index != null ? `${p.contestId}${p.index}` : null;

  const hasActiveFilters = hasActiveProblemFilters({
    minRating,
    maxRating,
    tag: tagFilter,
    search,
    sort,
  });

  const clearFilters = () => {
    setMinRating(null);
    setMaxRating(null);
    setTagFilter("all");
    setSort("rating_asc");
    setSearch("");
    setSearchDraft("");
    setPage(1);
  };
  const problemsToShow = data?.items ?? [];
  const uniqueTags = data?.availableTags ?? [];
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
        <div className="flex flex-col gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Problemset</h1>
          <div className="flex gap-1 rounded-lg border border-border bg-card p-1 w-fit">
            <button
              type="button"
              onClick={() => setTab("codepath")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                tab === "codepath"
                  ? "bg-[#7c3aed] text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              CodePath
            </button>
            <button
              type="button"
              onClick={() => setTab("codeforces")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                tab === "codeforces"
                  ? "bg-[#7c3aed] text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              Codeforces (External)
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            {tab === "codepath"
              ? "First-party problems judged on the CodePath platform."
              : "External problems from Codeforces — solve and sync on Codeforces."}
          </p>
        </div>

        {tab === "codepath" ? (
          <CodePathProblemList />
        ) : (
          <>
        <ProblemsetToolbar
          searchDraft={searchDraft}
          onSearchDraftChange={setSearchDraft}
          onSearchSubmit={() => {
            setSearch(searchDraft);
            setPage(1);
          }}
          searchPlaceholder="Search title, tags, contest..."
          hasActiveFilters={hasActiveFilters}
          onOpenFilters={() => setFilterOpen(true)}
          resultLabel={
            loading
              ? "Loading..."
              : total > 0
                ? `Showing ${startNumber}–${endNumber} of ${total} problems`
                : "No problems found"
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">
                          {problem.title}
                        </h3>
                        <ProblemSourceBadge source="codeforces" />
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
                          href={`/dashboard/problems/cf/${problem.contestId}/${problem.index}`}
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

                      <FavouriteToggleButton
                        isFavourited={
                          getExternalProblemId(problem) != null &&
                          isFavourited("Codeforces", getExternalProblemId(problem)!)
                        }
                        disabled={getExternalProblemId(problem) == null}
                        loading={
                          getExternalProblemId(problem) != null &&
                          isToggling("Codeforces", getExternalProblemId(problem)!)
                        }
                        onToggle={() => {
                          const externalId = getExternalProblemId(problem);
                          if (externalId) toggleFavourite("Codeforces", externalId);
                        }}
                      />
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

        <ProblemsetFiltersDialog
          open={filterOpen}
          onOpenChange={setFilterOpen}
          title="Filter Codeforces Problems"
          minRating={minRating}
          maxRating={maxRating}
          tagFilter={tagFilter}
          sort={sort}
          availableTags={uniqueTags}
          onApply={({ minRating: nextMin, maxRating: nextMax, tagFilter: nextTag, sort: nextSort }) => {
            setMinRating(nextMin);
            setMaxRating(nextMax);
            setTagFilter(nextTag);
            setSort(nextSort);
            setPage(1);
          }}
        />
          </>
        )}
      </div>
    </div>
  );
}

export default function ProblemsetPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="max-w-6xl mx-auto rounded-xl border border-border bg-secondary/50 px-4 py-8 text-center text-muted-foreground">
            Loading problemset...
          </div>
        </div>
      }
    >
      <ProblemsetPageContent />
    </Suspense>
  );
}
