"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import type { QuizOptionInput } from "@/types";

const fieldClass =
  "w-full rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background";

export interface QuizQuestionFormValues {
  questionTitle: string;
  score: number;
  options: QuizOptionInput[];
}

interface QuizQuestionFormProps {
  defaultValues?: Partial<QuizQuestionFormValues>;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (data: QuizQuestionFormValues) => Promise<void>;
}

type OptionRow = QuizOptionInput & { clientId: string };

function createClientId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeOrder(options: OptionRow[]): OptionRow[] {
  return options.map((option, index) => ({
    ...option,
    orderIndex: index,
  }));
}

function createEmptyOption(orderIndex: number): OptionRow {
  return {
    clientId: createClientId(),
    optionText: "",
    orderIndex,
    isCorrect: orderIndex === 0,
  };
}

function toOptionRows(options?: QuizOptionInput[]): OptionRow[] {
  if (!options?.length) {
    return [createEmptyOption(0), createEmptyOption(1)];
  }

  return normalizeOrder(
    [...options]
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((option) => ({
        ...option,
        clientId: createClientId(),
      })),
  );
}

export function QuizQuestionForm({
  defaultValues,
  submitLabel,
  isSubmitting = false,
  onSubmit,
}: QuizQuestionFormProps) {
  const [questionTitle, setQuestionTitle] = useState(
    defaultValues?.questionTitle ?? "",
  );
  const [score, setScore] = useState(defaultValues?.score ?? 10);
  const [options, setOptions] = useState<OptionRow[]>(() =>
    toOptionRows(defaultValues?.options),
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const setCorrectOption = (index: number) => {
    setOptions((current) =>
      current.map((option, optionIndex) => ({
        ...option,
        isCorrect: optionIndex === index,
      })),
    );
  };

  const addOption = () => {
    setOptions((current) => normalizeOrder([...current, createEmptyOption(current.length)]));
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions((current) => {
      const next = normalizeOrder(current.filter((_, optionIndex) => optionIndex !== index));
      if (!next.some((option) => option.isCorrect) && next.length > 0) {
        next[0] = { ...next[0], isCorrect: true };
      }
      return next;
    });
  };

  const updateOptionText = (index: number, value: string) => {
    setOptions((current) =>
      current.map((option, optionIndex) =>
        optionIndex === index ? { ...option, optionText: value } : option,
      ),
    );
  };

  const reorderOptions = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setOptions((current) => {
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return normalizeOrder(next);
    });
  };

  const handleDragStart = (event: React.DragEvent, index: number) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
    setDragIndex(index);
  };

  const handleDragOver = (event: React.DragEvent, index: number) => {
    event.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (dragIndex === null) return;
    reorderOptions(dragIndex, index);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const trimmedTitle = questionTitle.trim();
    if (!trimmedTitle) {
      setFormError("Title is required");
      return;
    }

    const normalizedOptions = normalizeOrder(options).map((option) => ({
      optionText: option.optionText.trim(),
      orderIndex: option.orderIndex,
      isCorrect: option.isCorrect,
    }));

    if (normalizedOptions.some((option) => !option.optionText)) {
      setFormError("All options must have text");
      return;
    }

    const correctCount = normalizedOptions.filter((option) => option.isCorrect).length;
    if (correctCount !== 1) {
      setFormError("Select exactly one correct option");
      return;
    }

    await onSubmit({
      questionTitle: trimmedTitle,
      score,
      options: normalizedOptions,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {formError && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[1fr_140px] gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="questionTitle">Title</Label>
          <Input
            id="questionTitle"
            className={fieldClass}
            value={questionTitle}
            onChange={(event) => setQuestionTitle(event.target.value)}
            placeholder="Binary Search Implementation"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="score">Score</Label>
          <Input
            id="score"
            type="number"
            min={1}
            max={100}
            className={fieldClass}
            value={score}
            onChange={(event) => setScore(Number(event.target.value))}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Options</h2>
            <p className="text-xs text-muted-foreground">
              Drag to reorder, add multiple choices, and mark one as correct.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addOption}>
            <Icon icon="mdi:plus" className="w-4 h-4 mr-1" aria-hidden />
            Add option
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          {options.map((option, index) => (
            <div
              key={option.clientId}
              onDragOver={(event) => handleDragOver(event, index)}
              onDrop={() => handleDrop(index)}
              className={`rounded-xl border bg-secondary/20 p-4 flex flex-col gap-3 transition-colors ${
                dragIndex === index
                  ? "opacity-60 border-primary/50"
                  : dragOverIndex === index
                    ? "border-primary bg-primary/10"
                    : "border-border"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <button
                    type="button"
                    draggable
                    onDragStart={(event) => handleDragStart(event, index)}
                    onDragEnd={handleDragEnd}
                    className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0"
                    aria-label={`Drag option ${index + 1}`}
                  >
                    <Icon icon="mdi:drag-vertical" className="w-5 h-5" aria-hidden />
                  </button>
                  <span className="text-sm font-medium text-foreground">
                    Option {index + 1}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  disabled={options.length <= 2}
                  className="text-destructive disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label={`Remove option ${index + 1}`}
                >
                  <Icon icon="mdi:trash-can-outline" className="w-5 h-5" aria-hidden />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Answer text</Label>
                <Input
                  className={fieldClass}
                  value={option.optionText}
                  onChange={(event) => updateOptionText(index, event.target.value)}
                  placeholder="Enter option text"
                />
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="radio"
                  name="correct-option"
                  checked={option.isCorrect}
                  onChange={() => setCorrectOption(index)}
                  className="accent-primary"
                />
                Mark as correct answer
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
