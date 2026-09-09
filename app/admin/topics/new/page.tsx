"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { TopicForm } from "@/components/admin/TopicForm";

export default function AdminNewTopicPage() {
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
          <h1 className="text-[32px] font-bold text-foreground leading-none">Create Topic</h1>
          <p className="text-sm text-muted-foreground">
            Add a topic to the catalog for roadmaps and AI generation.
          </p>
        </div>
        <TopicForm mode="create" />
      </div>
    </div>
  );
}
