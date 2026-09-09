"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiService } from "@/lib/api-service";
import { getApiErrorMessage } from "@/lib/errors";
import type { Topic } from "@/types";

interface TopicFormProps {
  mode: "create" | "edit";
  topicId?: number;
  initial?: Pick<Topic, "title" | "tags" | "rating">;
}

export function TopicForm({ mode, topicId, initial }: TopicFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [tags, setTags] = useState(initial?.tags ?? "");
  const [rating, setRating] = useState(initial?.rating ?? "1200");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      title: title.trim(),
      tags: tags.trim(),
      rating: rating.trim(),
    };

    try {
      if (mode === "create") {
        await apiService.createTopic(payload);
      } else if (topicId != null) {
        await apiService.updateTopic(topicId, payload);
      }
      router.push("/admin/topics");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to save topic"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-xl">
      {error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="topic-title" className="text-sm font-medium text-foreground">
          Title
        </label>
        <input
          id="topic-title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Dynamic Programming"
          className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="topic-tags" className="text-sm font-medium text-foreground">
          Tags
        </label>
        <input
          id="topic-tags"
          type="text"
          required
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="comma-separated, e.g. dp,dynamic programming"
          className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground"
        />
        <p className="text-xs text-muted-foreground">
          Used to match Codeforces problems and CodePath solves to this topic.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="topic-rating" className="text-sm font-medium text-foreground">
          Typical rating
        </label>
        <input
          id="topic-rating"
          type="text"
          required
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          placeholder="e.g. 1500"
          className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground"
        />
        <p className="text-xs text-muted-foreground">
          Approximate Codeforces difficulty for this topic (used in roadmaps and AI generation).
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? "Saving..." : mode === "create" ? "Create Topic" : "Save Changes"}
        </button>
        <Link
          href="/admin/topics"
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
