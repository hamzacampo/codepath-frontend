"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { TopicForm } from "@/components/admin/TopicForm";
import { apiService } from "@/lib/api-service";
import { getApiErrorMessage } from "@/lib/errors";
import type { Topic } from "@/types";

export default function AdminEditTopicPage() {
  const params = useParams();
  const topicId = Number(params.id);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(topicId)) {
      setError("Invalid topic id");
      setLoading(false);
      return;
    }

    apiService
      .getTopicById(topicId)
      .then(setTopic)
      .catch((err) => {
        setError(getApiErrorMessage(err, "Failed to load topic"));
        setTopic(null);
      })
      .finally(() => setLoading(false));
  }, [topicId]);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="flex flex-col gap-8 max-w-3xl mx-auto">
        <div className="flex flex-col gap-3">
          <Link
            href="/admin/topics"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground w-fit"
          >
            <Icon icon="mdi:arrow-left" className="w-4 h-4" aria-hidden />
            Back to Topics
          </Link>
          <h1 className="text-[32px] font-bold text-foreground leading-none">Edit Topic</h1>
        </div>

        {loading && (
          <div className="text-sm text-muted-foreground">Loading topic...</div>
        )}
        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {topic && (
          <TopicForm
            mode="edit"
            topicId={topic.id}
            initial={{
              title: topic.title,
              tags: topic.tags ?? "",
              rating: topic.rating ?? "",
            }}
          />
        )}
      </div>
    </div>
  );
}
