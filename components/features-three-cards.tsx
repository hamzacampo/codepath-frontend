"use client";

import { Icon } from "@iconify/react";

const items = [
  {
    icon: "hugeicons:connect",
    title: "Codeforces Integration",
    description:
      "Already have a Codeforces account? Connect it instantly and we'll analyze your entire submission history to create your personalized CodePrint.",
  },
  {
    icon: "tabler:puzzle",
    title: "Take a Quiz",
    description:
      "New to competitive programming? Our 15-minute quiz assesses your current level across key topics to place you on the right learning path.",
  },
  {
    icon: "octicon:goal-24",
    title: "Pick a Level",
    description:
      "Know your current level? Select it directly and jump straight into appropriate challenges and learning materials.",
  },
];

export function FeaturesThreeCards() {
  return (
    <section className="relative w-full bg-background py-20 px-4 md:px-8 lg:px-[100px]">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="font-sans text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
          Assessment Methods
        </h2>
        <p className="mx-auto mt-4 max-w-xl font-sans text-base leading-relaxed text-muted-foreground text-balance md:text-lg">
          Start Smart - Choose Your Assessment Method
        </p>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.title}
              className="group relative rounded-xl border border-border bg-feature-card px-6 py-6 text-center transition-colors hover:border-primary/40 sm:px-6 md:py-8"
            >
              <Icon
                icon={item.icon}
                className="mx-auto mb-4 h-9 w-9 text-accent md:h-10 md:w-10"
                aria-hidden
              />
              <h3 className="font-sans text-base font-semibold text-foreground md:text-lg">
                {item.title}
              </h3>
              <p className="mt-2 font-sans text-sm leading-relaxed text-muted-foreground md:text-base">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
