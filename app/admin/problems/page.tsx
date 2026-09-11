"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { apiService } from "@/lib/api-service";
import { Select } from "@/components/ui/Select";
import type { CodePathProblemListItem, ProblemPublishStatus } from "@/types";

const PAGE_SIZE = 20;

export default function AdminProblemsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ProblemPublishStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [data, setData] = useState<{
    items: CodePathProblemListItem[];
    total: number;
    totalPages: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchProblems = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiService
      .listAllCodePathProblemsAdmin({
        page,
        limit: PAGE_SIZE,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        search: search.trim() || undefined,
      })
      .then((res) => {
        if (!cancelled) {
          setData({
            items: res.items,
            total: res.total,
            totalPages: res.totalPages,
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
  }, [page, statusFilter, search]);

  useEffect(() => {
    return fetchProblems();
  }, [fetchProblems]);

  const runAction = async (
    id: string,
    action: "publish" | "unpublish" | "delete",
  ) => {
    if (action === "delete" && !window.confirm("Delete this problem permanently?")) {
      return;
    }
    setActionId(id);
    setActionError(null);
    setActionSuccess(null);
    try {
      if (action === "publish") {
        await apiService.publishCodePathProblem(id);
        setActionSuccess("Problem published");
      } else if (action === "unpublish") {
        await apiService.unpublishCodePathProblem(id);
        setActionSuccess("Problem unpublished");
      } else {
        await apiService.deleteCodePathProblem(id);
        setActionSuccess("Problem deleted");
      }
      fetchProblems();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : undefined;
      setActionError(message ?? `Failed to ${action} problem`);
    } finally {
      setActionId(null);
    }
  };

  const pageCount = data?.totalPages ?? 1;
  const currentPage = Math.min(page, pageCount);

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

  const problems = data?.items ?? [];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="flex flex-col gap-4 sm:gap-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Problems
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage first-party CodePath problems
            </p>
          </div>
          <Link
            href="/admin/problems/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Icon icon="mdi:plus" className="w-5 h-5" aria-hidden />
            Create Problem
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <form
            className="flex flex-1 gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(searchDraft);
              setPage(1);
            }}
          >
            <input
              type="search"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Search by title or slug..."
              className="flex-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Search
            </button>
          </form>
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ProblemPublishStatus | "ALL");
              setPage(1);
            }}
            className="sm:min-w-40"
            options={[
              { value: "ALL", label: "All statuses" },
              { value: "DRAFT", label: "Draft" },
              { value: "PUBLISHED", label: "Published" },
            ]}
          />
        </div>

        {actionSuccess && (
          <div className="rounded-xl bg-green-500/10 border border-green-500/30 px-4 py-3 text-sm text-green-400">
            {actionSuccess}
          </div>
        )}
        {actionError && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {actionError}
          </div>
        )}
        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-muted-foreground">Loading problems...</p>
          </div>
        ) : problems.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-secondary/30 px-4 py-12 text-center">
            <Icon
              icon="mdi:code-braces"
              className="w-12 h-12 mx-auto text-muted-foreground mb-3"
              aria-hidden
            />
            <p className="text-sm text-muted-foreground mb-4">
              {search || statusFilter !== "ALL"
                ? "No problems match your filters."
                : "No problems yet. Create your first CodePath problem."}
            </p>
            <Link
              href="/admin/problems/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Icon icon="mdi:plus" className="w-4 h-4" aria-hidden />
              Create Problem
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {problems.map((problem) => (
              <article
                key={problem.id}
                className="rounded-lg border border-border bg-secondary/40 p-4 sm:p-5 flex flex-col gap-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex flex-col gap-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base sm:text-lg font-semibold text-foreground truncate">
                        {problem.title}
                      </h2>
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                          problem.status === "PUBLISHED"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-muted text-muted-foreground border border-border"
                        }`}
                      >
                        {problem.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      {problem.slug}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-muted px-2 py-0.5 text-xs text-foreground">
                        <Icon icon="mdi:thunder-outline" className="w-3.5 h-3.5" aria-hidden />
                        {problem.rating}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-muted px-2 py-0.5 text-xs text-foreground">
                        <Icon icon="mdi:flask-outline" className="w-3.5 h-3.5" aria-hidden />
                        {problem.testCaseCount ?? 0} cases
                      </span>
                      {problem.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-lg bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Link
                      href={`/admin/problems/${problem.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      <Icon icon="mdi:pencil-outline" className="w-4 h-4" aria-hidden />
                      Edit
                    </Link>
                    {problem.status === "DRAFT" ? (
                      <button
                        type="button"
                        disabled={actionId === problem.id}
                        onClick={() => runAction(problem.id, "publish")}
                        className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                      >
                        <Icon icon="mdi:upload" className="w-4 h-4" aria-hidden />
                        {actionId === problem.id ? "..." : "Publish"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={actionId === problem.id}
                        onClick={() => runAction(problem.id, "unpublish")}
                        className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
                      >
                        <Icon icon="mdi:download" className="w-4 h-4" aria-hidden />
                        {actionId === problem.id ? "..." : "Unpublish"}
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={actionId === problem.id}
                      onClick={() => runAction(problem.id, "delete")}
                      className="inline-flex items-center gap-1 rounded-lg border border-destructive/40 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50 transition-colors"
                    >
                      <Icon icon="mdi:delete-outline" className="w-4 h-4" aria-hidden />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && problems.length > 0 && pageCount > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            {visiblePages.map((p, idx) =>
              typeof p === "string" ? (
                <span key={`${p}-${idx}`} className="px-1 text-muted-foreground">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
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
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
