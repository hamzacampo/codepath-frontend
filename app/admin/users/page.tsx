"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { MenteeDetailModal } from "@/components/admin/MenteeDetailModal";
import { FilterButtons } from "@/components/ui/FilterButtons";
import { Select } from "@/components/ui/Select";
import { apiService } from "@/lib/api-service";
import { getApiErrorMessage } from "@/lib/errors";
import type { MenteeDetails, MenteeSafe } from "@/types";

const PAGE_SIZE = 10;
const LEVEL_OPTIONS = ["All", "Beginner", "Intermediate", "Advanced", "Expert"];

function formatRegisteredAt(value: string | Date): string {
  const date = new Date(value);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day} - ${month} - ${year}`;
}

export default function AdminMenteesPage() {
  const [mentees, setMentees] = useState<MenteeSafe[]>([]);
  const [emailFilter, setEmailFilter] = useState("");
  const [usernameFilter, setUsernameFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");
  const [appliedFilters, setAppliedFilters] = useState({
    email: "",
    username: "",
    level: "All",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<MenteeDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const fetchMentees = useCallback(() => {
    setLoading(true);
    setError(null);
    return apiService
      .getMentees({
        email: appliedFilters.email.trim() || undefined,
        username: appliedFilters.username.trim() || undefined,
        level: appliedFilters.level !== "All" ? appliedFilters.level : undefined,
      })
      .then((list) => {
        setMentees(list);
        setPage(1);
      })
      .catch((err) => {
        setError(getApiErrorMessage(err, "Failed to load mentees"));
        setMentees([]);
      })
      .finally(() => setLoading(false));
  }, [appliedFilters]);

  useEffect(() => {
    fetchMentees();
  }, [fetchMentees]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedDetails(null);
      setDetailsError(null);
      return;
    }

    setDetailsLoading(true);
    setDetailsError(null);
    apiService
      .getMentee(selectedId)
      .then(setSelectedDetails)
      .catch((err) => {
        setDetailsError(getApiErrorMessage(err, "Failed to load mentee details"));
        setSelectedDetails(null);
      })
      .finally(() => setDetailsLoading(false));
  }, [selectedId]);

  const totalPages = Math.max(1, Math.ceil(mentees.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageMentees = useMemo(
    () => mentees.slice(pageStart, pageStart + PAGE_SIZE),
    [mentees, pageStart],
  );

  const handleFilter = (event: React.FormEvent) => {
    event.preventDefault();
    setAppliedFilters({
      email: emailFilter,
      username: usernameFilter,
      level: levelFilter,
    });
  };

  const handleClear = () => {
    setEmailFilter("");
    setUsernameFilter("");
    setLevelFilter("All");
    setAppliedFilters({ email: "", username: "", level: "All" });
  };

  const pageNumbers = useMemo(() => {
    const maxButtons = Math.min(5, totalPages);
    const start = Math.max(1, Math.min(currentPage - 2, totalPages - maxButtons + 1));
    return Array.from({ length: maxButtons }, (_, index) => start + index);
  }, [currentPage, totalPages]);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header>
          <h1 className="text-3xl font-bold text-foreground">Mentees</h1>
        </header>

        <form
          onSubmit={handleFilter}
          className="flex flex-col gap-4 rounded-[10px] border border-[#1e1e1e] bg-[#0c0c0c] p-5 lg:flex-row lg:flex-wrap lg:items-end"
        >
          <label className="flex w-full flex-col gap-1.5 lg:max-w-[220px]">
            <span className="text-xs font-semibold text-accent">Email</span>
            <input
              value={emailFilter}
              onChange={(event) => setEmailFilter(event.target.value)}
              placeholder="johndoe@gmail.com"
              className="h-10 rounded-[10px] border border-[#1e1e1e] bg-black px-3.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
            />
          </label>

          <label className="flex w-full flex-col gap-1.5 lg:max-w-[220px]">
            <span className="text-xs font-semibold text-accent">Username</span>
            <input
              value={usernameFilter}
              onChange={(event) => setUsernameFilter(event.target.value)}
              placeholder="john-doe"
              className="h-10 rounded-[10px] border border-[#1e1e1e] bg-black px-3.5 text-sm text-foreground outline-none transition-colors focus:border-primary"
            />
          </label>

          <label className="flex w-full flex-col gap-1.5 lg:max-w-[180px]">
            <span className="text-xs font-semibold text-accent">Level</span>
            <Select
              value={levelFilter}
              onChange={(event) => setLevelFilter(event.target.value)}
              className="h-10 rounded-[10px] border-[#1e1e1e] bg-black"
              options={LEVEL_OPTIONS.map((level) => ({
                value: level,
                label: level === "All" ? "All levels" : level,
              }))}
            />
          </label>

          <FilterButtons loading={loading} onClear={handleClear} />
        </form>

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-border">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="bg-[#1a1a1a] text-left">
                  <th className="px-4 py-3 font-medium text-foreground">Full Name</th>
                  <th className="px-4 py-3 font-medium text-foreground">Email</th>
                  <th className="px-4 py-3 font-medium text-foreground">Level</th>
                  <th className="px-4 py-3 font-medium text-foreground">Registered At</th>
                  <th className="px-4 py-3 text-right font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                      Loading mentees...
                    </td>
                  </tr>
                ) : pageMentees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                      No mentees found.
                    </td>
                  </tr>
                ) : (
                  pageMentees.map((mentee) => (
                    <tr key={mentee.id} className="border-t border-border/60">
                      <td className="px-4 py-3 text-foreground">
                        {mentee.fullName || "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{mentee.email}</td>
                      <td className="px-4 py-3 text-foreground">{mentee.level || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatRegisteredAt(mentee.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedId(mentee.id)}
                          className="inline-flex items-center justify-center rounded-md p-1 text-primary hover:bg-primary/10"
                          aria-label={`View ${mentee.username}`}
                        >
                          <Icon icon="tabler:eye" className="h-6 w-6" aria-hidden />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!loading && mentees.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {pageStart + 1}-{Math.min(pageStart + PAGE_SIZE, mentees.length)} of{" "}
              {mentees.length} mentees
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={currentPage === 1}
                className="rounded-full p-2 text-primary disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous page"
              >
                <Icon icon="mdi:chevron-left" className="h-5 w-5" aria-hidden />
              </button>

              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    pageNumber === currentPage
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-secondary"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={currentPage === totalPages}
                className="rounded-full p-2 text-primary disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
              >
                <Icon icon="mdi:chevron-right" className="h-5 w-5" aria-hidden />
              </button>
            </div>
          </div>
        )}
      </div>

      <MenteeDetailModal
        open={Boolean(selectedId)}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
        details={selectedDetails}
        loading={detailsLoading}
        error={detailsError}
      />
    </div>
  );
}
