"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";

interface CurrentFocusBannerProps {
  topicName: string;
}

export function CurrentFocusBanner({ topicName }: CurrentFocusBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-linear-to-r from-secondary/90 via-card to-card shadow-lg shadow-black/20">
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="relative flex items-center justify-between gap-6 px-6 py-6 sm:px-8 sm:py-7 pr-28 sm:pr-36">
        <div className="flex flex-col gap-2 z-10 min-w-0">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium uppercase tracking-wider text-muted-foreground">
            <Icon icon="mdi:target" className="w-4 h-4 text-primary shrink-0" aria-hidden />
            <span>Current Focus</span>
          </div>
          <span className="text-xl sm:text-2xl font-bold text-primary leading-tight truncate">
            {topicName}
          </span>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
            Continue this module to unlock the next step in your path.
          </p>
        </div>
        <Image
          src="/sad-robot.png"
          alt=""
          width={110}
          height={110}
          className="pointer-events-none select-none absolute right-4 sm:right-8 bottom-4 sm:bottom-6 h-20 w-20 sm:h-24 sm:w-24 object-contain opacity-90"
          priority
        />
      </div>
    </div>
  );
}
