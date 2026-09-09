"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type {
  LineProps,
  XAxisProps,
  YAxisProps,
  CartesianGridProps,
  LegendProps,
  ResponsiveContainerProps,
} from "recharts";
import type { GrowthMonthStat } from "@/types";

const LineChart = dynamic(() => import("recharts").then((m) => m.LineChart), {
  ssr: false,
});
const Line = dynamic<LineProps>(() => import("recharts").then((m) => m.Line), { ssr: false });
const XAxis = dynamic<XAxisProps>(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic<YAxisProps>(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic<CartesianGridProps>(
  () => import("recharts").then((m) => m.CartesianGrid),
  { ssr: false },
);
const Legend = dynamic<LegendProps>(() => import("recharts").then((m) => m.Legend), {
  ssr: false,
});
const ResponsiveContainer = dynamic<ResponsiveContainerProps>(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false },
);

const CODEPRINT_COLOR = "var(--color-accent)";
const CODEFORCES_COLOR = "#10b981";

const EMPTY_TIMELINE = [
  {
    month: "Month 1",
    codeprintSolved: 0,
    codeprintSubmissions: 0,
    codeforcesSolved: 0,
    codeforcesSubmissions: 0,
  },
  {
    month: "Month 2",
    codeprintSolved: 0,
    codeprintSubmissions: 0,
    codeforcesSolved: 0,
    codeforcesSubmissions: 0,
  },
  {
    month: "Month 3",
    codeprintSolved: 0,
    codeprintSubmissions: 0,
    codeforcesSolved: 0,
    codeforcesSubmissions: 0,
  },
  {
    month: "Month 4",
    codeprintSolved: 0,
    codeprintSubmissions: 0,
    codeforcesSolved: 0,
    codeforcesSubmissions: 0,
  },
  {
    month: "Month 5",
    codeprintSolved: 0,
    codeprintSubmissions: 0,
    codeforcesSolved: 0,
    codeforcesSubmissions: 0,
  },
  {
    month: "Month 6",
    codeprintSolved: 0,
    codeprintSubmissions: 0,
    codeforcesSolved: 0,
    codeforcesSubmissions: 0,
  },
];

interface GrowthTimelineChartProps {
  data?: GrowthMonthStat[];
  loading?: boolean;
}

function GrowthTimelineSkeleton() {
  return (
    <div
      className="w-full max-w-full rounded-xl border border-border/60 bg-card p-4 sm:p-6 box-border shadow-sm"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="h-7 w-52 rounded-md bg-muted/60 animate-pulse mb-2" />
      <div className="h-4 w-full max-w-md rounded-md bg-muted/40 animate-pulse mb-6" />
      <div className="h-[260px] sm:h-[320px] md:h-[360px] rounded-lg bg-muted/20 animate-pulse" />
    </div>
  );
}

export function GrowthTimelineChart({ data, loading = false }: GrowthTimelineChartProps) {
  const hasData = !loading && data != null && data.length > 0;

  const chartData = useMemo(() => {
    if (!hasData) return EMPTY_TIMELINE;
    return data!.map((m) => ({
      month: m.monthLabel,
      codeprintSolved: m.codeprint.problemsSolved,
      codeprintSubmissions: m.codeprint.submissions,
      codeforcesSolved: m.codeforces.problemsSolved,
      codeforcesSubmissions: m.codeforces.submissions,
    }));
  }, [data, hasData]);

  const maxVal = useMemo(() => {
    const max = Math.max(
      ...chartData.flatMap((d) => [
        d.codeprintSolved,
        d.codeprintSubmissions,
        d.codeforcesSolved,
        d.codeforcesSubmissions,
      ]),
      0,
    );
    return Math.ceil(max / 10) * 10 || 10;
  }, [chartData]);

  if (loading) {
    return <GrowthTimelineSkeleton />;
  }

  return (
    <div className="w-full max-w-full rounded-xl border border-border/60 bg-card p-4 sm:p-6 box-border shadow-sm growth-timeline-chart">
      <div className="mb-6">
        <h2 className="text-foreground font-bold text-lg">Your Growth Timeline</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Monthly submissions and distinct problems solved on CodePath and Codeforces.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mb-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-medium text-accent">CodePrint</span>
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <span className="h-0.5 w-5 rounded-full" style={{ backgroundColor: CODEPRINT_COLOR }} />
            Solved
          </span>
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <span
              className="h-0.5 w-5 rounded-full border-t-2 border-dashed"
              style={{ borderColor: CODEPRINT_COLOR }}
            />
            Submissions
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-medium text-emerald-400">Codeforces</span>
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <span className="h-0.5 w-5 rounded-full" style={{ backgroundColor: CODEFORCES_COLOR }} />
            Solved
          </span>
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <span
              className="h-0.5 w-5 rounded-full border-t-2 border-dashed"
              style={{ borderColor: CODEFORCES_COLOR }}
            />
            Submissions
          </span>
        </div>
      </div>

      <div className={`w-full overflow-x-auto ${!hasData ? "opacity-50" : ""}`}>
        <div className="min-w-[640px] h-[260px] sm:h-[320px] md:h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 40 }}>
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
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                interval="preserveStartEnd"
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
                  fill: "var(--color-muted-foreground)",
                  fontSize: 14,
                  style: { textAnchor: "middle" },
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="plainline"
                wrapperStyle={{ paddingBottom: 8, fontSize: 11 }}
                formatter={(value) => (
                  <span style={{ color: "var(--color-muted-foreground)", fontSize: 11 }}>
                    {value}
                  </span>
                )}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="codeprintSolved"
                name="CodePrint solved"
                stroke={CODEPRINT_COLOR}
                strokeWidth={2.5}
                dot={{ fill: CODEPRINT_COLOR, strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="codeprintSubmissions"
                name="CodePrint submissions"
                stroke={CODEPRINT_COLOR}
                strokeWidth={2}
                strokeDasharray="6 4"
                strokeOpacity={0.75}
                dot={false}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="codeforcesSolved"
                name="Codeforces solved"
                stroke={CODEFORCES_COLOR}
                strokeWidth={2.5}
                dot={{ fill: CODEFORCES_COLOR, strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="codeforcesSubmissions"
                name="Codeforces submissions"
                stroke={CODEFORCES_COLOR}
                strokeWidth={2}
                strokeDasharray="6 4"
                strokeOpacity={0.75}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {!hasData && (
        <p className="mt-4 text-sm text-muted-foreground text-center">
          No growth data yet. Solve problems on CodePath or connect Codeforces to see your timeline.
        </p>
      )}
    </div>
  );
}
