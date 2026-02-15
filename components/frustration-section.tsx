"use client";

import Image from "next/image";

export function FrustrationSection() {
  return (
    <section className="relative z-10 px-6 py-16 md:py-24 lg:px-[100px]">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 md:flex-row md:items-start md:gap-12">
        <div className="flex-1">
          <h3 className="mb-4 font-sans text-2xl font-bold text-foreground md:text-3xl">
            From Frustration to Innovation
          </h3>
          <p className="max-w-md font-sans text-sm leading-relaxed text-foreground md:text-base">
            CodePath was born from our own struggles in competitive programming.
            We experienced the frustration of not knowing what to practice next,
            wasting hours on problems that were either too easy or impossibly
            hard. As computer science students preparing for ICPC, we realized
            traditional learning methods were inefficient and demotivating.
          </p>
        </div>
        <div className="relative h-64 w-64 shrink-0 md:h-72 md:w-72 animate-robot-bob">
          <Image
            src="/sad-robot.png"
            alt="A friendly metallic robot representing CodePath's innovative approach"
            fill
            className="rounded-lg object-contain"
            sizes="(max-width: 768px) 256px, 288px"
          />
        </div>
      </div>
    </section>
  );
}
