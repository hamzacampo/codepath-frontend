"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";

/** Fallback data when no insights from API. */
const FALLBACK_INSIGHTS = [
  "Solve 3 DP problems to strengthen your weak area.",
  "Watch tutorial: Graph Algorithms Simplified.",
  "Try a mini-quiz on Data Structures to reinforce fundamentals.",
  "Your accuracy improved by 12% this week — great progress!",
];

interface InsightsPanelProps {
  /** From API GET /statistics/mentee (insightsPanel). Single string; newlines become separate bullets. */
  content?: string | null;
}

export function InsightsPanel({ content }: InsightsPanelProps) {
  const raw = (content ?? "").trim();
  const useFallback =
    raw === "" ||
    /AI insights are not available|connect your coding platform account/i.test(raw);

  const insights = useFallback
    ? FALLBACK_INSIGHTS
    : raw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);

  return (
    <div className="w-full rounded-lg bg-linear-to-r from-accent to-[#3F305C] p-4 sm:p-8 box-border relative overflow-visible">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 relative z-10">
        <div className="flex-1 min-w-0 sm:pr-4">
          <div className="flex items-center gap-2 mb-4">
            <Icon
              icon="mdi:lightbulb-outline"
              className="w-6 h-6 text-accent-foreground shrink-0"
              aria-hidden
            />
            <h2 className="text-accent-foreground font-bold text-lg">Insights Panel</h2>
          </div>
          <ul className="list-none space-y-2">
            {insights.map((text, index) => (
              <li key={index} className="flex items-start gap-2 text-accent-foreground text-sm sm:text-base">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-sm bg-accent-foreground shrink-0" aria-hidden />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="hidden sm:block absolute right-6 -bottom-16 z-10 pointer-events-none">
        <Image
          src="/Balloon.png"
          alt=""
          width={108}
          height={277}
          className="object-contain w-[108px] h-[277px]"
        />
      </div>
    </div>
  );
}
