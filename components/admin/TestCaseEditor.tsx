"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import type { ProblemTestCase } from "@/types";

const fieldClass =
  "w-full rounded-lg border border-border bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background font-mono text-xs";

interface TestCaseEditorProps {
  testCases: ProblemTestCase[];
  onCreate: (data: {
    input: string;
    expectedOutput: string;
    isSample: boolean;
    sortOrder: number;
  }) => Promise<void>;
  onUpdate: (
    caseId: string,
    data: {
      input?: string;
      expectedOutput?: string;
      isSample?: boolean;
      sortOrder?: number;
    },
  ) => Promise<void>;
  onDelete: (caseId: string) => Promise<void>;
}

export function TestCaseEditor({
  testCases,
  onCreate,
  onUpdate,
  onDelete,
}: TestCaseEditorProps) {
  const [input, setInput] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [isSample, setIsSample] = useState(true);
  const [sortOrder, setSortOrder] = useState(testCases.length + 1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const resetForm = () => {
    setInput("");
    setExpectedOutput("");
    setIsSample(true);
    setSortOrder(testCases.length + 1);
    setEditingId(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !expectedOutput.trim()) {
      setError("Input and expected output are required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await onUpdate(editingId, {
          input,
          expectedOutput,
          isSample,
          sortOrder,
        });
      } else {
        await onCreate({
          input,
          expectedOutput,
          isSample,
          sortOrder,
        });
      }
      resetForm();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : undefined;
      setError(message ?? "Failed to save test case");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (tc: ProblemTestCase) => {
    setEditingId(tc.id);
    setInput(tc.input);
    setExpectedOutput(tc.expectedOutput ?? "");
    setIsSample(tc.isSample);
    setSortOrder(tc.sortOrder);
    setError(null);
  };

  const handleDelete = async (caseId: string) => {
    if (!window.confirm("Delete this test case?")) return;
    setDeletingId(caseId);
    setError(null);
    try {
      await onDelete(caseId);
      if (editingId === caseId) resetForm();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : undefined;
      setError(message ?? "Failed to delete test case");
    } finally {
      setDeletingId(null);
    }
  };

  const sortedCases = [...testCases].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-border bg-card p-4 sm:p-6 flex flex-col gap-4"
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-foreground">
            {editingId ? "Edit Test Case" : "Add Test Case"}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel edit
            </button>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="tc-input">Input *</Label>
            <Textarea
              id="tc-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className={`${fieldClass} min-h-[120px] resize-y`}
              placeholder="1 2"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="tc-output">Expected Output *</Label>
            <Textarea
              id="tc-output"
              value={expectedOutput}
              onChange={(e) => setExpectedOutput(e.target.value)}
              className={`${fieldClass} min-h-[120px] resize-y`}
              placeholder="3"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="inline-flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={isSample}
              onChange={(e) => setIsSample(e.target.checked)}
              className="rounded border-border"
            />
            Sample case (visible to mentees)
          </label>
          <div className="flex items-center gap-2">
            <Label htmlFor="tc-sort" className="text-sm">Sort order</Label>
            <Input
              id="tc-sort"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
              className={`${fieldClass} w-24`}
            />
          </div>
          <Button type="submit" disabled={saving} size="sm">
            {saving ? "Saving..." : editingId ? "Update Case" : "Add Case"}
          </Button>
        </div>
      </form>

      <div className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-foreground">
          Test Cases ({sortedCases.length})
        </h3>

        {sortedCases.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-secondary/30 px-4 py-8 text-center">
            <Icon
              icon="mdi:flask-empty-outline"
              className="w-10 h-10 mx-auto text-muted-foreground mb-2"
              aria-hidden
            />
            <p className="text-sm text-muted-foreground">
              No test cases yet. Add at least one before publishing.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sortedCases.map((tc) => (
              <article
                key={tc.id}
                className="rounded-lg border border-border bg-secondary/40 p-4 flex flex-col gap-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Order {tc.sortOrder}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                        tc.isSample
                          ? "bg-primary/20 text-primary border border-primary/30"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {tc.isSample ? "Sample" : "Hidden"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(tc)}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      <Icon icon="mdi:pencil-outline" className="w-3.5 h-3.5" aria-hidden />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(tc.id)}
                      disabled={deletingId === tc.id}
                      className="inline-flex items-center gap-1 rounded-lg border border-destructive/40 px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                    >
                      <Icon icon="mdi:delete-outline" className="w-3.5 h-3.5" aria-hidden />
                      {deletingId === tc.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <p className="text-muted-foreground mb-1">Input</p>
                    <pre className="whitespace-pre-wrap break-all rounded bg-black/40 p-2 border border-border">
                      {tc.input}
                    </pre>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Expected Output</p>
                    <pre className="whitespace-pre-wrap break-all rounded bg-black/40 p-2 border border-border">
                      {tc.expectedOutput ?? "—"}
                    </pre>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
