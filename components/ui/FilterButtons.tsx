"use client";

import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

interface FilterButtonsProps {
  applyLabel?: string;
  onClear?: () => void;
  clearLabel?: string;
  loading?: boolean;
  className?: string;
}

export function FilterButtons({
  applyLabel = "Filter",
  onClear,
  clearLabel = "Clear",
  loading = false,
  className,
}: FilterButtonsProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-10 min-w-[108px] items-center justify-center gap-2 rounded-[10px] bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_0_0_1px_rgba(132,101,194,0.25)] transition-all hover:bg-primary/90 hover:shadow-[0_6px_20px_rgba(87,43,174,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Icon
          icon={loading ? "mdi:loading" : "mdi:filter-variant"}
          className={cn("h-4 w-4 shrink-0", loading && "animate-spin")}
          aria-hidden
        />
        {loading ? "Filtering..." : applyLabel}
      </button>

      {onClear && (
        <button
          type="button"
          onClick={onClear}
          disabled={loading}
          className="inline-flex h-10 min-w-24 items-center justify-center gap-2 rounded-[10px] border border-primary/60 bg-primary/5 px-5 text-sm font-semibold text-primary transition-all hover:border-primary hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Icon icon="mdi:filter-off-outline" className="h-4 w-4 shrink-0" aria-hidden />
          {clearLabel}
        </button>
      )}
    </div>
  );
}
