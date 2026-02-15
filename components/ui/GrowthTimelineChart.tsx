"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { LineProps, XAxisProps, YAxisProps, CartesianGridProps, LegendProps, ResponsiveContainerProps } from "recharts";
import type { GrowthMonthStat } from "@/types";

const LineChart = dynamic(() => import("recharts").then((m) => m.LineChart), {
  ssr: false,
});
const Line = dynamic<LineProps>(() => import("recharts").then((m) => m.Line), { ssr: false });
const XAxis = dynamic<XAxisProps>(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic<YAxisProps>(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic<CartesianGridProps>(
  () => import("recharts").then((m) => m.CartesianGrid),
  { ssr: false }
);
const Legend = dynamic<LegendProps>(() => import("recharts").then((m) => m.Legend), {
  ssr: false,
});
const ResponsiveContainer = dynamic<ResponsiveContainerProps>(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false }
);

// When no data: same timeline layout, all values at zero
const EMPTY_TIMELINE = [
  { month: "Month 1", problemsSolved: 0, submissions: 0 },
  { month: "Month 2", problemsSolved: 0, submissions: 0 },
  { month: "Month 3", problemsSolved: 0, submissions: 0 },
  { month: "Month 4", problemsSolved: 0, submissions: 0 },
  { month: "Month 5", problemsSolved: 0, submissions: 0 },
  { month: "Month 6", problemsSolved: 0, submissions: 0 },
];

interface GrowthTimelineChartProps {
  /** From API GET /statistics/mentee/growth; when undefined or empty, timeline stays at zero. */
  data?: GrowthMonthStat[];
}

export function GrowthTimelineChart({ data }: GrowthTimelineChartProps) {
  const chartData = useMemo(() => {
    if (data == null || data.length === 0) return EMPTY_TIMELINE;
    return data.map((m) => ({
      month: m.monthLabel,
      problemsSolved: m.problemsSolved,
      submissions: m.submissions,
    }));
  }, [data]);

  const maxVal = useMemo(() => {
    const max = Math.max(
      ...chartData.flatMap((d) => [d.problemsSolved, d.submissions]),
      0
    );
    return Math.ceil(max / 10) * 10 || 10;
  }, [chartData]);

  return (
    <div className="w-full max-w-full rounded-lg bg-card p-4 sm:p-6 box-border growth-timeline-chart">
      <h2 className="text-foreground font-bold text-lg mb-6">Your Growth Timeline</h2>
      <div className="w-full overflow-x-auto">
        <div className="min-w-[640px] h-[260px] sm:h-[320px] md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 50, left: 20, bottom: 40 }}
            >
              <CartesianGrid
                strokeDasharray="0"
                stroke="#A6A6A6"
                strokeWidth={1}
                horizontal={true}
                vertical={false}
              />
              <CartesianGrid
                strokeDasharray="0"
                stroke="#A6A6A6"
                strokeWidth={1}
                horizontal={false}
                vertical={true}
              />
              <XAxis
                dataKey="month"
                axisLine={{ stroke: "var(--color-muted-foreground)" }}
                tickLine={{ stroke: "var(--color-muted-foreground)" }}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                label={{
                  value: "Time (Months)",
                  position: "insideBottom",
                  offset: -10,
                  fill: "var(--color-muted-foreground)",
                  fontSize: 12,
                }}
              />
              <YAxis
                yAxisId="left"
                orientation="left"
                domain={[0, maxVal]}
                axisLine={{ stroke: "var(--color-muted-foreground)" }}
                tickLine={{ stroke: "var(--color-muted-foreground)" }}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
                label={{
                  value: "Count",
                  angle: -90,
                  position: "insideLeft",
                  fill: "var(--color-accent-foreground)",
                  fontSize: 16,
                  style: { textAnchor: "middle" },
                }}
              />
              <Legend
                verticalAlign="top"
                align="center"
                iconType="plainline"
                wrapperStyle={{ paddingBottom: 20 }}
                formatter={(value) => (
                  <span style={{ color: "var(--color-muted-foreground)", fontSize: 12 }}>
                    {value}
                  </span>
                )}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="problemsSolved"
                name="Problems solved"
                stroke="var(--color-accent)"
                strokeWidth={2}
                dot={{ fill: "var(--color-accent)", strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="submissions"
                name="Submissions"
                stroke="var(--color-primary)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "var(--color-primary)", strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
