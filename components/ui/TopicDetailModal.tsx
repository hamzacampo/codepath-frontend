"use client";

import { Icon } from "@iconify/react";
import type { TopicNode } from "@/lib/roadmap-data";
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
  if (!node) return null;

  const profColor =
    proficiencyColors[node.proficiency ?? "Moderate"] ?? "bg-amber-400";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-card text-foreground border border-border p-0 overflow-hidden">
        <div className="p-6 pb-2">
          <DialogHeader className="flex-row items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/20">
              <Icon
                icon={node.icon ?? "mdi:book"}
                className="w-5 h-5 text-primary"
              />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              {node.name}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="sr-only">
            Details and statistics for {node.name}
          </DialogDescription>

          <div className="flex flex-wrap gap-x-8 gap-y-2 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                Your proficiency level in topic:
              </span>
              <span className={`w-2.5 h-2.5 rounded-full ${profColor}`} />
              <span className="font-semibold text-primary">
                {node.proficiency ?? "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                Your accuracy rate of this topic:
              </span>
              <span className="font-semibold text-primary">
                {node.accuracy ?? 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="px-6">
          <h3 className="text-base font-semibold text-primary mb-3">
            Performance Overview
          </h3>

          {node.performance && (
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-muted-foreground">
                    Number of problems from the Learning Roadmap
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-muted-foreground">
                    Number of problems from general topic tags
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="text-muted-foreground">
                    Number of wrong submissions
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                  <span className="text-muted-foreground">
                    Number of accepted solutions
                  </span>
                </div>
              </div>

              <div className="flex-1 flex justify-center">
                <TopicDonutChart performance={node.performance} />
              </div>
            </div>
          )}
        </div>

        {node.problems && node.problems.length > 0 && (
          <div className="px-6 mt-2">
            <h3 className="text-sm font-semibold text-foreground mb-2">
              Problems for practise
            </h3>
            <div className="flex flex-wrap gap-2">
              {node.problems.map((problem, idx) => (
                <span
                  key={`${problem.id}-${idx}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border"
                >
                  {problem.solved ? (
                    <Icon
                      icon="ic:sharp-done"
                      className="w-3.5 h-3.5 text-emerald-400"
                    />
                  ) : (
                    <Icon
                      icon="mdi:code-braces"
                      className="w-3.5 h-3.5 text-muted-foreground"
                    />
                  )}
                  {problem.id}
                </span>
              ))}
            </div>
          </div>
        )}

        {node.resources && node.resources.length > 0 && (
          <div className="px-6 pt-2 pb-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">
              Resources to help you in your journey
            </h3>
            <div className="flex flex-wrap gap-2">
              {node.resources.map((resource, idx) => (
                <a
                  key={`${resource.title}-${idx}`}
                  href={resource.url}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border hover:bg-accent transition-colors"
                >
                  <Icon
                    icon="mdi:book-open-variant"
                    className="w-3.5 h-3.5 text-primary"
                  />
                  {resource.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

