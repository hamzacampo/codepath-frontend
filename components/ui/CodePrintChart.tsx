"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { SkillLevelPreference } from "@/types";
import type { RadarProps, PolarGridProps, PolarAngleAxisProps, PolarRadiusAxisProps, ResponsiveContainerProps } from "recharts";
const RadarChart = dynamic(() => import("recharts").then((m) => m.RadarChart), {
  ssr: false,
});
const Radar = dynamic<RadarProps>(() => import("recharts").then((m) => m.Radar), { ssr: false });
const PolarGrid = dynamic<PolarGridProps>(() => import("recharts").then((m) => m.PolarGrid), {
  ssr: false,
});
const PolarAngleAxis = dynamic<PolarAngleAxisProps>(
  () => import("recharts").then((m) => m.PolarAngleAxis),
  { ssr: false }
);
const PolarRadiusAxis = dynamic<PolarRadiusAxisProps>(
  () => import("recharts").then((m) => m.PolarRadiusAxis),
  { ssr: false }
);
const ResponsiveContainer = dynamic<ResponsiveContainerProps>(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false }
);

// Placeholder topics when no data: same axes, all values at zero (points at center)
const EMPTY_TOPICS = [
  "Trees",
  "DP",
  "BFS",
  "Brute Force",
  "Greedy",
  "DFS",
].map((topic) => ({ topic, current: 0 }));

function getLevel(value: number): "strong" | "average" | "weak" {
  if (value >= 80) return "strong";
  if (value >= 50) return "average";
  return "weak";
}

function buildChartData(
  items: Array<{ topic: string; current: number }>
): Array<{ topic: string; current: number; strong: number; average: number; weak: number }> {
  return items.map(({ topic, current }) => {
    const level = getLevel(current);
    return {
      topic,
      current,
      strong: level === "strong" ? current : 0,
      average: level === "average" ? current : 0,
      weak: level === "weak" ? current : 0,
    };
  });
}

const accuracyLevels = [
  { label: "Strong: 80-100% activity", colorVar: "var(--color-strong)" },
  { label: "Average: 50-79% activity", colorVar: "var(--color-average)" },
  { label: "Weak: Below 50% activity", colorVar: "var(--color-weak)" },
] as const;

function getSourceDescription(preference?: SkillLevelPreference | null): string {
  switch (preference) {
    case "codepath":
    case "contest":
    case "placement":
      return "Topic strength from your solved problems on CodePath only.";
    case "codeforces":
      return "Topic strength from your accepted solves on Codeforces only.";
    case "blended":
    case "auto":
    default:
      return "Topic strength from your solved problems on CodePath and Codeforces combined.";
  }
}

function getEmptyDescription(preference?: SkillLevelPreference | null): string {
  switch (preference) {
    case "codeforces":
      return "No Codeforces solves found yet. Connect Codeforces or solve problems there to populate your CodePrint.";
    case "codepath":
    case "contest":
    case "placement":
      return "No CodePath solves found yet. Solve problems on the platform to populate your CodePrint.";
    default:
      return "No solved problems yet. Solve problems on CodePath or connect Codeforces to populate your CodePrint.";
  }
}

interface CodePrintChartProps {
  /** From API GET /statistics/mentee (yourCodePrint). */
  data?: Array<{ topic: string; attempts: number }>;
  loading?: boolean;
  levelPreference?: SkillLevelPreference | null;
}

function CodePrintChartSkeleton() {
  return (
    <div className="w-full max-w-full rounded-lg bg-transparent p-4 sm:p-6 lg:p-8 box-border overflow-hidden" aria-busy="true" aria-live="polite">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-12">
        <div className="flex flex-col gap-6 lg:w-64">
          <div className="space-y-3">
            <div className="h-7 w-40 rounded-md bg-muted/60 animate-pulse" />
            <div className="h-4 w-full rounded-md bg-muted/50 animate-pulse" />
            <div className="h-4 w-5/6 rounded-md bg-muted/50 animate-pulse" />
          </div>
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-muted/60 animate-pulse" />
                <div className="h-4 flex-1 max-w-[180px] rounded-md bg-muted/50 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 min-w-0 flex items-center justify-center">
          <div className="relative h-64 w-full sm:h-80 lg:h-96 max-w-md mx-auto">
            <div className="absolute inset-0 rounded-full border border-muted/50 animate-pulse" />
            <div className="absolute inset-[12%] rounded-full border border-muted/40 animate-pulse" style={{ animationDelay: "150ms" }} />
            <div className="absolute inset-[24%] rounded-full border border-muted/30 animate-pulse" style={{ animationDelay: "300ms" }} />
            <div className="absolute inset-[36%] rounded-full bg-muted/20 animate-pulse" style={{ animationDelay: "450ms" }} />
            {Array.from({ length: 6 }).map((_, i) => {
              const angle = (i / 6) * 2 * Math.PI - Math.PI / 2;
              const x = 50 + Math.cos(angle) * 46;
              const y = 50 + Math.sin(angle) * 46;
              return (
                <div
                  key={i}
                  className="absolute h-3 w-10 -translate-x-1/2 -translate-y-1/2 rounded-md bg-muted/50 animate-pulse"
                  style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 80}ms` }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CodePrintChart({
  data,
  loading = false,
  levelPreference,
}: CodePrintChartProps) {
  const hasData = !loading && data != null && data.length > 0;
  const isEmpty = !loading && data != null && data.length === 0;

  const chartData = useMemo(() => {
    if (!hasData) {
      return buildChartData(EMPTY_TOPICS);
    }
    const maxAttempts = Math.max(...data!.map((d) => d.attempts), 1);
    const withCurrent = data!.map((d) => ({
      topic: d.topic,
      current: Math.round((d.attempts / maxAttempts) * 100),
    }));
    return buildChartData(withCurrent);
  }, [data, hasData]);

  if (loading) {
    return <CodePrintChartSkeleton />;
  }

  return (
    <div className="w-full max-w-full rounded-lg bg-transparent p-4 sm:p-6 lg:p-8 box-border overflow-hidden">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-12">
        {/* Left side - Title and Legend (all three levels) */}
        <div className="flex flex-col gap-6 lg:w-64">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Your CodePrint</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {getSourceDescription(levelPreference)}
              Each axis reflects how many accepted solves you have in that tag.
            </p>
            {isEmpty && (
              <p className="mt-3 text-sm text-amber-200/90 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
                {getEmptyDescription(levelPreference)}
              </p>
            )}
          </div>

          {/* Legend - Strong, Average, Weak (same colors as chart) */}
          <div className="flex flex-col gap-3">
            {accuracyLevels.map((level) => (
              <div key={level.label} className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: level.colorVar }}
                />
                <span className="text-sm text-muted-foreground">{level.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Radar Chart (three layers: strong, average, weak) */}
        <div className="flex-1 min-w-0">
          <div className={`h-64 w-full sm:h-80 lg:h-96 min-w-0 ${isEmpty ? "opacity-50" : ""}`}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <RadarChart
                data={chartData}
                margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
              >
                <PolarGrid
                  stroke="var(--color-border)"
                  strokeWidth={1}
                  gridType="polygon"
                />
                <PolarAngleAxis
                  dataKey="topic"
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                  tickLine={false}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                />
                {/* Weak: Below 50% - same as legend */}
                <Radar
                  name="Weak"
                  dataKey="weak"
                  stroke="var(--color-weak)"
                  fill="var(--color-weak)"
                  fillOpacity={0.4}
                  strokeWidth={2}
                />
                {/* Average: 50-79% - same as legend */}
                <Radar
                  name="Average"
                  dataKey="average"
                  stroke="var(--color-average)"
                  fill="var(--color-average)"
                  fillOpacity={0.4}
                  strokeWidth={2}
                />
                {/* Strong: 80-100% - same as legend */}
                <Radar
                  name="Strong"
                  dataKey="strong"
                  stroke="var(--color-strong)"
                  fill="var(--color-strong)"
                  fillOpacity={0.4}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
