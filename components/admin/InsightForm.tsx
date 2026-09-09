"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export type InsightFormValues = {
  content: string;
  isActive: boolean;
  sortOrder: number;
};

interface InsightFormProps {
  initialValues?: Partial<InsightFormValues>;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (values: InsightFormValues) => Promise<void>;
  onCancel?: () => void;
}

export function InsightForm({
  initialValues,
  submitLabel,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: InsightFormProps) {
  const [content, setContent] = useState(initialValues?.content ?? "");
  const [isActive, setIsActive] = useState(initialValues?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(String(initialValues?.sortOrder ?? 0));

  return (
    <form
      className="space-y-5"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSubmit({
          content: content.trim(),
          isActive,
          sortOrder: Number(sortOrder) || 0,
        });
      }}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="insight-content">
          Insight text
        </label>
        <Textarea
          id="insight-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Solve 3 DP problems to strengthen your weak area."
          className="min-h-[120px]"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="insight-sort">
            Sort order
          </label>
          <Input
            id="insight-sort"
            type="number"
            min={0}
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground pt-7">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          Active (visible on dashboard)
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-1">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || !content.trim()}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
