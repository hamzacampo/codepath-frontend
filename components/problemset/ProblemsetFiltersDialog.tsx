"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RatingRangeFilter } from "@/components/problemset/RatingRangeFilter";
import type { ProblemListSort } from "@/lib/problem-filters";
import {
  formatRatingRange,
  normalizeRatingRange,
  parseRatingInput,
  SORT_OPTIONS,
} from "@/lib/problem-filters";

interface ProblemsetFiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  minRating: number | null;
  maxRating: number | null;
  tagFilter: string;
  sort: ProblemListSort;
  availableTags: string[];
  onApply: (values: {
    minRating: number | null;
    maxRating: number | null;
    tagFilter: string;
    sort: ProblemListSort;
  }) => void;
}

export function ProblemsetFiltersDialog({
  open,
  onOpenChange,
  title,
  description = "Filters apply to the full problemset. Results are paginated on the server.",
  minRating,
  maxRating,
  tagFilter,
  sort,
  availableTags,
  onApply,
}: ProblemsetFiltersDialogProps) {
  const [draftMin, setDraftMin] = useState<number | null>(minRating);
  const [draftMax, setDraftMax] = useState<number | null>(maxRating);
  const [minInput, setMinInput] = useState("");
  const [maxInput, setMaxInput] = useState("");
  const [draftTag, setDraftTag] = useState(tagFilter);
  const [draftSort, setDraftSort] = useState(sort);
  const [tagSearch, setTagSearch] = useState("");

  useEffect(() => {
    if (open) {
      setDraftMin(minRating);
      setDraftMax(maxRating);
      setMinInput(minRating != null ? String(minRating) : "");
      setMaxInput(maxRating != null ? String(maxRating) : "");
      setDraftTag(tagFilter);
      setDraftSort(sort);
      setTagSearch("");
    }
  }, [open, minRating, maxRating, tagFilter, sort]);

  const filteredTags = useMemo(() => {
    const q = tagSearch.trim().toLowerCase();
    if (!q) return availableTags;
    return availableTags.filter((t) => t.toLowerCase().includes(q));
  }, [availableTags, tagSearch]);

  const syncFromInputs = () => {
    const parsedMin = parseRatingInput(minInput);
    const parsedMax = parseRatingInput(maxInput);
    setDraftMin(parsedMin);
    setDraftMax(parsedMax);
    return normalizeRatingRange(parsedMin, parsedMax);
  };

  const handleSetMin = (value: number | null) => {
    setDraftMin(value);
    setMinInput(value != null ? String(value) : "");
  };

  const handleSetMax = (value: number | null) => {
    setDraftMax(value);
    setMaxInput(value != null ? String(value) : "");
  };

  const handleSetRange = (min: number | null, max: number | null) => {
    setDraftMin(min);
    setDraftMax(max);
    setMinInput(min != null ? String(min) : "");
    setMaxInput(max != null ? String(max) : "");
  };

  const handleApply = () => {
    const { minRating: nextMin, maxRating: nextMax } = syncFromInputs();
    onApply({
      minRating: nextMin,
      maxRating: nextMax,
      tagFilter: draftTag,
      sort: draftSort,
    });
    onOpenChange(false);
  };

  const handleReset = () => {
    handleSetRange(null, null);
    setDraftTag("all");
    setDraftSort("rating_asc");
    setTagSearch("");
  };

  const activeSummary = [
    (draftMin != null || draftMax != null) && formatRatingRange(draftMin, draftMax),
    draftTag !== "all" && draftTag,
    draftSort !== "rating_asc" && SORT_OPTIONS.find((o) => o.value === draftSort)?.short,
  ].filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Icon icon="mage:filter-fill" className="h-5 w-5 text-primary" aria-hidden />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-lg font-semibold tracking-tight">{title}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {description}
              </DialogDescription>
            </div>
          </div>
          {activeSummary.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {activeSummary.map((item) => (
                <span
                  key={String(item)}
                  className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                >
                  {item}
                </span>
              ))}
            </div>
          )}
        </DialogHeader>

        <div className="space-y-5 px-6 py-5 max-h-[65vh] overflow-y-auto overscroll-contain">
          <RatingRangeFilter
            minRating={draftMin}
            maxRating={draftMax}
            minInput={minInput}
            maxInput={maxInput}
            onMinInputChange={(v) => {
              setMinInput(v);
              setDraftMin(parseRatingInput(v));
            }}
            onMaxInputChange={(v) => {
              setMaxInput(v);
              setDraftMax(parseRatingInput(v));
            }}
            onSetMin={handleSetMin}
            onSetMax={handleSetMax}
            onSetRange={handleSetRange}
          />

          <div className="space-y-3 rounded-xl border border-border/80 bg-muted/20 px-4 py-4">
            <div className="flex items-center gap-2">
              <Icon icon="mdi:sort" className="h-4 w-4 text-primary" aria-hidden />
              <span className="text-sm font-semibold text-foreground">Sort by</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDraftSort(opt.value)}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                    draftSort === opt.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border/80 bg-muted/20 px-4 py-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Icon icon="mdi:tag-outline" className="h-4 w-4 text-primary" aria-hidden />
                <span className="text-sm font-semibold text-foreground">Topic tag</span>
              </div>
              {availableTags.length > 8 && (
                <span className="text-xs text-muted-foreground">{availableTags.length} tags</span>
              )}
            </div>
            {availableTags.length > 8 && (
              <input
                type="search"
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                placeholder="Search tags..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            )}
            <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto overscroll-contain py-0.5">
              <button
                type="button"
                onClick={() => setDraftTag("all")}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  draftTag === "all"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40"
                }`}
              >
                All topics
              </button>
              {filteredTags.length === 0 ? (
                <span className="text-xs text-muted-foreground py-2">No tags match your search.</span>
              ) : (
                filteredTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setDraftTag(tag)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      draftTag === tag
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {tag}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border/80 px-6 py-4 bg-muted/10">
          <button
            type="button"
            className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            onClick={handleReset}
          >
            Reset all
          </button>
          <button
            type="button"
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            onClick={handleApply}
          >
            Apply filters
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
