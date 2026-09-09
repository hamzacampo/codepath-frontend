"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { apiService } from "@/lib/api-service";
import { getApiErrorMessage } from "@/lib/errors";
import { DateTimeInput } from "@/components/ui/DateTimeInput";
import { Select } from "@/components/ui/Select";
import type { CodePathProblemListItem, Topic } from "@/types";

type CreateMode = "ai" | "manual";

function minScheduleDateTimeLocal(): string {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

const DEFAULT_RULES = [
  "Virtual Contests exactly mimic ACM-ICPC conditions.",
  "Code execution is compiled and run against strict test cases.",
  "Any wrong attempt inflicts a 20-minute penalty.",
  "Plagiarism check runs continuously in the background.",
];

export default function AdminCreateContestPage() {
  const router = useRouter();
  const [mode, setMode] = useState<CreateMode>("manual");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [scheduledStartTime, setScheduledStartTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(300);
  const [freezeEnabled, setFreezeEnabled] = useState(true);
  const [freezeMinutes, setFreezeMinutes] = useState(10);
  const [rulesOfEngagement, setRulesOfEngagement] = useState<string[]>(DEFAULT_RULES);
  const [targetSkillTier, setTargetSkillTier] = useState("Intermediate");
  const [totalProblems, setTotalProblems] = useState(6);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>([]);
  const [tagFilter, setTagFilter] = useState("");
  const [publishedProblems, setPublishedProblems] = useState<CodePathProblemListItem[]>([]);
  const [selectedProblemIds, setSelectedProblemIds] = useState<string[]>([]);
  const [loadingProblems, setLoadingProblems] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiService.getTopics().then(setTopics).catch(() => setTopics([]));
  }, []);

  useEffect(() => {
    setLoadingProblems(true);
    apiService
      .listAllCodePathProblemsAdmin({ status: "PUBLISHED", limit: 100 })
      .then((res) => setPublishedProblems(res.items ?? []))
      .catch(() => setPublishedProblems([]))
      .finally(() => setLoadingProblems(false));
  }, []);

  const filteredProblems = useMemo(() => {
    const q = tagFilter.trim().toLowerCase();
    if (!q) return publishedProblems;
    return publishedProblems.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [publishedProblems, tagFilter]);

  const toggleProblem = (id: string) => {
    setSelectedProblemIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const toggleTopic = (id: number) => {
    setSelectedTopicIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const updateRule = (index: number, value: string) => {
    setRulesOfEngagement((prev) => prev.map((rule, i) => (i === index ? value : rule)));
  };

  const addRule = () => setRulesOfEngagement((prev) => [...prev, ""]);
  const removeRule = (index: number) => {
    setRulesOfEngagement((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (scheduledStartTime && new Date(scheduledStartTime).getTime() < Date.now()) {
      setError("Scheduled start time must be in the future");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const selectedTopics = topics
        .filter((t) => selectedTopicIds.includes(t.id))
        .map((t) => ({ id: t.id, title: t.title }));

      const payload =
        mode === "ai"
          ? {
              title,
              description,
              difficulty,
              scheduledStartTime: scheduledStartTime || null,
              durationMinutes,
              freezeEnabled,
              freezeMinutes: freezeEnabled ? freezeMinutes : null,
              rulesOfEngagement: rulesOfEngagement.filter((r) => r.trim().length > 0),
              selection: {
                targetSkillTier,
                totalProblems,
                topics: selectedTopics,
              },
            }
          : {
              title,
              description,
              difficulty,
              scheduledStartTime: scheduledStartTime || null,
              durationMinutes,
              freezeEnabled,
              freezeMinutes: freezeEnabled ? freezeMinutes : null,
              rulesOfEngagement: rulesOfEngagement.filter((r) => r.trim().length > 0),
              problems: selectedProblemIds.map((codePathProblemId) => ({ codePathProblemId })),
            };

      const result = await apiService.createContest(payload);
      router.push(`/dashboard/contests/${result.contestId}`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to create contest"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="flex flex-col gap-6 max-w-3xl mx-auto">
        <div>
          <Link href="/admin/contests" className="text-sm text-primary hover:underline inline-flex items-center gap-1 mb-2">
            <Icon icon="mdi:arrow-left" className="w-4 h-4" aria-hidden />
            Back to contests
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Create Contest</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Contests use published CodePath problems and the CodePath judge.
          </p>
        </div>

        <div className="flex rounded-lg border border-border overflow-hidden">
          {(["manual", "ai"] as CreateMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {m === "ai" ? "AI Selection" : "Pick Problems"}
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Title</span>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Difficulty</span>
              <Select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as "EASY" | "MEDIUM" | "HARD")}
                options={[
                  { value: "EASY", label: "Easy" },
                  { value: "MEDIUM", label: "Medium" },
                  { value: "HARD", label: "Hard" },
                ]}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Scheduled start</span>
              <DateTimeInput
                required
                value={scheduledStartTime}
                min={minScheduleDateTimeLocal()}
                onChange={(e) => setScheduledStartTime(e.target.value)}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Duration (minutes)</span>
              <input
                type="number"
                min={1}
                max={600}
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Freeze (minutes)</span>
              <input
                type="number"
                min={1}
                disabled={!freezeEnabled}
                value={freezeMinutes}
                onChange={(e) => setFreezeMinutes(Number(e.target.value))}
                className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm disabled:opacity-50"
              />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={freezeEnabled}
              onChange={(e) => setFreezeEnabled(e.target.checked)}
            />
            Enable scoreboard freeze
          </label>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Rules of Engagement</span>
              <button
                type="button"
                onClick={addRule}
                className="text-xs text-primary hover:underline"
              >
                Add rule
              </button>
            </div>
            {rulesOfEngagement.map((rule, index) => (
              <div key={index} className="flex gap-2">
                <input
                  value={rule}
                  onChange={(e) => updateRule(index, e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeRule(index)}
                  className="rounded-lg border border-border px-3 text-sm text-muted-foreground hover:text-foreground"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {mode === "ai" ? (
            <>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Target skill tier</span>
                <Select
                  value={targetSkillTier}
                  onChange={(e) => setTargetSkillTier(e.target.value)}
                  options={[
                    { value: "Beginner", label: "Beginner" },
                    { value: "Intermediate", label: "Intermediate" },
                    { value: "Advanced", label: "Advanced" },
                  ]}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Total problems</span>
                <input
                  type="number"
                  min={1}
                  max={26}
                  value={totalProblems}
                  onChange={(e) => setTotalProblems(Number(e.target.value))}
                  className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
                />
              </label>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">Focus topics (optional)</span>
                <div className="flex flex-wrap gap-2">
                  {topics.map((topic) => {
                    const selected = selectedTopicIds.includes(topic.id);
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => toggleTopic(topic.id)}
                        className={`rounded-full border px-3 py-1 text-xs ${
                          selected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {topic.title}
                      </button>
                    );
                  })}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                AI selection uses the FastAPI service to pick problems based on skill tier, topics,
                and your performance profile, then maps them to CodePath problems.
              </p>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">
                  CodePath problems ({selectedProblemIds.length} selected)
                </span>
                <input
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  placeholder="Filter by title or tag..."
                  className="rounded-lg border border-border bg-transparent px-3 py-1.5 text-xs w-48"
                />
              </div>
              {loadingProblems ? (
                <p className="text-sm text-muted-foreground">Loading published problems...</p>
              ) : filteredProblems.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No published CodePath problems found. Publish problems in the admin problem set first.
                </p>
              ) : (
                <div className="max-h-72 overflow-y-auto rounded-lg border border-border divide-y divide-border">
                  {filteredProblems.map((problem) => {
                    const selected = selectedProblemIds.includes(problem.id);
                    return (
                      <button
                        key={problem.id}
                        type="button"
                        onClick={() => toggleProblem(problem.id)}
                        className={`w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-muted/50 ${
                          selected ? "bg-primary/10" : ""
                        }`}
                      >
                        <span
                          className={`h-4 w-4 rounded border shrink-0 ${
                            selected ? "bg-primary border-primary" : "border-border"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{problem.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Rating {problem.rating} · {problem.tags.slice(0, 3).join(", ")}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={
              loading ||
              !scheduledStartTime ||
              (mode === "manual" && selectedProblemIds.length === 0)
            }
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Draft Contest"}
          </button>
          <p className="text-xs text-muted-foreground">
            New contests are created as drafts. Publish them from the contest detail page when ready.
          </p>
        </form>
      </div>
    </div>
  );
}
