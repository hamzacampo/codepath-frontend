"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { apiService } from "@/lib/api-service";
import { getApiErrorMessage } from "@/lib/errors";
import { RoadmapForm } from "@/components/admin/RoadmapForm";
import type { RoadmapWithModules } from "@/types";

export default function AdminEditRoadmapPage() {
  const params = useParams();
  const roadmapId = Number(params.id);
  const [roadmap, setRoadmap] = useState<RoadmapWithModules | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roadmapId || Number.isNaN(roadmapId)) {
      setError("Invalid roadmap ID");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    apiService
      .getRoadmapById(roadmapId)
      .then((data) => {
        if (!cancelled) setRoadmap(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "Failed to load roadmap"));
          setRoadmap(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [roadmapId]);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="flex flex-col gap-6 max-w-[936px] mx-auto">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/roadmaps"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Back to roadmaps"
          >
            <Icon icon="mdi:arrow-left" className="w-5 h-5" aria-hidden />
          </Link>
          <h1 className="text-[32px] font-bold text-foreground leading-none">
            {roadmap?.title ?? "Edit Roadmap"}
          </h1>
        </div>

        {loading ? (
          <div className="py-16 text-center text-muted-foreground">Loading roadmap...</div>
        ) : error ? (
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : roadmap ? (
          <RoadmapForm roadmapId={roadmapId} initialRoadmap={roadmap} />
        ) : null}
      </div>
    </div>
  );
}
