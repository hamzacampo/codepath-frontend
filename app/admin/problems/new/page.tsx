"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { ProblemForm } from "@/components/admin/ProblemForm";
import { apiService } from "@/lib/api-service";
import type { CreateCodePathProblemInput } from "@/types";

export default function CreateProblemPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateCodePathProblemInput) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const problem = await apiService.createCodePathProblem(data);
      router.push(`/admin/problems/${problem.id}`);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : undefined;
      setError(message ?? "Failed to create problem");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <div className="flex flex-col gap-2">
          <Link
            href="/admin/problems"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <Icon icon="mdi:arrow-left" className="w-4 h-4" aria-hidden />
            Back to Problems
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Create Problem
          </h1>
          <p className="text-sm text-muted-foreground">
            New problems start as drafts. Add test cases and publish when ready.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <ProblemForm
            submitLabel="Create Problem"
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
