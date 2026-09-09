"use client";

import { Icon } from "@iconify/react";

interface ProblemsetToolbarProps {
  searchDraft: string;
  onSearchDraftChange: (value: string) => void;
  onSearchSubmit: () => void;
  searchPlaceholder?: string;
  hasActiveFilters: boolean;
  onOpenFilters: () => void;
  resultLabel?: string;
}

export function ProblemsetToolbar({
  searchDraft,
  onSearchDraftChange,
  onSearchSubmit,
  searchPlaceholder = "Search title, tags...",
  hasActiveFilters,
  onOpenFilters,
  resultLabel,
}: ProblemsetToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex flex-col gap-1 min-w-0">
        {resultLabel && (
          <span className="text-sm text-muted-foreground truncate">{resultLabel}</span>
        )}
        {hasActiveFilters && (
          <span className="text-xs text-primary font-medium">Filters active</span>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <form
          className="relative flex-1 sm:flex-initial"
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit();
          }}
        >
          <Icon
            icon="mdi:magnify"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
            aria-hidden
          />
          <input
            type="search"
            value={searchDraft}
            onChange={(e) => onSearchDraftChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full sm:w-52 rounded-lg border border-border bg-background/80 pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary/50"
          />
        </form>
        <button
          type="button"
          onClick={onOpenFilters}
          className={`relative inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            hasActiveFilters
              ? "border-primary/50 bg-primary/10 text-primary"
              : "border-border bg-background/80 text-muted-foreground hover:text-foreground hover:border-primary/30"
          }`}
          aria-label="Filter problems"
        >
          <Icon icon="mage:filter-fill" className="w-5 h-5" aria-hidden />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
}
