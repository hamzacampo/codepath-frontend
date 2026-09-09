"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { QuizQuestionForm } from "@/components/admin/QuizQuestionForm";
import { apiService } from "@/lib/api-service";
import { getApiErrorMessage } from "@/lib/errors";

export default function CreateQuizQuestionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Add Quiz Question</h1>
          <p className="text-sm text-muted-foreground">
            Create a multiple-choice question for the registration placement quiz.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <QuizQuestionForm
            submitLabel="Create Question"
            isSubmitting={isSubmitting}
            onSubmit={async (data) => {
              setIsSubmitting(true);
              setError(null);
              try {
                await apiService.createQuizQuestion(data);
                router.push("/admin/quiz");
              } catch (err) {
                setError(getApiErrorMessage(err, "Failed to create quiz question"));
                setIsSubmitting(false);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
