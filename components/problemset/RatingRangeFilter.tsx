"use client";

import { useMemo } from "react";
import { Icon } from "@iconify/react";
import { Input } from "@/components/ui/Input";
import {
  formatRatingRange,
  RATING_MAX,
  RATING_MIN,
  RATING_PRESETS,
  RATING_RANGE_SHORTCUTS,
} from "@/lib/problem-filters";

interface RatingRangeFilterProps {
  minRating: number | null;
  maxRating: number | null;
  minInput: string;
  maxInput: string;
  onMinInputChange: (value: string) => void;
  onMaxInputChange: (value: string) => void;
  onSetMin: (value: number | null) => void;
  onSetMax: (value: number | null) => void;
  onSetRange: (min: number | null, max: number | null) => void;
}

export function RatingRangeFilter({
  minRating,
  maxRating,
  minInput,
  maxInput,
  onMinInputChange,
  onMaxInputChange,
  onSetMin,
  onSetMax,
  onSetRange,
}: RatingRangeFilterProps) {
  const rangeInvalid =
    minRating != null && maxRating != null && minRating > maxRating;

  const barStyle = useMemo(() => {
    const min = minRating ?? RATING_MIN;
    const max = maxRating ?? RATING_MAX;
    const span = RATING_MAX - RATING_MIN;
    const left = ((Math.min(min, max) - RATING_MIN) / span) * 100;
    const width = ((Math.max(min, max) - Math.min(min, max)) / span) * 100;
    return { left: `${left}%`, width: `${Math.max(width, 2)}%` };
  }, [minRating, maxRating]);

  return (
    <div className="space-y-4 rounded-xl border border-border/80 bg-muted/20 px-4 py-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon icon="mdi:thunder-outline" className="h-4 w-4 text-primary" aria-hidden />
          <span className="text-sm font-semibold text-foreground">Rating range</span>
        </div>
        <span className="text-xs font-medium text-accent tabular-nums">
          {formatRatingRange(minRating, maxRating)}
        </span>
      </div>

      {/* Visual range bar */}
      <div className="relative h-2 rounded-full bg-border/60 overflow-hidden">
        <div
          className={`absolute top-0 h-full rounded-full transition-all ${
            rangeInvalid ? "bg-destructive/70" : "bg-linear-to-r from-primary/80 to-accent"
          }`}
          style={barStyle}
        />
      </div>

      {/* Custom number inputs */}
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Minimum</span>
          <div className="relative">
            <Input
              type="number"
              inputMode="numeric"
              min={RATING_MIN}
              max={RATING_MAX}
              step={100}
              placeholder="Any"
              value={minInput}
              onChange={(e) => onMinInputChange(e.target.value)}
              className="h-10 bg-background border-border/80 pr-8 tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            {minInput && (
              <button
                type="button"
                onClick={() => {
                  onMinInputChange("");
                  onSetMin(null);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear minimum"
              >
                <Icon icon="mdi:close" className="h-4 w-4" />
              </button>
            )}
          </div>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Maximum</span>
          <div className="relative">
            <Input
              type="number"
              inputMode="numeric"
              min={RATING_MIN}
              max={RATING_MAX}
              step={100}
              placeholder="Any"
              value={maxInput}
              onChange={(e) => onMaxInputChange(e.target.value)}
              className="h-10 bg-background border-border/80 pr-8 tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            {maxInput && (
              <button
                type="button"
                onClick={() => {
                  onMaxInputChange("");
                  onSetMax(null);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear maximum"
              >
                <Icon icon="mdi:close" className="h-4 w-4" />
              </button>
            )}
          </div>
        </label>
      </div>

      {rangeInvalid && (
        <p className="text-xs text-amber-400/90 flex items-center gap-1">
          <Icon icon="mdi:information-outline" className="h-3.5 w-3.5 shrink-0" />
          Min is greater than max — values will be swapped when you apply.
        </p>
      )}

      {/* Range shortcuts */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-muted-foreground">Quick ranges</span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onSetRange(null, null)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              minRating == null && maxRating == null
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            Any
          </button>
          {RATING_RANGE_SHORTCUTS.map(({ label, min, max }) => {
            const active = minRating === min && maxRating === max;
            return (
              <button
                key={label}
                type="button"
                onClick={() => onSetRange(min, max)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {label}
                <span className="ml-1 opacity-70 tabular-nums">{min}–{max}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preset chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border/50">
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">Set minimum</span>
          <div className="flex flex-wrap gap-1.5">
            {RATING_PRESETS.map((value) => (
              <button
                key={`min-${value}`}
                type="button"
                onClick={() => onSetMin(value)}
                className={`rounded-md border px-2.5 py-1 text-xs font-medium tabular-nums transition-colors ${
                  minRating === value
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-border/70 bg-background text-muted-foreground hover:border-primary/40"
                }`}
              >
                {value}+
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">Set maximum</span>
          <div className="flex flex-wrap gap-1.5">
            {RATING_PRESETS.map((value) => (
              <button
                key={`max-${value}`}
                type="button"
                onClick={() => onSetMax(value)}
                className={`rounded-md border px-2.5 py-1 text-xs font-medium tabular-nums transition-colors ${
                  maxRating === value
                    ? "border-accent bg-accent/20 text-accent"
                    : "border-border/70 bg-background text-muted-foreground hover:border-accent/40"
                }`}
              >
                ≤{value}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
