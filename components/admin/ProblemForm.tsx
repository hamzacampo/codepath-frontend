"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import type { CreateCodePathProblemInput } from "@/types";

const problemFormSchema = z.object({
  slug: z.string().max(120).optional(),
  title: z.string().min(1, "Title is required").max(200),
  statement: z.string().min(1, "Statement is required").max(100_000),
  inputDescription: z.string().min(1, "Input description is required").max(20_000),
  outputDescription: z.string().min(1, "Output description is required").max(20_000),
  constraints: z.string().max(20_000).optional(),
  rating: z.number().int().min(800, "Min rating is 800").max(3500, "Max rating is 3500"),
  tags: z.string().min(1, "At least one tag is required"),
  timeLimitMs: z.number().int().min(100).max(30_000),
  memoryLimitMb: z.number().int().min(16).max(1024),
});

export type ProblemFormValues = z.infer<typeof problemFormSchema>;

const fieldClass =
  "w-full rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background";

interface ProblemFormProps {
  defaultValues?: Partial<ProblemFormValues>;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (data: CreateCodePathProblemInput) => Promise<void>;
}

function parseTagsInput(tags: string): string[] {
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function ProblemForm({
  defaultValues,
  submitLabel,
  isSubmitting = false,
  onSubmit,
}: ProblemFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProblemFormValues>({
    resolver: zodResolver(problemFormSchema),
    defaultValues: {
      slug: defaultValues?.slug ?? "",
      title: defaultValues?.title ?? "",
      statement: defaultValues?.statement ?? "",
      inputDescription: defaultValues?.inputDescription ?? "",
      outputDescription: defaultValues?.outputDescription ?? "",
      constraints: defaultValues?.constraints ?? "",
      rating: defaultValues?.rating ?? 800,
      tags: defaultValues?.tags ?? "",
      timeLimitMs: defaultValues?.timeLimitMs ?? 2000,
      memoryLimitMb: defaultValues?.memoryLimitMb ?? 256,
    },
  });

  const onFormSubmit = handleSubmit(async (values) => {
    const tags = parseTagsInput(values.tags);
    if (tags.length === 0) return;

    await onSubmit({
      slug: values.slug?.trim() || undefined,
      title: values.title.trim(),
      statement: values.statement,
      inputDescription: values.inputDescription,
      outputDescription: values.outputDescription,
      constraints: values.constraints?.trim() || null,
      rating: values.rating,
      tags,
      timeLimitMs: values.timeLimitMs,
      memoryLimitMb: values.memoryLimitMb,
    });
  });

  return (
    <form onSubmit={onFormSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" className={fieldClass} {...register("title")} />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="slug">Slug (optional)</Label>
          <Input
            id="slug"
            className={fieldClass}
            placeholder="auto-generated from title"
            {...register("slug")}
          />
          {errors.slug && (
            <p className="text-xs text-destructive">{errors.slug.message}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="statement">Statement *</Label>
        <Textarea
          id="statement"
          className={`${fieldClass} min-h-[160px] resize-y`}
          {...register("statement")}
        />
        {errors.statement && (
          <p className="text-xs text-destructive">{errors.statement.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="inputDescription">Input Description *</Label>
          <Textarea
            id="inputDescription"
            className={`${fieldClass} min-h-[100px] resize-y`}
            {...register("inputDescription")}
          />
          {errors.inputDescription && (
            <p className="text-xs text-destructive">
              {errors.inputDescription.message}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="outputDescription">Output Description *</Label>
          <Textarea
            id="outputDescription"
            className={`${fieldClass} min-h-[100px] resize-y`}
            {...register("outputDescription")}
          />
          {errors.outputDescription && (
            <p className="text-xs text-destructive">
              {errors.outputDescription.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="constraints">Constraints</Label>
        <Textarea
          id="constraints"
          className={`${fieldClass} min-h-[80px] resize-y`}
          {...register("constraints")}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="rating">Rating *</Label>
          <Input
            id="rating"
            type="number"
            className={fieldClass}
            {...register("rating", { valueAsNumber: true })}
          />
          {errors.rating && (
            <p className="text-xs text-destructive">{errors.rating.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="timeLimitMs">Time Limit (ms)</Label>
          <Input
            id="timeLimitMs"
            type="number"
            className={fieldClass}
            {...register("timeLimitMs", { valueAsNumber: true })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="memoryLimitMb">Memory Limit (MB)</Label>
          <Input
            id="memoryLimitMb"
            type="number"
            className={fieldClass}
            {...register("memoryLimitMb", { valueAsNumber: true })}
          />
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-1">
          <Label htmlFor="tags">Tags (comma-separated) *</Label>
          <Input
            id="tags"
            className={fieldClass}
            placeholder="implementation, math"
            {...register("tags")}
          />
          {errors.tags && (
            <p className="text-xs text-destructive">{errors.tags.message}</p>
          )}
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
