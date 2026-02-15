"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";

interface CurrentFocusBannerProps {
  topicName: string;
}

export function CurrentFocusBanner({ topicName }: CurrentFocusBannerProps) {
  return (
    <div className="relative overflow-visible rounded-2xl bg-linear-to-r from-secondary to-card border border-border">
      <div className="relative flex items-center justify-between p-10 pr-32">
        <div className="flex flex-col gap-1 z-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Current Focus</span>
            <Icon icon="mdi:play" className="w-4 h-4 text-primary" />
          </div>
          <span className="text-lg font-semibold text-primary">
            {topicName}
          </span>
        </div>
        <Image
          src="/sad-robot.png"
          alt="Current focus assistant"
          width={110}
          height={110}
          className="pointer-events-none select-none absolute right-6 bottom-10 translate-y-6 scale-110 object-contain"
          priority
        />
      </div>
    </div>
  );
}

