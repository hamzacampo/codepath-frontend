"use client";

import { useParams } from "next/navigation";
import { CodeforcesProblemView } from "@/components/problems/CodeforcesProblemView";

export default function DashboardCodeforcesProblemPage() {
  const params = useParams();
  const contestIdParam = params?.contestId;
  const indexParam = params?.index;

  const contestId =
    typeof contestIdParam === "string"
      ? parseInt(contestIdParam, 10)
      : undefined;
  const index =
    typeof indexParam === "string"
      ? indexParam
      : Array.isArray(indexParam)
        ? indexParam[0]
        : undefined;

  if (contestId == null || !index || Number.isNaN(contestId)) {
    return (
      <div className="h-full min-h-0 flex flex-1 items-center justify-center text-muted-foreground">
        Invalid problem
      </div>
    );
  }

  return <CodeforcesProblemView contestId={contestId} index={index} />;
}
