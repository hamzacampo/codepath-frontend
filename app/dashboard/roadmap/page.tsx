"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { CurrentFocusBanner } from "@/components/ui/CurrentFocusBanner";
import { LearningRoadmapTree } from "@/components/ui/LearningRoadmapTree";
import { buildTreeFromApiData } from "@/lib/roadmap-data";
import type { TopicNode } from "@/lib/roadmap-data";
import { apiService } from "@/lib/api-service";
import type {
  RoadmapSummary,
  MyRoadmapModulesWithProgress,
  UserAchievement,
  RoadmapWithModules,
} from "@/types";

const statCardConfig = [
  {
    key: "modulesCompleted" as const,
    title: "Modules Completed",
    icon: "nrk:media-completed",
  },
  {
    key: "topicsMastered" as const,
    title: "Topics Mastered",
    icon: "eos-icons:master-outlined",
  },
  {
    key: "activeStreak" as const,
    title: "Active Streak",
    icon: "mdi:fire",
  },
  {
    key: "accuracy" as const,
    title: "Accuracy",
    icon: "hugeicons:math",
  },
] as const;

const BADGE_IMAGES: Record<string, string> = {
  first_problem_solved: "/Badge 1.png",
  ten_problems_solved: "/Badge 2.png",
  roadmap_starter: "/Badge 3.png",
};

function achievementToBadgeSrc(iconUrl: string): string {
  return BADGE_IMAGES[iconUrl] ?? "/Badge 1.png";
}

export default function RoadmapPage() {
  const [summary, setSummary] = useState<RoadmapSummary | null>(null);
  const [modulesWithProgress, setModulesWithProgress] =
    useState<MyRoadmapModulesWithProgress | null>(null);
  const [roadmapDetail, setRoadmapDetail] = useState<RoadmapWithModules | null>(
    null
  );
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoadmap = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, modulesRes, achievementsRes] = await Promise.all([
        apiService.getMyRoadmapSummary(),
        apiService.getMyRoadmapModulesWithProgress(),
        apiService.getMyRoadmapAchievements(),
      ]);
      setSummary(summaryRes);
      setModulesWithProgress(modulesRes);
      setAchievements(achievementsRes);
      const roadmap = await apiService.getRoadmapById(modulesRes.learningPathId);
      setRoadmapDetail(roadmap);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : null;
      setError(msg ?? "Failed to load roadmap");
      setSummary(null);
      setModulesWithProgress(null);
      setRoadmapDetail(null);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoadmap();
  }, [fetchRoadmap]);

  const tree: TopicNode | null =
    modulesWithProgress && roadmapDetail
      ? buildTreeFromApiData(modulesWithProgress, roadmapDetail)
      : modulesWithProgress
        ? buildTreeFromApiData(modulesWithProgress, null)
        : null;

  const currentFocus =
    modulesWithProgress?.currentModule?.title ?? "Start Journey";

  const statValues = {
    modulesCompleted: summary?.modulesCompleted ?? 0,
    topicsMastered: summary?.modulesCompleted ?? 0,
    activeStreak: "—",
    accuracy: summary?.progressPercentage != null ? `${Math.round(summary.progressPercentage)}%` : "—",
  };

  const badgeCards =
    achievements.length > 0
      ? achievements.slice(-3).map((a) => ({
          title: a.name,
          subtitle: a.description,
          src: achievementToBadgeSrc(a.iconUrl),
        }))
      : [
          { title: "No achievements yet", subtitle: "Complete modules to earn badges", src: "/Badge 1.png" },
        ];

  const pageBg = (
    <div
      className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
      style={{ backgroundImage: "url(/connected-nodes.png)" }}
      aria-hidden
    />
  );

  if (loading) {
    return (
      <>
        {pageBg}
        <div className="relative w-full min-h-screen px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="max-w-6xl mx-auto flex flex-col gap-8">
            <div className="rounded-xl border border-border bg-secondary/50 px-4 py-12 text-center text-muted-foreground">
              Loading roadmap...
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        {pageBg}
        <div className="relative w-full min-h-screen px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="max-w-6xl mx-auto">
            <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              You may need to activate a roadmap (e.g. after completing the skill assessment).
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {pageBg}
      <div className="relative w-full min-h-screen px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="flex flex-col gap-8 max-w-6xl mx-auto">
        {/* Key performance metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {statCardConfig.map(({ key, title, icon }) => (
            <div
              key={key}
              className="rounded-lg bg-linear-to-b from-primary to-black p-4 sm:p-5 box-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-accent-foreground/80 text-sm font-medium">
                  {title}
                </span>
                <span className="text-accent-foreground text-xl sm:text-2xl font-bold truncate">
                  {statValues[key]}
                </span>
              </div>
              <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-accent-foreground/10 text-accent-foreground">
                <Icon
                  icon={icon}
                  className="w-6 h-6 sm:w-7 sm:h-7"
                  aria-hidden
                />
              </div>
            </div>
          ))}
        </div>

        {/* Achievement badges strip */}
        <section className="border-y border-border bg-linear-to-b from-black to-background px-4 sm:px-6 py-6 sm:py-7">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2 className="text-foreground font-semibold text-lg">
                Recent Achievement Badges
              </h2>
              <span className="text-xs tracking-[0.28em] uppercase text-muted-foreground text-right">
                Your Milestones
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 sm:gap-10">
              {badgeCards.map(({ title, subtitle, src }) => (
                <div
                  key={title}
                  className="flex flex-col items-center text-center gap-3 sm:gap-4"
                >
                  <Image
                    src={src}
                    alt={title}
                    width={112}
                    height={112}
                    className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 object-contain drop-shadow-[0_0_24px_rgba(255,215,0,0.4)]"
                    priority
                  />
                  <div className="text-sm sm:text-base leading-relaxed text-accent-foreground max-w-42 sm:max-w-xs">
                    <p className="font-medium">{title}</p>
                    {subtitle && (
                      <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Current focus + roadmap tree */}
        <section className="w-full px-2 sm:px-4 py-8 sm:py-10 flex flex-col gap-8 sm:gap-10">
          <div className="w-full">
            <CurrentFocusBanner topicName={currentFocus} />
          </div>

          {tree ? (
            <LearningRoadmapTree tree={tree} />
          ) : (
            <div className="rounded-xl border border-border bg-secondary/50 px-4 py-8 text-center text-muted-foreground">
              No roadmap modules to show.
            </div>
          )}
        </section>
      </div>
      </div>
    </>
  );
}
