"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { RoadmapForm } from "@/components/admin/RoadmapForm";

export default function AdminCreateRoadmapPage() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="flex flex-col gap-6 max-w-[936px] mx-auto">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/roadmaps"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Back to roadmaps"
          >
            <Icon icon="mdi:arrow-left" className="w-5 h-5" aria-hidden />
          </Link>
          <h1 className="text-[32px] font-bold text-foreground leading-none">
            Create Roadmap
          </h1>
        </div>
        <RoadmapForm />
      </div>
    </div>
  );
}
