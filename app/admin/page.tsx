"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { apiService } from "@/lib/api-service";
import { CodeforcesIntegrationPanel } from "@/components/profile/CodeforcesIntegrationPanel";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    apiService
      .listAllCodePathProblemsAdmin({ page: 1, limit: 100 })
      .then((res) => {
        if (!cancelled) {
          const published = res.items.filter((p) => p.status === "PUBLISHED").length;
          const draft = res.items.filter((p) => p.status === "DRAFT").length;
          setStats({
            total: res.total,
            published,
            draft,
            loading: false,
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStats({ total: 0, published: 0, draft: 0, loading: false });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    {
      title: "Total Problems",
      value: stats.loading ? "—" : String(stats.total),
      icon: "mdi:code-braces",
    },
    {
      title: "Published",
      value: stats.loading ? "—" : String(stats.published),
      icon: "mdi:check-circle-outline",
    },
    {
      title: "Drafts",
      value: stats.loading ? "—" : String(stats.draft),
      icon: "mdi:file-document-edit-outline",
    },
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="flex flex-col gap-6 sm:gap-8 max-w-6xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage CodePath platform content and modules.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {cards.map(({ title, value, icon }) => (
            <div
              key={title}
              className="rounded-lg bg-linear-to-r from-accent to-[#3F305C] p-4 sm:p-5 box-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-accent-foreground/80 text-sm font-medium">
                  {title}
                </span>
                <span className="text-accent-foreground text-xl sm:text-2xl font-bold truncate">
                  {value}
                </span>
              </div>
              <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-accent-foreground/10 text-accent-foreground">
                <Icon icon={icon} className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">Quick Actions</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Create and manage first-party CodePath problems with test cases.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/problems"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Icon icon="mdi:format-list-bulleted" className="w-5 h-5" aria-hidden />
              View Problems
            </Link>
            <Link
              href="/admin/problems/new"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Icon icon="mdi:plus" className="w-5 h-5" aria-hidden />
              Create Problem
            </Link>
            <Link
              href="/admin/contests"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Icon icon="mdi:trophy-outline" className="w-5 h-5" aria-hidden />
              Contests
            </Link>
            <Link
              href="/admin/roadmaps"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Icon icon="streamline:arrow-roadmap" className="w-5 h-5" aria-hidden />
              Roadmaps
            </Link>
            <Link
              href="/admin/topics"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Icon icon="mdi:tag-multiple-outline" className="w-5 h-5" aria-hidden />
              Topics
            </Link>
            <Link
              href="/admin/coaches"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Icon icon="mdi:presentation" className="w-5 h-5" aria-hidden />
              Coach Session
            </Link>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Icon icon="mdi:account-group-outline" className="w-5 h-5" aria-hidden />
              Users
            </Link>
          </div>
        </div>

        <CodeforcesIntegrationPanel />
      </div>
    </div>
  );
}
