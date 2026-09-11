"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { apiService } from "@/lib/api-service";
import { Select } from "@/components/ui/Select";
import { getApiErrorMessage, downloadBlob } from "@/lib/errors";
import type { ReferenceCurateResponse, SolutionSnippet, Topic } from "@/types";

const LANGUAGES = ["cpp", "python", "java", "javascript", "typescript", "go", "rust"];

export default function ReferenceLibraryPage() {
  const [snippets, setSnippets] = useState<SolutionSnippet[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [curated, setCurated] = useState<ReferenceCurateResponse | null>(null);
  const [curating, setCurating] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formLanguage, setFormLanguage] = useState("cpp");
  const [formCode, setFormCode] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formTopicId, setFormTopicId] = useState<number | "">("");
  const [saving, setSaving] = useState(false);

  const fetchSnippets = useCallback(() => {
    setLoading(true);
    setError(null);
    apiService
      .getMySnippets({ search: search.trim() || undefined })
      .then(setSnippets)
      .catch((err) => {
        setError(getApiErrorMessage(err, "Failed to load snippets"));
        setSnippets([]);
      })
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    apiService.getTopics().then(setTopics).catch(() => setTopics([]));
  }, []);

  useEffect(() => {
    fetchSnippets();
  }, [fetchSnippets]);

  const resetForm = () => {
    setEditingId(null);
    setFormTitle("");
    setFormLanguage("cpp");
    setFormCode("");
    setFormNotes("");
    setFormTags("");
    setFormTopicId("");
    setShowForm(false);
  };

  const openEdit = (snippet: SolutionSnippet) => {
    setEditingId(snippet.id);
    setFormTitle(snippet.title);
    setFormLanguage(snippet.language);
    setFormCode(snippet.code);
    setFormNotes(snippet.notes ?? "");
    setFormTags(snippet.tags ?? "");
    setFormTopicId(snippet.topicId ?? "");
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setActionError(null);
    try {
      const payload = {
        title: formTitle,
        language: formLanguage,
        code: formCode,
        notes: formNotes || undefined,
        tags: formTags || undefined,
        topicId: formTopicId === "" ? null : formTopicId,
      };
      if (editingId) {
        await apiService.updateSnippet(editingId, payload);
      } else {
        await apiService.createSnippet(payload);
      }
      resetForm();
      fetchSnippets();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to save snippet"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this snippet?")) return;
    try {
      await apiService.deleteSnippet(id);
      fetchSnippets();
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to delete snippet"));
    }
  };

  const handleCurate = async () => {
    setCurating(true);
    setActionError(null);
    try {
      const result = await apiService.curateSnippets();
      setCurated(result);
    } catch (err) {
      setActionError(getApiErrorMessage(err, "Failed to curate snippets"));
    } finally {
      setCurating(false);
    }
  };

  const handleExport = async (format: "pdf" | "zip") => {
    setExporting(format);
    setActionError(null);
    try {
      const blob = await apiService.downloadReferenceExport(format);
      downloadBlob(blob, format === "pdf" ? "reference-sheet.pdf" : "reference-sheet.zip");
    } catch (err) {
      setActionError(getApiErrorMessage(err, `Failed to export ${format}`));
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="flex flex-col gap-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Reference Library</h1>
            <p className="text-sm text-muted-foreground">
              Save, organize, and export your solution snippets.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => { resetForm(); setShowForm(true); }}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Icon icon="mdi:plus" className="w-4 h-4" aria-hidden />
              New Snippet
            </button>
            <button
              type="button"
              disabled={curating || snippets.length === 0}
              onClick={handleCurate}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              {curating ? "Curating..." : "AI Curate"}
            </button>
            <button
              type="button"
              disabled={exporting !== null || snippets.length === 0}
              onClick={() => handleExport("pdf")}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              Export PDF
            </button>
            <button
              type="button"
              disabled={exporting !== null || snippets.length === 0}
              onClick={() => handleExport("zip")}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              Export ZIP
            </button>
          </div>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); fetchSnippets(); }}
          className="flex gap-2"
        >
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search snippets..."
            className="flex-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
          />
          <button type="submit" className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">
            Search
          </button>
        </form>

        {(error || actionError) && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {error ?? actionError}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSave} className="rounded-lg border border-border bg-secondary/30 p-4 flex flex-col gap-3">
            <h2 className="text-sm font-semibold">{editingId ? "Edit Snippet" : "New Snippet"}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Title"
                className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
              />
              <Select
                value={formLanguage}
                onChange={(e) => setFormLanguage(e.target.value)}
                options={LANGUAGES.map((language) => ({
                  value: language,
                  label: language,
                }))}
              />
            </div>
            <Select
              value={formTopicId === "" ? "" : String(formTopicId)}
              onChange={(e) =>
                setFormTopicId(e.target.value ? Number(e.target.value) : "")
              }
              options={[
                { value: "", label: "No topic" },
                ...topics.map((topic) => ({
                  value: String(topic.id),
                  label: topic.title,
                })),
              ]}
            />
            <textarea
              required
              value={formCode}
              onChange={(e) => setFormCode(e.target.value)}
              rows={8}
              placeholder="Code"
              className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm font-mono"
            />
            <textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              rows={2}
              placeholder="Notes (optional)"
              className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
            />
            <input
              value={formTags}
              onChange={(e) => setFormTags(e.target.value)}
              placeholder="Tags (comma-separated)"
              className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
                {saving ? "Saving..." : "Save"}
              </button>
              <button type="button" onClick={resetForm} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">
                Cancel
              </button>
            </div>
          </form>
        )}

        {curated && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-foreground">AI Curated Sections</h2>
            {curated.sections.map((section, idx) => (
              <div key={idx} className="text-sm">
                <p className="font-medium text-foreground">{section.title}</p>
                {section.description && <p className="text-muted-foreground">{section.description}</p>}
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-muted-foreground">Loading snippets...</div>
        ) : snippets.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
            No snippets yet. Create your first reference snippet.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {snippets.map((snippet) => (
              <article key={snippet.id} className="rounded-lg border border-border bg-secondary/40 p-4 flex flex-col gap-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{snippet.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {snippet.language}
                      {snippet.topic && ` · ${snippet.topic.title}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => openEdit(snippet)} className="text-xs text-primary hover:underline">Edit</button>
                    <button type="button" onClick={() => handleDelete(snippet.id)} className="text-xs text-destructive hover:underline">Delete</button>
                  </div>
                </div>
                <pre className="text-xs font-mono bg-black/40 rounded-lg p-3 overflow-x-auto max-h-40">{snippet.code}</pre>
                {snippet.notes && <p className="text-xs text-muted-foreground">{snippet.notes}</p>}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
