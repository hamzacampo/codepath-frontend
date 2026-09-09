"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { apiService } from "@/lib/api-service";
import { getApiErrorMessage } from "@/lib/errors";
import { RoadmapLevelBadge } from "@/components/admin/RoadmapLevelBadge";
import { formatRoadmapDate } from "@/components/admin/roadmap-utils";
import type { AdminRoadmapListItem } from "@/types";

export default function AdminRoadmapsPage() {
  const router = useRouter();
  const [roadmaps, setRoadmaps] = useState<AdminRoadmapListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchRoadmaps = useCallback(() => {
    setLoading(true);
    setError(null);
    apiService
      .listAdminRoadmaps()
      .then(setRoadmaps)
      .catch((err) => {
        setError(getApiErrorMessage(err, "Failed to load roadmaps"));
        setRoadmaps([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchRoadmaps();
  }, [fetchRoadmaps]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this roadmap permanently?")) return;
    setDeletingId(id);
    setActionError(null);
    try {
      await apiService.deleteAdminRoadmap(id);
      fetchRoadmaps();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to delete roadmap"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="flex flex-col gap-8 max-w-[936px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-[32px] font-bold text-foreground leading-none">Roadmaps</h1>
          <Link
            href="/admin/roadmaps/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors self-start"
          >
            <Icon icon="gridicons:add-outline" className="w-5 h-5" aria-hidden />
            Create Roadmap
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

        <div className="rounded-[10px] bg-linear-to-r from-white/6 to-white/24 px-6 py-3.5 grid grid-cols-[1.4fr_0.7fr_0.7fr_0.9fr_1fr_72px] gap-3 items-center text-[18px] font-semibold text-white tracking-[0.18px]">
          <span>Title</span>
          <span>Modules</span>
          <span>Duration</span>
          <span>Level</span>
          <span>Created At</span>
          <span className="sr-only">Actions</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-muted-foreground">Loading roadmaps...</div>
        ) : roadmaps.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
            No roadmaps yet.{" "}
            <Link href="/admin/roadmaps/new" className="text-primary hover:underline">
              Create your first roadmap
            </Link>
            .
          </div>
        ) : (
          <div className="flex flex-col">
            {roadmaps.map((roadmap) => (
              <div
                key={roadmap.id}
                className="grid grid-cols-[1.4fr_0.7fr_0.7fr_0.9fr_1fr_72px] gap-3 items-center px-6 py-3 border-b border-border/60 text-[16px] text-foreground tracking-[0.16px]"
              >
                <span className="truncate font-medium">{roadmap.title}</span>
                <span>{roadmap.modulesCount ?? 0}</span>
                <span>{roadmap.duration ?? 0}h</span>
                <div>
                  <RoadmapLevelBadge level={roadmap.skillLevel} />
                </div>
                <span className="truncate">{formatRoadmapDate(roadmap.createdAt)}</span>
                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => router.push(`/admin/roadmaps/${roadmap.id}`)}
                    className="text-primary hover:text-primary/80 transition-colors"
                    aria-label={`Edit ${roadmap.title}`}
                  >
                    <Icon icon="mingcute:edit-line" className="w-5 h-5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    disabled={deletingId === roadmap.id}
                    onClick={() => handleDelete(roadmap.id)}
                    className="text-destructive hover:text-destructive/80 disabled:opacity-50 transition-colors"
                    aria-label={`Delete ${roadmap.title}`}
                  >
                    <Icon
                      icon="material-symbols:delete-outline"
                      className="w-5 h-5"
                      aria-hidden
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
