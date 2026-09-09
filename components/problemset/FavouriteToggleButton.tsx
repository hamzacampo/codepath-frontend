"use client";

import { Icon } from "@iconify/react";

interface FavouriteToggleButtonProps {
  isFavourited: boolean;
  disabled?: boolean;
  loading?: boolean;
  onToggle: () => void;
}

export function FavouriteToggleButton({
  isFavourited,
  disabled = false,
  loading = false,
  onToggle,
}: FavouriteToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center w-9 h-9 min-w-9 min-h-9 shrink-0 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        isFavourited
          ? "text-primary hover:text-primary/90"
          : "text-muted-foreground hover:text-accent"
      }`}
      aria-label={isFavourited ? "Remove from favourites" : "Add to favourites"}
      aria-busy={loading}
    >
      <Icon
        icon={isFavourited ? "mdi:heart" : "mdi:heart-outline"}
        className="w-9 h-9 shrink-0"
        aria-hidden
      />
    </button>
  );
}
