"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";

export default function AdminReferencePage() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="flex flex-col gap-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Reference Library</h1>
          <p className="text-sm text-muted-foreground">Admin overview for reference snippets</p>
        </div>

        <div className="rounded-lg border border-border bg-secondary/30 p-6 flex flex-col gap-4">
          <Icon icon="mdi:book-open-outline" className="w-12 h-12 text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground leading-relaxed">
            Reference snippets are managed per-mentee through the mentee dashboard.
            Each user creates, curates, and exports their own personal reference library.
            There is no admin-wide snippet management API in the current backend.
          </p>
          <p className="text-sm text-muted-foreground">
            Mentees can access their library at{" "}
            <Link href="/dashboard/reference" className="text-primary hover:underline">
              /dashboard/reference
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
