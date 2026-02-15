"use client";

import { Icon } from "@iconify/react";

const features = [
  {
    icon: "ph:robot-bold",
    title: "Your CodePrint",
    description: "AI analyzes your skills and creates a custom learning path",
  },
  {
    icon: "mdi:robot-outline",
    title: "AI Problem Suggestions",
    description: "Get perfect next challenges based on your performance",
  },
  {
    icon: "ri:progress-3-line",
    title: "Visual Progress",
    description: "Watch your skills grow with beautiful analytics",
  },
  {
    icon: "streamline-plump:arrow-roadmap-solid",
    title: "Learning Roadmaps",
    description: "Follow expert-designed paths to ICPC success",
  },
];

export function WhyCodePath() {
  return (
    <section className="relative w-full bg-background py-20 px-4 md:px-8 lg:px-[100px]">
      <div className="mx-auto max-w-7xl text-center">
        <h2 className="font-sans text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
          Why CodePath
        </h2>
        <p className="mx-auto mt-4 max-w-2xl font-sans text-base leading-relaxed text-muted-foreground text-balance md:text-lg">
          We transform how you learn competitive programming through personalized
          AI coaching that adapts to your unique skill level and learning pace.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-xl border border-border bg-feature-card px-8 py-6 text-left transition-colors hover:border-primary/40 sm:px-10 sm:py-6 md:px-12"
            >
              <Icon
                icon={feature.icon}
                className="mb-4 h-9 w-9 text-accent md:h-10 md:w-10"
                aria-hidden
              />
              <h3 className="font-sans text-base font-semibold text-foreground md:text-lg">
                {feature.title}
              </h3>
              <p className="mt-2 font-sans text-sm leading-relaxed text-muted-foreground md:text-base">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
