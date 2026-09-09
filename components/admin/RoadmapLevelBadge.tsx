import { ROADMAP_LEVEL_COLORS } from "@/components/admin/roadmap-utils";

interface RoadmapLevelBadgeProps {
  level: string;
  className?: string;
}

export function RoadmapLevelBadge({ level, className = "" }: RoadmapLevelBadgeProps) {
  const bg = ROADMAP_LEVEL_COLORS[level] ?? "bg-[#8465c2]";

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-3 py-0.5 text-[15px] font-medium text-white tracking-[0.15px] ${bg} ${className}`}
    >
      {level}
    </span>
  );
}
