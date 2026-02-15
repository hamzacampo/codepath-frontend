"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { ConsistencyTracker } from "@/components/ui/ConsistencyTracker";
import { CodePrintChart } from "@/components/ui/CodePrintChart";
import { GrowthTimelineChart } from "@/components/ui/GrowthTimelineChart";
import { InsightsPanel } from "@/components/ui/InsightsPanel";
import { apiService } from "@/lib/api-service";
import type { ActivityByDateResponse, GrowthTimelineResponse } from "@/types";

const statCardKeys = [
  { key: "codePathRating" as const, title: "CodePath Rating", icon: "material-symbols:star-rate-outline" },
  { key: "codePathLevel" as const, title: "CodePath Level", icon: "carbon:skill-level" },
  { key: "problemsSolved" as const, title: "Problems Solved", icon: "healthicons:i-documents-accepted-outline-24px" },
  { key: "accuracy" as const, title: "Accuracy", icon: "hugeicons:math" },
];

export default function CodePrintPage() {
  const [activityData, setActivityData] = useState<Record<string, number> | null>(null);
  const [activityLoading, setActivityLoading] = useState(true);
  const [growthMonths, setGrowthMonths] = useState<GrowthTimelineResponse["months"] | null>(null);
  const [codePrintData, setCodePrintData] = useState<Array<{ topic: string; attempts: number }> | null>(null);
  const [insightsPanelContent, setInsightsPanelContent] = useState<string | null>(null);
  const [activityYear, setActivityYear] = useState(() => new Date().getFullYear());
  const [menteeStats, setMenteeStats] = useState<{
    codePathRating: number;
    codePathLevel: string;
    problemsSolved: number;
    accuracy: number;
  } | null>(null);

  const fetchActivity = useCallback(async (year: number) => {
    setActivityLoading(true);
    try {
      const res: ActivityByDateResponse = await apiService.getMenteeActivity(year);
      setActivityData(res.data ?? {});
    } catch {
      setActivityData({});
    } finally {
      setActivityLoading(false);
    }
  }, []);

  const fetchGrowth = useCallback(async () => {
    try {
      const res = await apiService.getMenteeGrowth();
      setGrowthMonths(res.months ?? []);
    } catch {
      setGrowthMonths([]);
    }
  }, []);

  const fetchMenteeStats = useCallback(async () => {
    try {
      const res = await apiService.getMenteeStatistics();
      setMenteeStats({
        codePathRating: res.codePathRating ?? 0,
        codePathLevel: res.codePathLevel ?? "—",
        problemsSolved: res.problemsSolved ?? 0,
        accuracy: res.accuracy ?? 0,
      });
      setCodePrintData(res.yourCodePrint ?? []);
      setInsightsPanelContent(res.insightsPanel ?? null);
    } catch {
      setMenteeStats(null);
      setCodePrintData([]);
      setInsightsPanelContent(null);
    }
  }, []);

  useEffect(() => {
    fetchActivity(activityYear);
  }, [activityYear, fetchActivity]);

  useEffect(() => {
    fetchGrowth();
  }, [fetchGrowth]);

  useEffect(() => {
    fetchMenteeStats();
  }, [fetchMenteeStats]);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="flex flex-col gap-6 sm:gap-8 max-w-6xl mx-auto">
        {/* Key performance metrics - four cards (wired to GET /statistics/mentee) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {statCardKeys.map(({ key, title, icon }) => {
            let value = "—";
            if (menteeStats != null) {
              if (key === "codePathRating") value = String(menteeStats.codePathRating);
              else if (key === "codePathLevel") value = menteeStats.codePathLevel;
              else if (key === "problemsSolved") value = String(menteeStats.problemsSolved);
              else if (key === "accuracy") value = `${menteeStats.accuracy}%`;
            }
            return (
              <div
                key={key}
                className="rounded-lg bg-linear-to-r from-accent to-[#3F305C] p-4 sm:p-5 box-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-accent-foreground/80 text-sm font-medium">{title}</span>
                  <span className="text-accent-foreground text-xl sm:text-2xl font-bold truncate">{value}</span>
                </div>
                <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-accent-foreground/10 text-accent-foreground">
                  <Icon icon={icon} className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden />
                </div>
              </div>
            );
          })}
        </div>

        {/* Consistency Tracker - wired to API */}
        <ConsistencyTracker
          data={activityData ?? undefined}
          year={activityYear}
          onYearChange={setActivityYear}
          loading={activityLoading}
        />

        {/* Your CodePrint - Radar chart (wired to GET /statistics/mentee) */}
        <CodePrintChart data={codePrintData ?? undefined} />

        {/* Your Growth Timeline - Line chart - wired to API */}
        <GrowthTimelineChart data={growthMonths ?? undefined} />

        {/* Insights Panel - wired to GET /statistics/mentee (insightsPanel) */}
        <InsightsPanel content={insightsPanelContent ?? undefined} />
      </div>
    </div>
  );
}
