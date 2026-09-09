"use client";

import { Icon } from "@iconify/react";
import type { ProblemListSort } from "@/lib/problem-filters";
import { formatRatingRange, SORT_OPTIONS } from "@/lib/problem-filters";

interface ProblemsetActiveFiltersProps {
  minRating: number | null;
  maxRating: number | null;
  tagFilter: string;
  search: string;
  sort: ProblemListSort;
  onClear: () => void;
}

export function ProblemsetActiveFilters({
  minRating,
  maxRating,
  tagFilter,
  search,
  sort,
  onClear,
}: ProblemsetActiveFiltersProps) {
  const hasFilters =
    minRating != null ||
    maxRating != null ||
    (tagFilter !== "all" && tagFilter) ||
    search.trim() ||
    sort !== "rating_asc";

  if (!hasFilters) return null;

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.short;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3">
      <Icon icon="mdi:filter-check" className="h-4 w-4 shrink-0 text-primary" aria-hidden />
      <span className="text-sm font-medium text-foreground">Active:</span>
      {search.trim() && (
        <span className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-background/60 px-2.5 py-1 text-xs font-medium text-foreground">
          <Icon icon="mdi:magnify" className="h-3.5 w-3.5 text-primary" />
          &ldquo;{search.trim()}&rdquo;
        </span>
      )}
      {(minRating != null || maxRating != null) && (
        <span className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-background/60 px-2.5 py-1 text-xs font-medium text-foreground tabular-nums">
          <Icon icon="mdi:thunder-outline" className="h-3.5 w-3.5 text-primary" />
          {formatRatingRange(minRating, maxRating)}
        </span>
      )}
      {tagFilter !== "all" && tagFilter && (
        <span className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-background/60 px-2.5 py-1 text-xs font-medium text-foreground">
          <Icon icon="mdi:tag-outline" className="h-3.5 w-3.5 text-primary" />
          {tagFilter}
        </span>
      )}
      {sort !== "rating_asc" && sortLabel && (
        <span className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-background/60 px-2.5 py-1 text-xs font-medium text-foreground">
          <Icon icon="mdi:sort" className="h-3.5 w-3.5 text-primary" />
          {sortLabel}
        </span>
      )}
      <button
        type="button"
        className="ml-auto inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        onClick={onClear}
      >
        <Icon icon="mdi:close" className="h-3.5 w-3.5" />
        Clear all
      </button>
    </div>
  );
}
