"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { apiService } from "@/lib/api-service";
import { getApiErrorMessage } from "@/lib/errors";
import type { Topic } from "@/types";

export default function AdminTopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchTopics = useCallback(() => {
    setLoading(true);
    setError(null);
    apiService
      .getTopics()
      .then(setTopics)
      .catch((err) => {
        setError(getApiErrorMessage(err, "Failed to load topics"));
        setTopics([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return topics;
    return topics.filter(
      (topic) =>
        topic.title.toLowerCase().includes(query) ||
        topic.tags?.toLowerCase().includes(query),
    );
  }, [topics, search]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this topic permanently?")) return;
    setDeletingId(id);
    setActionError(null);
    try {
      await apiService.deleteTopic(id);
      fetchTopics();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to delete topic"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="flex flex-col gap-8 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-[32px] font-bold text-foreground leading-none">Topics</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Manage the topic catalog used by AI roadmaps, templates, and contests.
            </p>
          </div>
          <Link
            href="/admin/topics/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors self-start"
          >
            <Icon icon="gridicons:add-outline" className="w-5 h-5" aria-hidden />
            Create Topic
          </Link>
        </div>

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

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or tags..."
            className="w-full sm:max-w-sm rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground"
          />
          <span className="text-sm text-muted-foreground">
            {filtered.length} topic{filtered.length === 1 ? "" : "s"}
          </span>
        </div>

        {loading ? (
          <div className="rounded-xl border border-border bg-card px-4 py-12 text-center text-muted-foreground">
            Loading topics...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card px-4 py-12 text-center text-muted-foreground">
            No topics found.
          </div>
        ) : (
          <div className="rounded-[10px] border border-border overflow-hidden">
            <div className="hidden sm:grid grid-cols-[1.4fr_1.6fr_100px_88px] gap-3 px-6 py-3 bg-white/5 text-sm font-semibold text-foreground">
              <span>Title</span>
              <span>Tags</span>
              <span>Rating</span>
              <span className="text-right">Actions</span>
            </div>
            <ul className="divide-y divide-border">
              {filtered.map((topic) => (
                <li
                  key={topic.id}
                  className="grid grid-cols-1 sm:grid-cols-[1.4fr_1.6fr_100px_88px] gap-3 px-4 sm:px-6 py-4 items-start sm:items-center bg-card/40 hover:bg-card/70 transition-colors"
                >
                  <div>
                    <p className="font-medium text-foreground">{topic.title}</p>
                    <p className="text-xs text-muted-foreground sm:hidden mt-1">
                      {topic.tags}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground truncate hidden sm:block">
                    {topic.tags ?? "—"}
                  </p>
                  <p className="text-sm text-foreground">{topic.rating ?? "—"}</p>
                  <div className="flex items-center justify-start sm:justify-end gap-2">
                    <Link
                      href={`/admin/topics/${topic.id}`}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border text-foreground hover:bg-muted"
                      aria-label={`Edit ${topic.title}`}
                    >
                      <Icon icon="mdi:pencil-outline" className="w-5 h-5" aria-hidden />
                    </Link>
                    <button
                      type="button"
                      disabled={deletingId === topic.id}
                      onClick={() => handleDelete(topic.id)}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/10 disabled:opacity-50"
                      aria-label={`Delete ${topic.title}`}
                    >
                      <Icon icon="mdi:trash-can-outline" className="w-5 h-5" aria-hidden />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
