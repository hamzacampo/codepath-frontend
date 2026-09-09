"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { CurrentFocusBanner } from "@/components/ui/CurrentFocusBanner";
import { LearningRoadmapTree } from "@/components/ui/LearningRoadmapTree";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { buildTreeFromApiData } from "@/lib/roadmap-data";
import type { TopicNode } from "@/lib/roadmap-data";
import { apiService } from "@/lib/api-service";
import { getApiErrorMessage, isApiNotFoundError } from "@/lib/errors";
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
  first_module_completed: "/Badge 1.png",
};

function achievementToBadgeSrc(iconUrl: string): string {
  return BADGE_IMAGES[iconUrl] ?? "/Badge 1.png";
}

function RoadmapPageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10 opacity-40"
        style={{ backgroundImage: "url(/connected-nodes.png)" }}
        aria-hidden
      />
      <div className="fixed inset-0 -z-10 bg-linear-to-b from-background/30 via-background/80 to-background" aria-hidden />
      <div className="relative w-full max-w-full min-w-0 min-h-full overflow-x-hidden px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="flex flex-col gap-8 lg:gap-10 max-w-6xl mx-auto w-full min-w-0">
          {children}
        </div>
      </div>
    </>
  );
}

function RoadmapLoadingSkeleton() {
  return (
    <RoadmapPageShell>
      <div className="w-full min-w-0 overflow-hidden flex flex-col gap-8 animate-pulse">
        <div className="flex flex-col gap-3 w-full min-w-0">
          <div className="h-9 w-full max-w-56 rounded-lg bg-secondary/80" />
          <div className="h-2 w-full max-w-md rounded-full bg-secondary/60" />
          <div className="h-4 w-full max-w-40 rounded bg-secondary/40" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-xl border border-border/40 bg-card/50"
            />
          ))}
        </div>
        <div className="rounded-2xl border border-border/40 bg-card/40 px-4 sm:px-6 py-8 w-full min-w-0 overflow-hidden">
          <div className="flex flex-col items-center gap-4">
            <div className="h-4 w-full max-w-48 rounded bg-secondary/60" />
            <div className="flex flex-wrap justify-center gap-6 sm:gap-10 w-full">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-3 shrink-0">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-secondary/60" />
                  <div className="h-3 w-20 rounded bg-secondary/40" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-3 py-8 w-full min-w-0">
        <Icon
          icon="mdi:loading"
          className="w-8 h-8 text-primary animate-spin"
          aria-hidden
        />
        <p className="text-sm text-muted-foreground">Loading your roadmap...</p>
      </div>
    </RoadmapPageShell>
  );
}

export default function RoadmapPage() {
  const [summary, setSummary] = useState<RoadmapSummary | null>(null);
  const [modulesWithProgress, setModulesWithProgress] =
    useState<MyRoadmapModulesWithProgress | null>(null);
  const [roadmapDetail, setRoadmapDetail] = useState<RoadmapWithModules | null>(
    null,
  );
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [noRoadmap, setNoRoadmap] = useState(false);
  const [regenerateOpen, setRegenerateOpen] = useState(false);

  const fetchRoadmap = useCallback(async (options?: { preserveGenerateError?: boolean }) => {
    setLoading(true);
    setError(null);
    if (!options?.preserveGenerateError) {
      setGenerateError(null);
    }
    try {
      const [summaryRes, modulesRes, achievementsRes] = await Promise.all([
        apiService.getMyRoadmapSummary(),
        apiService.getMyRoadmapModulesWithProgress(),
        apiService.getMyRoadmapAchievements(),
      ]);
      setSummary(summaryRes);
      setModulesWithProgress(modulesRes);
      setAchievements(achievementsRes);
      setNoRoadmap(false);

      try {
        const roadmap = await apiService.getRoadmapById(modulesRes.learningPathId);
        setRoadmapDetail(roadmap);
      } catch {
        setRoadmapDetail(null);
      }
    } catch (err: unknown) {
      if (isApiNotFoundError(err)) {
        setNoRoadmap(true);
        setError(null);
      } else {
        setError(getApiErrorMessage(err, "Failed to load roadmap"));
        setNoRoadmap(false);
      }
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

  useEffect(() => {
    const refreshOnFocus = () => {
      if (!loading && !noRoadmap) {
        fetchRoadmap();
      }
    };
    window.addEventListener("focus", refreshOnFocus);
    return () => window.removeEventListener("focus", refreshOnFocus);
  }, [fetchRoadmap, loading, noRoadmap]);

  const handleGenerateRoadmap = async () => {
    setGenerating(true);
    setGenerateError(null);
    try {
      await apiService.generateMyRoadmap();
      setNoRoadmap(false);
      setError(null);
      await fetchRoadmap();
    } catch (err) {
      setGenerateError(getApiErrorMessage(err, "Failed to generate roadmap"));
    } finally {
      setGenerating(false);
      setRegenerateOpen(false);
    }
  };

  const tree: TopicNode | null =
    modulesWithProgress
      ? buildTreeFromApiData(modulesWithProgress, roadmapDetail)
      : null;

  const currentFocus =
    modulesWithProgress?.currentModule?.title ?? "Start Journey";

  const roadmapProgress = summary?.progressPercentage ?? 0;

  const statValues = {
    modulesCompleted: summary
      ? `${summary.modulesCompleted}/${summary.totalModules}`
      : "0",
    topicsMastered: summary?.topicsMastered ?? 0,
    activeStreak: summary?.activeStreak
      ? `${summary.activeStreak} day${summary.activeStreak === 1 ? "" : "s"}`
      : "0 days",
    accuracy: summary?.accuracy != null ? `${summary.accuracy}%` : "—",
  };

  const badgeCards =
    achievements.length > 0
      ? achievements.slice(-3).map((a) => ({
          key: String(a.id),
          title: a.name,
          subtitle: a.description,
          src: achievementToBadgeSrc(a.iconUrl),
        }))
      : [
          {
            key: "empty",
            title: "No achievements yet",
            subtitle: "Complete modules to earn badges",
            src: "/Badge 1.png",
          },
        ];

  if (loading) {
    return <RoadmapLoadingSkeleton />;
  }

  if (noRoadmap) {
    return (
      <RoadmapPageShell>
        <div className="max-w-lg mx-auto w-full">
          <div className="rounded-2xl border border-border/80 bg-card/90 backdrop-blur-sm px-6 py-10 sm:px-8 text-center flex flex-col items-center gap-5 shadow-xl shadow-black/10">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/15">
              <Icon
                icon="eos-icons:machine-learning-outlined"
                className="w-9 h-9 text-primary"
                aria-hidden
              />
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                Generate Your Learning Roadmap
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Get a personalized AI-powered roadmap based on your skill
                assessments, quiz performance, CodePath solves, and Codeforces
                stats.
              </p>
            </div>
            {generateError && (
              <div className="w-full rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive text-left">
                {generateError}
              </div>
            )}
            <button
              type="button"
              disabled={generating}
              onClick={handleGenerateRoadmap}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {generating ? (
                <>
                  <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" aria-hidden />
                  Generating roadmap...
                </>
              ) : (
                <>
                  <Icon icon="mdi:sparkles" className="w-5 h-5" aria-hidden />
                  Generate My Roadmap
                </>
              )}
            </button>
            <p className="text-xs text-muted-foreground">
              Complete the skill assessment or solve a few CodePath problems
              first if generation fails.
            </p>
          </div>
        </div>
      </RoadmapPageShell>
    );
  }

  if (error) {
    return (
      <RoadmapPageShell>
        <div className="max-w-lg mx-auto w-full flex flex-col gap-4">
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-5 py-4 text-sm text-destructive">
            {error}
          </div>
          <button
            type="button"
            onClick={() => fetchRoadmap()}
            className="self-center inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Icon icon="mdi:refresh" className="w-4 h-4" aria-hidden />
            Retry
          </button>
        </div>
      </RoadmapPageShell>
    );
  }

  return (
    <RoadmapPageShell>
      <ConfirmDialog
        open={regenerateOpen}
        onOpenChange={setRegenerateOpen}
        title="Regenerate your roadmap?"
        description="This will replace your current roadmap with a newly personalized one based on your latest performance. Progress on your current modules will not carry over."
        confirmLabel="Regenerate Roadmap"
        cancelLabel="Keep Current Roadmap"
        variant="destructive"
        action="confirm"
        loading={generating}
        onConfirm={handleGenerateRoadmap}
      />

      {/* Header */}
      <header className="flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex flex-col gap-3 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                {summary?.learningPathTitle ?? "My Roadmap"}
              </h1>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                  summary?.isPersonalRoadmap
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-secondary/60 text-muted-foreground"
                }`}
              >
                {summary?.isPersonalRoadmap ? "AI personalized" : "Template"}
              </span>
            </div>
            <div className="flex flex-col gap-2 max-w-md">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overall progress</span>
                <span className="font-semibold text-primary tabular-nums">
                  {roadmapProgress}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary/80 overflow-hidden border border-border/40">
                <div
                  className="h-full rounded-full bg-linear-to-r from-primary to-primary/70 transition-all duration-500"
                  style={{ width: `${Math.min(100, roadmapProgress)}%` }}
                />
              </div>
            </div>
          </div>
          <button
            type="button"
            disabled={generating}
            onClick={() => setRegenerateOpen(true)}
            className="inline-flex items-center gap-2 shrink-0 self-start rounded-lg border border-border bg-card/80 backdrop-blur-sm px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary/80 disabled:opacity-50 transition-colors"
          >
            <Icon icon="mdi:refresh" className="w-5 h-5" aria-hidden />
            Regenerate
          </button>
        </div>

        {generateError && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {generateError}
          </div>
        )}
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCardConfig.map(({ key, title, icon }) => (
          <div
            key={key}
            className="rounded-xl border border-border/60 bg-card/70 backdrop-blur-sm p-4 sm:p-5 flex flex-col gap-3 shadow-sm shadow-black/5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight">
                {title}
              </span>
              <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                <Icon icon={icon} className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden />
              </div>
            </div>
            <span className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">
              {statValues[key]}
            </span>
          </div>
        ))}
      </div>

      {/* Badges — centered */}
      <section className="rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden w-full min-w-0">
        <div className="border-b border-border/50 px-6 py-4 text-center">
          <h2 className="text-base sm:text-lg font-semibold text-foreground">
            Recent Achievement Badges
          </h2>
          <p className="text-xs tracking-widest uppercase text-muted-foreground mt-1">
            Your Milestones
          </p>
        </div>
        <div className="px-6 py-8 sm:py-10">
          <div className="flex flex-wrap items-start justify-center gap-x-10 sm:gap-x-16 lg:gap-x-20 gap-y-8">
            {badgeCards.map(({ key, title, subtitle, src }) => (
              <div
                key={key}
                className="flex flex-col items-center text-center gap-3 w-36 sm:w-40"
              >
                <div className="relative flex items-center justify-center">
                  <div
                    className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl scale-150"
                    aria-hidden
                  />
                  <Image
                    src={src}
                    alt={title}
                    width={96}
                    height={96}
                    className="relative h-20 w-20 sm:h-24 sm:w-24 object-contain drop-shadow-[0_0_20px_rgba(255,215,0,0.35)]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-foreground leading-snug">
                    {title}
                  </p>
                  {subtitle && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tree */}
      <section className="flex flex-col gap-8 sm:gap-10 w-full min-w-0 overflow-hidden">
        <CurrentFocusBanner topicName={currentFocus} />

        <div className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm px-2 sm:px-6 py-8 sm:py-10 w-full min-w-0 overflow-hidden">
          {tree ? (
            <LearningRoadmapTree tree={tree} />
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-secondary/30 px-4 py-12 text-center text-muted-foreground">
              No roadmap modules to show.
            </div>
          )}
        </div>
      </section>
    </RoadmapPageShell>
  );
}
