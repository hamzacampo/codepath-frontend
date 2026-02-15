"use client";

import { Icon } from "@iconify/react";

const team = [
  {
    name: "Boshra",
    role: "Model Magician",
    iconColor: "text-accent",
  },
  {
    name: "Hamza",
    role: "Pixel Picasso",
    iconColor: "text-[#3B82F6]",
  },
  {
    name: "Farah",
    role: "Coffee driven developer",
    iconColor: "text-accent",
  },
];

export function TeamSection() {
  return (
    <section className="relative z-10 flex w-full flex-col items-center justify-center px-4 py-32 text-center md:px-8 md:py-40 lg:px-[100px] lg:py-48">
      <div>
        <h2 className="font-sans text-2xl font-bold tracking-tight text-foreground text-balance md:text-3xl lg:text-4xl">
          Built by Programmers, for Programmers
        </h2>
        <p className="mx-auto mt-4 max-w-2xl font-sans text-base leading-relaxed text-foreground md:text-lg">
          Our team consists of passionate computer science students and
          competitive programming enthusiasts who understand the challenges
          firsthand. We&apos;ve experienced the ICPC journey, struggled with the
          same algorithms, and celebrated the same breakthroughs that our users
          experience every day.
        </p>

        <div className="mx-auto mt-14 flex max-w-4xl flex-col items-center justify-center gap-10 sm:flex-row sm:gap-12 md:gap-16">
          {team.map((member) => (
            <div
              key={member.name}
              className="flex flex-col items-center gap-3 text-center"
            >
              <Icon
                icon="codicon:robot"
                className={`h-14 w-14 md:h-16 md:w-16 ${member.iconColor}`}
                aria-hidden
              />
              <p className="font-sans text-lg font-bold text-foreground md:text-xl">
                {member.name}
              </p>
              <p className="font-sans text-sm text-muted-foreground md:text-base">
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
