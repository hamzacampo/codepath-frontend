"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import type { TopicNode } from "@/lib/roadmap-data";
import { apiService } from "@/lib/api-service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TopicDonutChart } from "@/components/topic-donut-chart";

interface TopicDetailModalProps {
  node: TopicNode | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const proficiencyColors: Record<string, string> = {
  Beginner: "bg-red-400",
  Moderate: "bg-amber-400",
  Advanced: "bg-emerald-400",
  Expert: "bg-sky-400",
};

export function TopicDetailModal({
  node,
  open,
  onOpenChange,
}: TopicDetailModalProps) {
  const [enrichedPerformance, setEnrichedPerformance] = useState<
    TopicNode["performance"] | null
  >(null);
  const [enrichedProficiency, setEnrichedProficiency] = useState<string | null>(
    null,
  );
  const [enrichedAccuracy, setEnrichedAccuracy] = useState<number | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    if (!open || !node?.topicTitle) {
      setEnrichedPerformance(null);
      setEnrichedProficiency(null);
      setEnrichedAccuracy(null);
      return;
    }

    setEnrichedPerformance(node.performance ?? null);
    setEnrichedProficiency(node.proficiency ?? null);
    setEnrichedAccuracy(node.accuracy ?? null);

    let cancelled = false;
    setLoadingInsights(true);

    apiService
      .getMenteeTopicPerformanceOverview(node.topicTitle)
      .then((data) => {
        if (cancelled) return;

        const breakdown = data.performance_breakdown as
          | {
              roadmap_problems?: number;
              general_problems?: number;
              wrong_submissions?: number;
              accepted_solutions?: number;
            }
          | undefined;

        if (breakdown) {
          setEnrichedPerformance({
            roadmapProblems:
              breakdown.roadmap_problems ?? node.performance?.roadmapProblems ?? 0,
            generalProblems:
              breakdown.general_problems ?? node.performance?.generalProblems ?? 0,
            wrongSubmissions:
              breakdown.wrong_submissions ?? node.performance?.wrongSubmissions ?? 0,
            acceptedSolutions:
              breakdown.accepted_solutions ??
              node.performance?.acceptedSolutions ??
              0,
          });
        }

        const proficiency = data.proficiency_level as string | undefined;
        if (proficiency) setEnrichedProficiency(proficiency);

        const accuracy = data.accuracy_rate as number | undefined;
        if (accuracy != null) setEnrichedAccuracy(Math.round(accuracy));
      })
      .catch(() => {
        // Keep module-level stats when Codeforces insights are unavailable.
      })
      .finally(() => {
        if (!cancelled) setLoadingInsights(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, node]);

  if (!node) return null;

  const profColor =
    proficiencyColors[enrichedProficiency ?? node.proficiency ?? "Moderate"] ??
    "bg-amber-400";
  const performance = enrichedPerformance ?? node.performance;
  const accuracy = enrichedAccuracy ?? node.accuracy ?? 0;
  const proficiency = enrichedProficiency ?? node.proficiency ?? "N/A";

  const statCards = [
    {
      label: "Proficiency",
      value: proficiency,
      dot: profColor,
    },
    {
      label: "Accuracy",
      value: `${accuracy}%`,
    },
    ...(node.progress != null
      ? [{ label: "Module progress", value: `${node.progress}%` }]
      : []),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-card text-foreground border border-border/80 shadow-2xl p-0">
        <div className="flex flex-col gap-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-border/60 px-6 py-5 sm:px-8 sm:py-6">
            <DialogHeader className="flex-1 gap-3 text-left">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/15 shrink-0">
                  <Icon
                    icon={node.icon ?? "mdi:book"}
                    className="w-5 h-5 text-primary"
                    aria-hidden
                  />
                </div>
                <DialogTitle className="text-xl font-bold text-foreground leading-tight">
                  {node.name}
                </DialogTitle>
              </div>
              {node.topicTitle && node.topicTitle !== node.name && (
                <DialogDescription className="text-sm text-muted-foreground pl-[3.25rem]">
                  Topic: {node.topicTitle}
                </DialogDescription>
              )}
              {(!node.topicTitle || node.topicTitle === node.name) && (
                <DialogDescription className="sr-only">
                  Details and statistics for {node.name}
                </DialogDescription>
              )}
            </DialogHeader>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Close"
            >
              <Icon icon="mdi:close" className="w-5 h-5" aria-hidden />
            </button>
          </div>

          <div className="flex flex-col gap-6 px-6 py-6 sm:px-8 sm:py-7">
            {/* Quick stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {statCards.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border/60 bg-secondary/30 px-4 py-3"
                >
                  <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                  <div className="flex items-center gap-2">
                    {stat.dot && (
                      <span className={`w-2 h-2 rounded-full shrink-0 ${stat.dot}`} />
                    )}
                    <p className="text-sm font-semibold text-foreground">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Performance */}
            <section className="rounded-xl border border-border/60 bg-background/40 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2 mb-4">
                <h3 className="text-base font-semibold text-foreground">
                  Performance Overview
                </h3>
                {loadingInsights && (
                  <span className="text-xs text-muted-foreground">Loading insights...</span>
                )}
              </div>

              {performance ? (
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
                  <div className="shrink-0 flex justify-center sm:pt-1">
                    <TopicDonutChart performance={performance} />
                  </div>
                  <div className="flex flex-col gap-2.5 text-sm w-full sm:flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                      <span className="text-muted-foreground">
                        Roadmap problems
                      </span>
                      <span className="ml-auto font-medium text-foreground tabular-nums">
                        {performance.roadmapProblems}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                      <span className="text-muted-foreground">
                        General topic problems
                      </span>
                      <span className="ml-auto font-medium text-foreground tabular-nums">
                        {performance.generalProblems}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400 shrink-0" />
                      <span className="text-muted-foreground">
                        Wrong submissions
                      </span>
                      <span className="ml-auto font-medium text-foreground tabular-nums">
                        {performance.wrongSubmissions}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shrink-0" />
                      <span className="text-muted-foreground">
                        Accepted solutions
                      </span>
                      <span className="ml-auto font-medium text-foreground tabular-nums">
                        {performance.acceptedSolutions}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No performance data yet. Solve problems in this module to see stats.
                </p>
              )}
            </section>

            {/* Problems */}
            {node.problems && node.problems.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Problems to practise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {node.problems.map((problem, idx) => {
                    const content = (
                      <>
                        {problem.solved ? (
                          <Icon
                            icon="ic:sharp-done"
                            className="w-3.5 h-3.5 text-emerald-400"
                            aria-hidden
                          />
                        ) : (
                          <Icon
                            icon="mdi:code-braces"
                            className="w-3.5 h-3.5 text-muted-foreground"
                            aria-hidden
                          />
                        )}
                        {problem.id}
                      </>
                    );
                    const className =
                      "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-secondary/50 text-secondary-foreground border border-border/60 hover:bg-secondary transition-colors";

                    if (problem.href) {
                      return (
                        <a
                          key={`${problem.id}-${idx}`}
                          href={problem.href}
                          target={
                            problem.href.startsWith("http") ? "_blank" : undefined
                          }
                          rel={
                            problem.href.startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          }
                          className={className}
                        >
                          {content}
                        </a>
                      );
                    }

                    return (
                      <span key={`${problem.id}-${idx}`} className={className}>
                        {content}
                      </span>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Resources */}
            {node.resources && node.resources.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Resources
                </h3>
                <div className="flex flex-wrap gap-2">
                  {node.resources.map((resource, idx) => (
                    <a
                      key={`${resource.title}-${idx}`}
                      href={resource.url}
                      target={resource.url.startsWith("http") ? "_blank" : undefined}
                      rel={
                        resource.url.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-secondary/50 text-secondary-foreground border border-border/60 hover:bg-secondary transition-colors"
                    >
                      <Icon
                        icon="mdi:book-open-variant"
                        className="w-3.5 h-3.5 text-primary"
                        aria-hidden
                      />
                      {resource.title}
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
