"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InsightForm } from "@/components/admin/InsightForm";
import { apiService } from "@/lib/api-service";
import { getApiErrorMessage } from "@/lib/errors";
import type { AdminInsight } from "@/types";

function formatDate(value: string): string {
  const date = new Date(value);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export default function AdminInsightsPage() {
  const [insights, setInsights] = useState<AdminInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInsight, setEditingInsight] = useState<AdminInsight | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [insightToDelete, setInsightToDelete] = useState<AdminInsight | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchInsights = useCallback(() => {
    setLoading(true);
    setError(null);
    apiService
      .getAdminInsights()
      .then(setInsights)
      .catch((err) => {
        setError(getApiErrorMessage(err, "Failed to load insights"));
        setInsights([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const openCreateDialog = () => {
    setEditingInsight(null);
    setActionError(null);
    setDialogOpen(true);
  };

  const openEditDialog = (insight: AdminInsight) => {
    setEditingInsight(insight);
    setActionError(null);
    setDialogOpen(true);
  };

  const handleSave = async (values: {
    content: string;
    isActive: boolean;
    sortOrder: number;
  }) => {
    setSaving(true);
    setActionError(null);
    try {
      if (editingInsight) {
        await apiService.updateInsight(editingInsight.id, values);
      } else {
        await apiService.createInsight(values);
      }
      setDialogOpen(false);
      setEditingInsight(null);
      fetchInsights();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to save insight"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!insightToDelete) return;
    setDeleting(true);
    setActionError(null);
    try {
      await apiService.deleteInsight(insightToDelete.id);
      setDeleteConfirmOpen(false);
      setInsightToDelete(null);
      fetchInsights();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to delete insight"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          if (deleting) return;
          setDeleteConfirmOpen(open);
          if (!open) setInsightToDelete(null);
        }}
        title="Delete insight?"
        description="This insight will be removed from the dashboard panel."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        action="delete"
        loading={deleting}
        onConfirm={handleDelete}
      />

      <Dialog open={dialogOpen} onOpenChange={(open) => !saving && setDialogOpen(open)}>
        <DialogContent className="max-w-lg p-6 sm:p-8 space-y-6">
          <DialogHeader className="gap-2">
            <DialogTitle className="text-xl">
              {editingInsight ? "Edit insight" : "Add insight"}
            </DialogTitle>
            <DialogDescription className="leading-relaxed">
              Insights appear in the mentee dashboard Insights Panel when marked active.
            </DialogDescription>
          </DialogHeader>
          {actionError && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
              {actionError}
            </div>
          )}
          <InsightForm
            key={editingInsight?.id ?? "new"}
            initialValues={editingInsight ?? undefined}
            submitLabel={editingInsight ? "Save changes" : "Create insight"}
            isSubmitting={saving}
            onCancel={() => setDialogOpen(false)}
            onSubmit={handleSave}
          />
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Insights</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage dashboard tips shown to mentees in the Insights Panel.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateDialog}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Icon icon="mdi:plus" className="w-5 h-5" aria-hidden />
            Add insight
          </button>
        </div>

        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="rounded-xl overflow-hidden border border-border/40">
          <div className="grid grid-cols-[1fr_88px_96px_96px] items-center px-5 py-3 bg-linear-to-r from-[#2a2a2a] to-[#1f1f1f] text-sm font-medium text-foreground">
            <span>Content</span>
            <span>Order</span>
            <span>Status</span>
            <span className="sr-only">Actions</span>
          </div>

          {loading ? (
            <div className="px-5 py-10 text-center text-muted-foreground">Loading insights...</div>
          ) : insights.length === 0 ? (
            <div className="px-5 py-10 text-center text-muted-foreground">
              No insights yet. Add one to populate the dashboard panel.
            </div>
          ) : (
            insights.map((insight) => (
              <div
                key={insight.id}
                className="grid grid-cols-[1fr_88px_96px_96px] items-center gap-3 px-5 py-4 border-t border-border/30 text-sm"
              >
                <div className="min-w-0">
                  <p className="text-foreground line-clamp-2">{insight.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Updated {formatDate(insight.updatedAt)}
                  </p>
                </div>
                <span className="text-muted-foreground">{insight.sortOrder}</span>
                <span
                  className={
                    insight.isActive
                      ? "text-emerald-400 text-xs font-medium"
                      : "text-muted-foreground text-xs"
                  }
                >
                  {insight.isActive ? "Active" : "Hidden"}
                </span>
                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => openEditDialog(insight)}
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                    aria-label="Edit insight"
                  >
                    <Icon icon="mdi:pencil-outline" className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInsightToDelete(insight);
                      setDeleteConfirmOpen(true);
                    }}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    aria-label="Delete insight"
                  >
                    <Icon icon="mdi:trash-can-outline" className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
