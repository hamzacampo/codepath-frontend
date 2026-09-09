export type ProblemListSort = "rating_asc" | "rating_desc" | "title_asc";

/** Unified rating presets for CodePath and Codeforces problemsets. */
export const RATING_PRESETS = [800, 1000, 1200, 1400, 1600, 1900, 2100, 2300, 2600] as const;

export const RATING_MIN = 800;
export const RATING_MAX = 3500;

export const RATING_RANGE_SHORTCUTS = [
  { label: "Beginner", min: 800, max: 1200 },
  { label: "Easy", min: 1000, max: 1400 },
  { label: "Medium", min: 1400, max: 1800 },
  { label: "Hard", min: 1800, max: 2300 },
  { label: "Expert", min: 2300, max: 3500 },
] as const;

export const SORT_OPTIONS: { value: ProblemListSort; label: string; short: string }[] = [
  { value: "rating_asc", label: "Rating (low → high)", short: "Rating ↑" },
  { value: "rating_desc", label: "Rating (high → low)", short: "Rating ↓" },
  { value: "title_asc", label: "Title (A → Z)", short: "Title A–Z" },
];

export type ProblemListFilters = {
  minRating: number | null;
  maxRating: number | null;
  tag: string;
  search: string;
  sort: ProblemListSort;
};

export const DEFAULT_PROBLEM_FILTERS: ProblemListFilters = {
  minRating: null,
  maxRating: null,
  tag: "all",
  search: "",
  sort: "rating_asc",
};

export function parseRatingInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = parseInt(trimmed, 10);
  if (Number.isNaN(n)) return null;
  return Math.min(RATING_MAX, Math.max(RATING_MIN, n));
}

export function normalizeRatingRange(
  minRating: number | null,
  maxRating: number | null,
): { minRating: number | null; maxRating: number | null } {
  if (minRating != null && maxRating != null && minRating > maxRating) {
    return { minRating: maxRating, maxRating: minRating };
  }
  return { minRating, maxRating };
}

export function formatRatingRange(min: number | null, max: number | null): string {
  if (min == null && max == null) return "Any rating";
  if (min != null && max != null) return `${min} – ${max}`;
  if (min != null) return `${min}+`;
  return `≤ ${max}`;
}

export function buildProblemListParams(
  page: number,
  limit: number,
  filters: ProblemListFilters,
): Record<string, string | number> {
  const { minRating, maxRating } = normalizeRatingRange(
    filters.minRating,
    filters.maxRating,
  );
  const params: Record<string, string | number> = { page, limit, sort: filters.sort };
  if (minRating != null) params.minRating = minRating;
  if (maxRating != null) params.maxRating = maxRating;
  if (filters.tag && filters.tag !== "all") params.tag = filters.tag;
  if (filters.search.trim()) params.search = filters.search.trim();
  return params;
}

export function hasActiveProblemFilters(filters: ProblemListFilters): boolean {
  return (
    filters.minRating != null ||
    filters.maxRating != null ||
    (filters.tag !== "all" && Boolean(filters.tag)) ||
    Boolean(filters.search.trim()) ||
    filters.sort !== "rating_asc"
  );
}

/** @deprecated Use RATING_PRESETS */
export const PROBLEM_RATING_PRESETS = RATING_PRESETS;
/** @deprecated Use RATING_PRESETS */
export const CODEFORCES_RATING_PRESETS = RATING_PRESETS;
