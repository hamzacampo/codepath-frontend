"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { apiService } from "@/lib/api-service";
import type { CodePathProblemListItem } from "@/types";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export interface CodePathProblemPickerProps {
  value: CodePathProblemListItem | null;
  onChange: (problem: CodePathProblemListItem | null) => void;
  excludeIds?: string[];
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function CodePathProblemPicker({
  value,
  onChange,
  excludeIds = [],
  disabled = false,
  placeholder = "Search and select a CodePath problem...",
  className = "",
}: CodePathProblemPickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<CodePathProblemListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const excludeSet = useRef(new Set(excludeIds));
  excludeSet.current = new Set(excludeIds);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchDraft.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchDraft]);

  const fetchProblems = useCallback(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    apiService
      .listAllCodePathProblemsAdmin({
        page,
        limit: PAGE_SIZE,
        status: "PUBLISHED",
        search: search || undefined,
      })
      .then((res) => {
        setItems(res.items);
        setTotalPages(Math.max(1, res.totalPages));
        if (res.totalPages > 0 && page > res.totalPages) {
          setPage(res.totalPages);
        }
      })
      .catch(() => {
        setError("Failed to load problems");
        setItems([]);
        setTotalPages(1);
      })
      .finally(() => setLoading(false));
  }, [open, page, search]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const visibleItems = items.filter((item) => !excludeSet.current.has(item.id));

  const handleSelect = (problem: CodePathProblemListItem) => {
    onChange(problem);
    setOpen(false);
    setSearchDraft("");
    setSearch("");
    setPage(1);
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/40 px-4 py-2.5 text-sm text-left disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        <span className="truncate text-foreground">
          {value ? (
            <>
              <span className="font-medium">{value.title}</span>
              <span className="text-muted-foreground ml-2">· {value.rating}</span>
            </>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </span>
        <Icon
          icon={open ? "mdi:chevron-up" : "mdi:chevron-down"}
          className="w-5 h-5 shrink-0 text-muted-foreground"
          aria-hidden
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-border bg-card shadow-xl overflow-hidden">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Icon
                icon="mdi:magnify"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                aria-hidden
              />
              <input
                type="search"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                placeholder="Search by title or slug..."
                className="w-full rounded-lg border border-border bg-secondary/40 pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-sm text-center text-muted-foreground">
                Loading problems...
              </p>
            ) : error ? (
              <p className="px-4 py-6 text-sm text-center text-destructive">{error}</p>
            ) : visibleItems.length === 0 ? (
              <p className="px-4 py-6 text-sm text-center text-muted-foreground">
                {search ? "No published problems match your search." : "No published problems found."}
              </p>
            ) : (
              visibleItems.map((problem) => (
                <button
                  key={problem.id}
                  type="button"
                  onClick={() => handleSelect(problem)}
                  className={`w-full flex items-start justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-secondary/60 transition-colors ${
                    value?.id === problem.id ? "bg-primary/10" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{problem.title}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {problem.slug}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-foreground">
                      <Icon icon="mdi:thunder-outline" className="w-3.5 h-3.5" aria-hidden />
                      {problem.rating}
                    </span>
                    {problem.tags.length > 0 && (
                      <span className="text-[11px] text-muted-foreground truncate max-w-[120px]">
                        {problem.tags.slice(0, 2).join(", ")}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-border bg-secondary/20">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-md border border-border px-2.5 py-1 text-xs text-foreground hover:bg-muted disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-md border border-border px-2.5 py-1 text-xs text-foreground hover:bg-muted disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
