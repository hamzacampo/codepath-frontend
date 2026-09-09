"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { apiService } from "@/lib/api-service";
import { getApiErrorMessage } from "@/lib/errors";
import type { QuizQuestionList } from "@/types";

function formatQuizDate(value: string | Date): string {
  const date = new Date(value);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day} - ${month} - ${year}`;
}

export default function AdminQuizPage() {
  const [questions, setQuestions] = useState<QuizQuestionList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<QuizQuestionList | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchQuestions = useCallback(() => {
    setLoading(true);
    setError(null);
    apiService
      .getQuizQuestions()
      .then(setQuestions)
      .catch((err) => {
        setError(getApiErrorMessage(err, "Failed to load quiz questions"));
        setQuestions([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const openDeleteConfirm = (question: QuizQuestionList) => {
    setQuestionToDelete(question);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!questionToDelete) return;

    setDeleting(true);
    setActionId(questionToDelete.id);
    setActionError(null);
    try {
      await apiService.deleteQuizQuestion(questionToDelete.id);
      setDeleteConfirmOpen(false);
      setQuestionToDelete(null);
      fetchQuestions();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to delete quiz question"));
    } finally {
      setDeleting(false);
      setActionId(null);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          if (deleting) return;
          setDeleteConfirmOpen(open);
          if (!open) setQuestionToDelete(null);
        }}
        title="Delete quiz question?"
        description={
          questionToDelete
            ? `"${questionToDelete.questionTitle}" will be permanently removed from the registration quiz.`
            : "This quiz question will be permanently removed from the registration quiz."
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        action="delete"
        loading={deleting}
        onConfirm={handleDelete}
      />

      <div className="flex flex-col gap-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-foreground">Quiz</h1>
          <Link
            href="/admin/quiz/new"
            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            aria-label="Add quiz question"
          >
            <Icon icon="mdi:plus" className="w-5 h-5" aria-hidden />
          </Link>
        </div>

        {actionError && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {actionError}
          </div>
        )}
        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="rounded-xl overflow-hidden border border-border/40">
          <div className="grid grid-cols-[1fr_180px_96px] items-center px-5 py-3 bg-linear-to-r from-[#2a2a2a] to-[#1f1f1f] text-sm font-medium text-foreground">
            <span>Title</span>
            <span>Created At</span>
            <span className="sr-only">Actions</span>
          </div>

          {loading ? (
            <div className="px-5 py-12 text-center text-sm text-muted-foreground">
              Loading quiz questions...
            </div>
          ) : questions.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-muted-foreground">
              No quiz questions yet.
            </div>
          ) : (
            questions.map((question) => (
              <div
                key={question.id}
                className="grid grid-cols-[1fr_180px_96px] items-center px-5 py-4 border-t border-border/30"
              >
                <span className="text-sm text-foreground truncate pr-4">
                  {question.questionTitle}
                </span>
                <span className="text-sm text-foreground">
                  {formatQuizDate(question.createdAt)}
                </span>
                <div className="flex items-center justify-end gap-3">
                  <Link
                    href={`/admin/quiz/${question.id}`}
                    className="text-primary hover:text-primary/80 transition-colors"
                    aria-label={`Edit ${question.questionTitle}`}
                  >
                    <Icon icon="mdi:square-edit-outline" className="w-6 h-6" aria-hidden />
                  </Link>
                  <button
                    type="button"
                    disabled={actionId === question.id}
                    onClick={() => openDeleteConfirm(question)}
                    className="text-destructive hover:text-destructive/80 disabled:opacity-50 transition-colors"
                    aria-label={`Delete ${question.questionTitle}`}
                  >
                    <Icon icon="mdi:trash-can-outline" className="w-6 h-6" aria-hidden />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
