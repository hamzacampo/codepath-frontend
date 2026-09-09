"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { apiService } from "@/lib/api-service";
import { getApiErrorMessage } from "@/lib/errors";
import type { MenteeSafe } from "@/types";

export default function AdminUsersPage() {
  const [mentees, setMentees] = useState<MenteeSafe[]>([]);
  const [nameFilter, setNameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<MenteeSafe | null>(null);

  const fetchMentees = useCallback(() => {
    setLoading(true);
    setError(null);
    return apiService
      .getMentees({
        name: nameFilter.trim() || undefined,
        email: emailFilter.trim() || undefined,
      })
      .then(setMentees)
      .catch((err) => {
        setError(getApiErrorMessage(err, "Failed to load mentees"));
        setMentees([]);
      })
      .finally(() => setLoading(false));
  }, [nameFilter, emailFilter]);

  useEffect(() => {
    return fetchMentees();
  }, [fetchMentees]);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="flex flex-col gap-6 max-w-6xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">View and manage mentees</p>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); fetchMentees(); }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            placeholder="Filter by name..."
            className="flex-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
          />
          <input
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            placeholder="Filter by email..."
            className="flex-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
          />
          <button type="submit" className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">
            Filter
          </button>
        </form>

        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-muted-foreground">Loading mentees...</div>
        ) : mentees.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
            No mentees found.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-4 py-3 text-left font-medium">Username</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Joined</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mentees.map((mentee) => (
                  <tr key={mentee.id} className="border-b border-border/50">
                    <td className="px-4 py-3">{mentee.username}</td>
                    <td className="px-4 py-3 text-muted-foreground">{mentee.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(mentee.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelected(mentee)}
                        className="text-xs text-primary hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <div className="w-full max-w-md rounded-lg border border-border bg-background p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Mentee Details</h2>
                <button type="button" onClick={() => setSelected(null)} aria-label="Close">
                  <Icon icon="mdi:close" className="w-5 h-5" aria-hidden />
                </button>
              </div>
              <div className="text-sm flex flex-col gap-2">
                <p><span className="text-muted-foreground">Username:</span> {selected.username}</p>
                <p><span className="text-muted-foreground">Email:</span> {selected.email}</p>
                <p><span className="text-muted-foreground">ID:</span> <span className="font-mono text-xs">{selected.id}</span></p>
                <p><span className="text-muted-foreground">Joined:</span> {new Date(selected.createdAt).toLocaleString()}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
