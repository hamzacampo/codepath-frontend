"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { ProblemForm } from "@/components/admin/ProblemForm";
import { TestCaseEditor } from "@/components/admin/TestCaseEditor";
import { apiService } from "@/lib/api-service";
import type { CodePathProblemDetail, CreateCodePathProblemInput } from "@/types";

export default function EditProblemPage() {
  const params = useParams();
  const problemId = params.id as string;

  const [problem, setProblem] = useState<CodePathProblemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [statusAction, setStatusAction] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadProblem = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getCodePathProblem(problemId);
      setProblem(data);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : undefined;
      setError(message ?? "Failed to load problem");
      setProblem(null);
    } finally {
      setLoading(false);
    }
  }, [problemId]);

  useEffect(() => {
    loadProblem();
  }, [loadProblem]);

  const handleUpdate = async (data: CreateCodePathProblemInput) => {
    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);
    try {
      const updated = await apiService.updateCodePathProblem(problemId, data);
      setProblem(updated);
      setFormSuccess("Problem updated successfully");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : undefined;
      setFormError(message ?? "Failed to update problem");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!problem) return;
    setStatusAction(problem.status === "PUBLISHED" ? "unpublish" : "publish");
    setStatusMessage(null);
    try {
      const updated =
        problem.status === "PUBLISHED"
          ? await apiService.unpublishCodePathProblem(problemId)
          : await apiService.publishCodePathProblem(problemId);
      setProblem(updated);
      setStatusMessage({
        type: "success",
        text:
          updated.status === "PUBLISHED"
            ? "Problem published"
            : "Problem unpublished",
      });
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : undefined;
      setStatusMessage({
        type: "error",
        text: message ?? "Failed to update publish status",
      });
    } finally {
      setStatusAction(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Loading problem...</p>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="max-w-4xl mx-auto flex flex-col gap-4">
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {error ?? "Problem not found"}
          </div>
          <Link
            href="/admin/problems"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground w-fit"
          >
            <Icon icon="mdi:arrow-left" className="w-4 h-4" aria-hidden />
            Back to Problems
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Link
              href="/admin/problems"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
            >
              <Icon icon="mdi:arrow-left" className="w-4 h-4" aria-hidden />
              Back to Problems
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Edit Problem
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                  problem.status === "PUBLISHED"
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                {problem.status}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {problem.slug}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handlePublishToggle}
            disabled={!!statusAction}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
              problem.status === "PUBLISHED"
                ? "border border-border text-foreground hover:bg-muted"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            <Icon
              icon={
                problem.status === "PUBLISHED"
                  ? "mdi:download"
                  : "mdi:upload"
              }
              className="w-5 h-5"
              aria-hidden
            />
            {statusAction
              ? "Updating..."
              : problem.status === "PUBLISHED"
                ? "Unpublish"
                : "Publish"}
          </button>
        </div>

        {statusMessage && (
          <div
            className={`rounded-xl px-4 py-3 text-sm border ${
              statusMessage.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-destructive/10 border-destructive/30 text-destructive"
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
          {formSuccess && (
            <div className="mb-4 rounded-lg bg-green-500/10 border border-green-500/30 px-3 py-2 text-sm text-green-400">
              {formSuccess}
            </div>
          )}
          {formError && (
            <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive">
              {formError}
            </div>
          )}
          <ProblemForm
            defaultValues={{
              slug: problem.slug,
              title: problem.title,
              statement: problem.statement,
              inputDescription: problem.inputDescription,
              outputDescription: problem.outputDescription,
              constraints: problem.constraints ?? "",
              rating: problem.rating,
              tags: problem.tags.join(", "),
              timeLimitMs: problem.timeLimitMs,
              memoryLimitMb: problem.memoryLimitMb,
            }}
            submitLabel="Save Changes"
            isSubmitting={isSubmitting}
            onSubmit={handleUpdate}
          />
        </div>

        <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <TestCaseEditor
            testCases={problem.testCases}
            onCreate={async (data) => {
              await apiService.createProblemTestCase(problemId, data);
              await loadProblem();
            }}
            onUpdate={async (caseId, data) => {
              await apiService.updateProblemTestCase(problemId, caseId, data);
              await loadProblem();
            }}
            onDelete={async (caseId) => {
              await apiService.deleteProblemTestCase(problemId, caseId);
              await loadProblem();
            }}
          />
        </div>
      </div>
    </div>
  );
}
