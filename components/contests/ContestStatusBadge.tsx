import type { ContestStatus } from "@/types";

const statusStyles: Record<ContestStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground border-border",
  SCHEDULED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  ONGOING: "bg-green-500/20 text-green-400 border-green-500/30",
  COMPLETED: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  CANCELLED: "bg-destructive/20 text-destructive border-destructive/30",
};

export function ContestStatusBadge({ status }: { status: ContestStatus | string }) {
  const key = status as ContestStatus;
  const style = statusStyles[key] ?? statusStyles.DRAFT;
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border ${style}`}>
      {status}
    </span>
  );
}
