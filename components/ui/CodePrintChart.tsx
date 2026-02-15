"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
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

interface CodePrintChartProps {
  /** From API GET /statistics/mentee (yourCodePrint); when undefined or empty, shows sample data. */
  data?: Array<{ topic: string; attempts: number }>;
}

export function CodePrintChart({ data }: CodePrintChartProps) {
  const chartData = useMemo(() => {
    if (data == null || data.length === 0) {
      return buildChartData(EMPTY_TOPICS);
    }
    const maxAttempts = Math.max(...data.map((d) => d.attempts), 1);
    const withCurrent = data.map((d) => ({
      topic: d.topic,
      current: Math.round((d.attempts / maxAttempts) * 100),
    }));
    return buildChartData(withCurrent);
  }, [data]);

  return (
    <div className="w-full max-w-full rounded-lg bg-transparent p-4 sm:p-6 lg:p-8 box-border overflow-hidden">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-12">
        {/* Left side - Title and Legend (all three levels) */}
        <div className="flex flex-col gap-6 lg:w-64">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Your CodePrint</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              A visual representation of your activity across problem-solving topics
              from your submissions and attempts.
            </p>
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
          <div className="h-64 w-full sm:h-80 lg:h-96 min-w-0">
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
