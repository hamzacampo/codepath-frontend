"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { ConsistencyTracker } from "@/components/ui/ConsistencyTracker";
import { CodePrintChart } from "@/components/ui/CodePrintChart";
import { GrowthTimelineChart } from "@/components/ui/GrowthTimelineChart";
import { InsightsPanel } from "@/components/ui/InsightsPanel";
import { apiService } from "@/lib/api-service";
import type { ActivityByDateResponse, GrowthTimelineResponse, MenteeSkillProfile } from "@/types";

const statCardKeys = [
  { key: "codePathRating" as const, title: "CodePath Rating", icon: "material-symbols:star-rate-outline" },
  { key: "codePathLevel" as const, title: "CodePath Level", icon: "carbon:skill-level" },
  { key: "problemsSolved" as const, title: "Problems Solved", icon: "healthicons:i-documents-accepted-outline-24px" },
  { key: "accuracy" as const, title: "Accuracy", icon: "hugeicons:math" },
];

export default function CodePrintPage() {
  const [codeprintActivity, setCodeprintActivity] = useState<Record<string, number> | null>(null);
  const [codeforcesActivity, setCodeforcesActivity] = useState<Record<string, number> | null>(null);
  const [activityLoading, setActivityLoading] = useState(true);
  const [growthMonths, setGrowthMonths] = useState<GrowthTimelineResponse["months"] | null>(null);
  const [codePrintData, setCodePrintData] = useState<Array<{ topic: string; attempts: number }> | null>(null);
  const [insights, setInsights] = useState<string[] | null>(null);
  const [activityYear, setActivityYear] = useState(() => new Date().getFullYear());
  const [menteeStats, setMenteeStats] = useState<{
    codePathRating: number;
    codePathLevel: string;
    problemsSolved: number;
    accuracy: number;
  } | null>(null);
  const [statsSkillProfile, setStatsSkillProfile] = useState<MenteeSkillProfile | null>(null);
  const [codeforcesLinked, setCodeforcesLinked] = useState<boolean | null>(null);

  const fetchActivity = useCallback(async (year: number) => {
    setActivityLoading(true);
    try {
      const res: ActivityByDateResponse = await apiService.getMenteeActivity(year);
      setCodeprintActivity(res.codeprint ?? {});
      setCodeforcesActivity(res.codeforces ?? {});
    } catch {
      setCodeprintActivity({});
      setCodeforcesActivity({});
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
      setStatsSkillProfile(res.skillProfile ?? null);
      if (res.skillProfile?.sources.codeforces.connected != null) {
        setCodeforcesLinked(res.skillProfile.sources.codeforces.connected);
      }
      setCodePrintData(res.yourCodePrint ?? []);
    } catch {
      setMenteeStats(null);
      setCodePrintData([]);
    }
  }, []);

  const fetchInsights = useCallback(async () => {
    try {
      const items = await apiService.getActiveInsights();
      setInsights(items.map((item) => item.content));
    } catch {
      setInsights([]);
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

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  useEffect(() => {
    apiService
      .getCodeforcesIntegration()
      .then((res) => setCodeforcesLinked(res.linked))
      .catch(() => setCodeforcesLinked(false));
  }, []);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="flex flex-col gap-6 sm:gap-8 max-w-6xl mx-auto">
        {codeforcesLinked === false && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <Icon icon="simple-icons:codeforces" className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-amber-200">Connect your Codeforces account</p>
                <p className="text-sm text-amber-100/80 mt-1">
                  Link Codeforces to unlock full CodePrint analytics, activity tracking, and personalized insights.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400 shrink-0"
            >
              Connect now
            </Link>
          </div>
        )}
        {/* Key performance metrics - four cards (wired to GET /statistics/mentee) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {statCardKeys.map(({ key, title, icon }) => {
            let value = "—";
            let cardTitle = title;
            if (key === "problemsSolved") {
              cardTitle = statsSkillProfile?.sources.codeforces.connected
                ? "Codeforces Solved"
                : "CodePath Solved";
            }
            if (menteeStats != null) {
              if (key === "codePathRating") value = String(menteeStats.codePathRating);
              else if (key === "codePathLevel") value = menteeStats.codePathLevel;
              else if (key === "problemsSolved") {
                const cfLinked = statsSkillProfile?.sources.codeforces.connected;
                const cfCount = statsSkillProfile?.sources.codeforces.problemsSolved ?? 0;
                if (cfLinked && cfCount === 0 && menteeStats.problemsSolved === 0) {
                  value = "Updating…";
                } else {
                  value = String(menteeStats.problemsSolved);
                }
              } else if (key === "accuracy") value = `${menteeStats.accuracy}%`;
            }
            return (
              <div
                key={key}
                className="rounded-lg bg-linear-to-r from-accent to-[#3F305C] p-4 sm:p-5 box-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-accent-foreground/80 text-sm font-medium">{cardTitle}</span>
                  <span className="text-accent-foreground text-xl sm:text-2xl font-bold truncate">{value}</span>
                  {key === "problemsSolved" &&
                    statsSkillProfile?.sources.codeforces.connected && (
                      <span className="text-[11px] text-accent-foreground/70">
                        {statsSkillProfile.sources.codepath.solvedCount} on CodePath platform
                      </span>
                    )}
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
          codeprintData={codeprintActivity ?? undefined}
          codeforcesData={codeforcesActivity ?? undefined}
          year={activityYear}
          onYearChange={setActivityYear}
          loading={activityLoading}
          codeforcesLinked={codeforcesLinked ?? false}
        />

        {/* Your CodePrint - Radar chart (wired to GET /statistics/mentee) */}
        <CodePrintChart
          data={codePrintData ?? undefined}
          loading={codePrintData === null}
          levelPreference={statsSkillProfile?.levelPreference}
        />

        {/* Your Growth Timeline - Line chart - wired to API */}
        <GrowthTimelineChart data={growthMonths ?? undefined} loading={growthMonths === null} />

        <InsightsPanel
          insights={insights ?? undefined}
          loading={insights === null}
        />
      </div>
    </div>
  );
}
