"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { QuizQuestionForm } from "@/components/admin/QuizQuestionForm";
import { apiService } from "@/lib/api-service";
import { getApiErrorMessage } from "@/lib/errors";
import type { QuizQuestionSafe } from "@/types";

export default function EditQuizQuestionPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = Number(params.id);

  const [question, setQuestion] = useState<QuizQuestionSafe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(questionId)) {
      setError("Invalid question id");
      setLoading(false);
      return;
    }

    setLoading(true);
    apiService
      .getQuizQuestion(questionId)
      .then(setQuestion)
      .catch((err) => {
        setError(getApiErrorMessage(err, "Failed to load quiz question"));
      })
      .finally(() => setLoading(false));
  }, [questionId]);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <div className="flex flex-col gap-2">
          <Link
            href="/admin/quiz"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <Icon icon="mdi:arrow-left" className="w-4 h-4" aria-hidden />
            Back to Quiz
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Edit Quiz Question</h1>
          <p className="text-sm text-muted-foreground">
            Update the question, score, and answer options.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {submitError && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {submitError}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-muted-foreground">Loading question...</div>
        ) : question ? (
          <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
            <QuizQuestionForm
              submitLabel="Save Changes"
              isSubmitting={isSubmitting}
              defaultValues={{
                questionTitle: question.questionTitle,
                score: question.score,
                options: question.options,
              }}
              onSubmit={async (data) => {
                setIsSubmitting(true);
                setSubmitError(null);
                try {
                  await apiService.updateQuizQuestion(questionId, data);
                  router.push("/admin/quiz");
                } catch (err) {
                  setSubmitError(getApiErrorMessage(err, "Failed to update quiz question"));
                  setIsSubmitting(false);
                }
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
