"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Play } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import CodeEditor from "@/components/editor/MonacoEditor";
import { apiService } from "@/lib/api-service";
import { useAuth } from "@/hooks/use-auth";
import {
  DEFAULT_CODE_BY_LANG,
  formatProblemText,
  LANGUAGE_OPTIONS,
  VERDICT_COLORS,
  VERDICT_LABELS,
} from "@/lib/codepath-problem";
import { ProblemSourceBadge } from "@/components/problemset/ProblemSourceBadge";
import { Select } from "@/components/ui/Select";
import type {
  CodePathProblemDetail,
  CodePathSubmissionSummary,
  CodePathSubmitResponse,
  ContestSubmitResponse,
  SubmissionVerdict,
} from "@/types";

export default function CodePathProblemPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const problemId = typeof params?.id === "string" ? params.id : "";
  const contestId = searchParams.get("contestId");
  const contestProblemId = searchParams.get("contestProblemId");
  const inContest = Boolean(contestId && contestProblemId);
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [contestTitle, setContestTitle] = useState<string | null>(null);

  const [problem, setProblem] = useState<CodePathProblemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [language, setLanguage] = useState<
    "cpp" | "java" | "python" | "javascript"
  >("cpp");
  const [code, setCode] = useState(DEFAULT_CODE_BY_LANG.cpp);
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("");
  const [showOutput, setShowOutput] = useState(true);
  const [runLoading, setRunLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [verdict, setVerdict] = useState<CodePathSubmitResponse | ContestSubmitResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [history, setHistory] = useState<CodePathSubmissionSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleLanguageChange = useCallback(
    (newLang: "cpp" | "java" | "python" | "javascript") => {
      setLanguage(newLang);
      setCode(DEFAULT_CODE_BY_LANG[newLang]);
    },
    [],
  );

  const loadHistory = useCallback(async () => {
    if (!problemId) return;
    setHistoryLoading(true);
    try {
      const res = await apiService.getMyCodePathSubmissions(problemId);
      setHistory(res.submissions ?? []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [problemId]);

  useEffect(() => {
    if (!inContest || !contestId) return;
    apiService
      .getContest(contestId)
      .then((c) => setContestTitle(c.title))
      .catch(() => setContestTitle(null));
  }, [inContest, contestId]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!problemId || !isAuthenticated) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiService
      .getCodePathProblem(problemId)
      .then((data) => {
        if (!cancelled) setProblem(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err.response?.data?.message ?? "Failed to load problem",
          );
          setProblem(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [problemId, isAuthenticated]);

  useEffect(() => {
    if (problem && isAuthenticated) {
      loadHistory();
    }
  }, [problem, isAuthenticated, loadHistory]);

  const sampleCases = problem?.testCases.filter((tc) => tc.isSample) ?? [];

  const handleRun = useCallback(async () => {
    setShowOutput(true);
    setOutput("Running...");
    setRunLoading(true);
    try {
      const result = await apiService.runCode({ code, language, stdin });
      const text = result.stderr
        ? `${result.stdout || ""}\n${result.stderr}`.trim()
        : result.output || result.stdout || "(no output)";
      setOutput(text);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message ?? "Failed to run code"
          : "Failed to run code";
      setOutput(`Error: ${message}`);
    } finally {
      setRunLoading(false);
    }
  }, [code, language, stdin]);

  const handleSubmit = useCallback(async () => {
    if (!problemId) return;
    setSubmitLoading(true);
    setSubmitError(null);
    setVerdict(null);
    try {
      if (inContest && contestId && contestProblemId) {
        const result = await apiService.submitContestSolution(contestId, {
          contestProblemId,
          code,
          language,
        });
        setVerdict(result);
      } else {
        const result = await apiService.submitCodePathProblem(problemId, {
          code,
          language,
        });
        setVerdict(result);
      }
      await loadHistory();
      setShowHistory(true);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message ?? "Submission failed"
          : "Submission failed";
      setSubmitError(message);
    } finally {
      setSubmitLoading(false);
    }
  }, [problemId, code, language, loadHistory, inContest, contestId, contestProblemId]);

  const fillSampleInput = (input: string) => {
    setStdin(input);
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="h-full min-h-0 flex flex-1 items-center justify-center bg-background text-muted-foreground">
        Checking authentication...
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full min-h-0 flex flex-1 items-center justify-center bg-background text-muted-foreground">
        Loading problem...
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="h-full min-h-0 flex flex-1 items-center justify-center bg-background text-muted-foreground">
        <div className="text-center px-4">
          <p className="text-lg">{error ?? "Problem not found."}</p>
          <Link
            href="/dashboard/problemset"
            className="text-primary hover:underline mt-2 inline-block"
          >
            Back to problemset
          </Link>
        </div>
      </div>
    );
  }

  const verdictClass = (v: SubmissionVerdict) =>
    VERDICT_COLORS[v] ?? VERDICT_COLORS.JE;

  const verdictSummary = verdict
    ? "judge" in verdict
      ? {
          verdict: verdict.judge.verdict,
          passedCount: verdict.judge.passedCount,
          totalCount: verdict.judge.totalCount,
          runtimeMs: verdict.judge.runtimeMs,
          message: verdict.judge.message,
          sampleCaseResults: verdict.judge.sampleCaseResults ?? [],
        }
      : {
          verdict: verdict.submission.verdict,
          passedCount: verdict.submission.passedCount,
          totalCount: verdict.submission.totalCount,
          runtimeMs: verdict.submission.runtimeMs,
          message: verdict.submission.message,
          sampleCaseResults: verdict.sampleCaseResults,
        }
    : null;

  return (
    <div className="h-full min-h-0 flex flex-1 w-full bg-background text-foreground overflow-hidden">
      {/* LEFT SIDEBAR */}
      <aside className="w-[210px] shrink-0 flex flex-col border-r border-border bg-card overflow-y-auto">
        <div className="p-4 space-y-5">
          {inContest && contestId ? (
            <Link
              href={`/dashboard/contests/${contestId}`}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              ← Back to contest
            </Link>
          ) : (
            <Link
              href="/dashboard/problemset"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              ← Problemset
            </Link>
          )}

          {inContest && contestTitle && (
            <div className="rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-2">
              <p className="text-[10px] uppercase tracking-wide text-primary/80">Contest mode</p>
              <p className="text-xs font-medium text-foreground line-clamp-2">{contestTitle}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <p className="text-sm text-foreground">
              <span className="text-muted-foreground">Rating: </span>
              <span className="font-semibold">{problem.rating}</span>
            </p>
            <p className="text-sm text-foreground">
              <span className="text-muted-foreground">Time: </span>
              <span className="font-semibold">{problem.timeLimitMs} ms</span>
            </p>
            <p className="text-sm text-foreground">
              <span className="text-muted-foreground">Memory: </span>
              <span className="font-semibold">{problem.memoryLimitMb} MB</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {problem.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border border-primary px-2.5 py-0.5 text-[11px] font-medium text-accent"
              >
                {tag}
              </span>
            ))}
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Language</p>
            <Select
              value={language}
              onChange={(e) =>
                handleLanguageChange(e.target.value as typeof language)
              }
              options={LANGUAGE_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label,
              }))}
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Actions</p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleRun}
                disabled={runLoading}
                className="w-full rounded-lg bg-primary text-primary-foreground font-semibold py-2 px-3 text-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {runLoading ? "Running..." : "Run Code"}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitLoading}
                className="w-full rounded-lg border border-primary text-primary font-semibold py-2 px-3 text-sm hover:bg-primary/10 transition-colors disabled:opacity-60"
              >
                {submitLoading ? "Judging..." : inContest ? "Submit to Contest" : "Submit"}
              </button>
            </div>
          </div>

          {submitError && (
            <p className="text-xs text-destructive">{submitError}</p>
          )}

          {verdictSummary && (
            <div className="rounded-lg border border-border p-3 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Last verdict
              </p>
              <span
                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${verdictClass(verdictSummary.verdict)}`}
              >
                {VERDICT_LABELS[verdictSummary.verdict] ?? verdictSummary.verdict}
              </span>
              <p className="text-xs text-muted-foreground">
                {verdictSummary.passedCount}/{verdictSummary.totalCount} cases
                {verdictSummary.runtimeMs != null &&
                  ` · ${verdictSummary.runtimeMs} ms`}
              </p>
              {verdictSummary.message && (
                <p className="text-xs text-muted-foreground">
                  {verdictSummary.message}
                </p>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* STATEMENT */}
      <main className="flex-1 min-w-0 overflow-y-auto border-r border-border bg-card">
        <div className="max-w-[640px] px-6 py-6 space-y-5">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-foreground">{problem.title}</h1>
            <ProblemSourceBadge source="codepath" />
          </div>

          <div
            className="text-sm text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: formatProblemText(problem.statement),
            }}
          />

          <div>
            <h2 className="text-base font-bold text-foreground mb-1">Input</h2>
            <div
              className="text-sm text-muted-foreground leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: formatProblemText(problem.inputDescription),
              }}
            />
          </div>

          <div>
            <h2 className="text-base font-bold text-foreground mb-1">Output</h2>
            <div
              className="text-sm text-muted-foreground leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: formatProblemText(problem.outputDescription),
              }}
            />
          </div>

          {problem.constraints && (
            <div>
              <h2 className="text-base font-bold text-foreground mb-1">Constraints</h2>
              <div
                className="text-sm text-muted-foreground leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: formatProblemText(problem.constraints),
                }}
              />
            </div>
          )}

          {sampleCases.length > 0 && (
            <div>
              <h2 className="text-base font-bold text-foreground mb-2">Examples</h2>
              <div className="space-y-4">
                {sampleCases.map((sample, i) => (
                  <div key={sample.id} className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-foreground">
                        Example {i + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => fillSampleInput(sample.input)}
                        className="text-xs text-primary hover:underline"
                      >
                        Use as stdin
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">Input</p>
                    <pre className="text-sm font-mono text-muted-foreground whitespace-pre-wrap rounded-lg border border-border bg-secondary/50 p-3">
                      {sample.input}
                    </pre>
                    {sample.expectedOutput != null && (
                      <>
                        <p className="text-xs text-muted-foreground font-medium">Output</p>
                        <pre className="text-sm font-mono text-muted-foreground whitespace-pre-wrap rounded-lg border border-border bg-secondary/50 p-3">
                          {sample.expectedOutput}
                        </pre>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <button
              type="button"
              onClick={() => setShowHistory((s) => !s)}
              className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary"
            >
              Submission history ({history.length})
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showHistory ? "" : "-rotate-90"}`}
              />
            </button>
            {showHistory && (
              <div className="mt-3 space-y-2">
                {historyLoading && (
                  <p className="text-sm text-muted-foreground">Loading history...</p>
                )}
                {!historyLoading && history.length === 0 && (
                  <p className="text-sm text-muted-foreground">No submissions yet.</p>
                )}
                {!historyLoading &&
                  history.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2"
                    >
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${verdictClass(sub.verdict)}`}
                      >
                        {VERDICT_LABELS[sub.verdict] ?? sub.verdict}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {sub.passedCount}/{sub.totalCount}
                        {sub.runtimeMs != null && ` · ${sub.runtimeMs} ms`}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(sub.createdAt).toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground uppercase">
                        {sub.language}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* EDITOR */}
      <section className="w-[42%] shrink-0 flex flex-col min-w-0 bg-card">
        <div className="flex items-center justify-between border-b border-border bg-card px-3 py-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            main.
            {language === "cpp"
              ? "cpp"
              : language === "java"
                ? "java"
                : language === "python"
                  ? "py"
                  : "js"}
          </span>
          <button
            type="button"
            disabled={runLoading}
            className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-primary hover:bg-secondary transition-colors disabled:opacity-60"
            aria-label="Run code"
            onClick={handleRun}
          >
            <Play className="w-3 h-3" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <CodeEditor
            value={code}
            onChange={(v) => setCode(v ?? "")}
            language={language}
            height="100%"
          />
        </div>

        <div className="shrink-0 flex flex-col border-t border-border">
          <div className="px-3 py-1.5 border-b border-border bg-card">
            <span className="text-xs font-semibold text-muted-foreground">
              Custom input (stdin)
            </span>
          </div>
          <textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            placeholder="Type input for Run (not used on Submit)"
            className="min-h-[72px] max-h-[120px] w-full resize-y px-3 py-2 text-xs font-mono text-foreground bg-secondary/50 border-0 border-b border-border focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
            spellCheck={false}
            rows={3}
          />
        </div>

        <div className="flex flex-col border-t border-border shrink-0">
          <button
            type="button"
            onClick={() => setShowOutput((s) => !s)}
            className="flex items-center gap-2 w-full px-3 py-2 text-left text-xs font-semibold text-accent bg-card hover:bg-secondary transition-colors"
          >
            Run output
            <ChevronDown
              className={`w-3 h-3 text-muted-foreground transition-transform ${showOutput ? "" : "rotate-180"}`}
            />
          </button>
          {showOutput && (
            <div className="h-[120px] shrink-0 overflow-auto px-3 py-2 bg-card">
              <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                {output || "Run your code to see output here."}
              </pre>
            </div>
          )}
        </div>

        {verdictSummary && verdictSummary.sampleCaseResults.length > 0 && (
          <div className="flex flex-col border-t border-border shrink-0 max-h-[180px] overflow-y-auto">
            <div className="px-3 py-2 text-xs font-semibold text-accent bg-card">
              Sample case results (submit)
            </div>
            {verdictSummary.sampleCaseResults.map((c) => (
              <div
                key={c.index}
                className="px-3 py-2 border-t border-border text-xs space-y-1"
              >
                <span
                  className={`inline-flex rounded border px-1.5 py-0.5 font-semibold ${verdictClass(c.verdict)}`}
                >
                  Case {c.index}: {VERDICT_LABELS[c.verdict] ?? c.verdict}
                </span>
                {c.stdout && (
                  <pre className="font-mono text-muted-foreground whitespace-pre-wrap">
                    {c.stdout}
                  </pre>
                )}
                {c.stderr && (
                  <pre className="font-mono text-destructive whitespace-pre-wrap">
                    {c.stderr}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
