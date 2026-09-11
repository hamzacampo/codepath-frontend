"use client";

import { Icon } from "@iconify/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MenteeDetails } from "@/types";

interface MenteeDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  details: MenteeDetails | null;
  loading: boolean;
  error: string | null;
}

function getInitials(details: MenteeDetails): string {
  const source = details.fullName?.trim() || details.username;
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function formatRegisteredAt(value: string | Date): string {
  const date = new Date(value);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day} - ${month} - ${year}`;
}

export function MenteeDetailModal({
  open,
  onOpenChange,
  details,
  loading,
  error,
}: MenteeDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} panelClassName="max-w-3xl">
      <DialogContent className="relative overflow-hidden border-[#2a2a2a] bg-[#141414]">
        <div className="flex max-h-[min(88vh,820px)] flex-col">
          <div className="shrink-0 border-b border-border/60 px-6 pb-5 pt-6 sm:px-8 sm:pt-8">
            <div className="flex items-start justify-between gap-4 pr-10">
              <DialogHeader className="gap-3">
                <DialogTitle className="text-xl font-bold sm:text-2xl">
                  Mentee Details
                </DialogTitle>
                <DialogDescription>
                  Review profile information for this mentee account.
                </DialogDescription>
              </DialogHeader>

              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20 sm:right-6 sm:top-6"
                aria-label="Close mentee details"
              >
                <Icon icon="mdi:close" className="h-5 w-5" aria-hidden />
              </button>
            </div>

            {details && !loading && !error && (
              <div className="mt-6 flex items-center gap-4 rounded-xl border border-border/60 bg-black/40 px-5 py-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                  {getInitials(details)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold text-foreground">
                    {details.fullName || details.username}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">@{details.username}</p>
                  {details.level && (
                    <span className="mt-2 inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-accent">
                      {details.level}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-7">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
                <Icon icon="mdi:loading" className="h-8 w-8 animate-spin text-primary" aria-hidden />
                <p className="text-sm">Loading mentee details...</p>
              </div>
            ) : error ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-8 text-center text-sm text-destructive">
                {error}
              </div>
            ) : details ? (
              <div className="flex flex-col gap-7">
                <section className="flex flex-col gap-3">
                  <SectionLabel>Account ID</SectionLabel>
                  <div className="rounded-xl border border-border/60 bg-black px-4 py-3.5 font-mono text-xs leading-relaxed text-muted-foreground break-all">
                    {details.id}
                  </div>
                </section>

                <section className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <DetailField label="Full Name" value={details.fullName || "—"} />
                  <DetailField label="Username" value={details.username} />
                  <DetailField label="Email" value={details.email} className="sm:col-span-2" />
                  <DetailField
                    label="Registered At"
                    value={formatRegisteredAt(details.createdAt)}
                  />
                </section>

                <div className="h-px bg-border/50" />

                <section className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <DetailField label="Level" value={details.level || "—"} />
                  <DetailField
                    label="Handle"
                    value={details.codeforcesHandle || details.username}
                  />
                  <DetailField label="Phone" value={details.phone || "—"} />
                </section>

                <DetailField label="Location" value={details.country || "—"} />

                <section className="flex flex-col gap-3">
                  <SectionLabel>Bio</SectionLabel>
                  <div className="min-h-[140px] rounded-xl border border-border/60 bg-black px-5 py-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {details.bio || "No bio provided."}
                  </div>
                </section>
              </div>
            ) : null}
          </div>

          <div className="shrink-0 border-t border-border/60 px-6 py-5 sm:px-8">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-full rounded-xl border border-border bg-secondary/60 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary sm:w-auto"
            >
              Close
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-wide text-accent">
      {children}
    </span>
  );
}

function DetailField({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="rounded-xl border border-border/60 bg-black px-4 py-3.5 text-sm text-muted-foreground">
        {value}
      </div>
    </div>
  );
}
