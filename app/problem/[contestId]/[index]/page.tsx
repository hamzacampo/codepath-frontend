"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Play } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import CodeEditor from "@/components/editor/MonacoEditor";
import { apiService } from "@/lib/api-service";
import { stripDuplicateMathLayers } from "@/lib/problem-html";
import type { CodeforcesProblemDetail } from "@/types";

const DEFAULT_CODE_BY_LANG: Record<
  "cpp" | "java" | "python" | "javascript",
  string
> = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
  // your code here
  return 0;
}
`,
  java: `import java.util.Scanner;

public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    // your code here
    sc.close();
  }
}
`,
  python: `# your code here
`,
  javascript: `// your code here
`,
};

const LANGUAGES = [
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
] as const;

export default function ProblemPageByContest() {
  const params = useParams();
  const contestIdParam = params?.contestId;
  const indexParam = params?.index;
  const contestId =
    typeof contestIdParam === "string"
      ? parseInt(contestIdParam, 10)
      : undefined;
  const index =
    typeof indexParam === "string"
      ? indexParam
      : Array.isArray(indexParam)
        ? indexParam[0]
        : undefined;

  const [problem, setProblem] = useState<CodeforcesProblemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [language, setLanguage] = useState<
    "cpp" | "java" | "python" | "javascript"
  >("cpp");
  const [code, setCode] = useState(DEFAULT_CODE_BY_LANG.cpp);
  const [output, setOutput] = useState("");
  const [showOutput, setShowOutput] = useState(false);

  const [runLoading, setRunLoading] = useState(false);
  const [stdin, setStdin] = useState("");
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleLanguageChange = useCallback(
    (newLang: "cpp" | "java" | "python" | "javascript") => {
      setLanguage(newLang);
      setCode(DEFAULT_CODE_BY_LANG[newLang]);
    },
    [],
  );

  useEffect(() => {
    if (contestId == null || !index || isNaN(contestId)) {
      setLoading(false);
      setError("Invalid problem");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiService
      .getProblem(contestId, index)
      .then((data) => {
        if (!cancelled) setProblem(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err.response?.data?.message ?? "Failed to load problem"
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
  }, [contestId, index]);

  const handleRun = useCallback(async () => {
    setShowOutput(true);
    setOutput("Running...");
    setRunLoading(true);
    try {
      const result = await apiService.runCode({
        code,
        language,
        stdin,
      });
      setOutput(result.output || result.stdout || "(no output)");
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

  const handleSyncSubmission = useCallback(async () => {
    if (!problem) return;
    setSyncMessage(null);
    setSyncLoading(true);
    try {
      const result = await apiService.syncSubmission({
        contestId: problem.contestId,
        index: problem.index,
      });
      setSyncMessage(
        result.solved
          ? `Accepted. Attempts: ${result.attemptCount}`
          : `Recorded. Attempts: ${result.attemptCount}`,
      );
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message ?? "Failed to sync"
          : "Failed to sync";
      setSyncMessage(msg);
    } finally {
      setSyncLoading(false);
    }
  }, [problem]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background text-muted-foreground">
        Loading problem...
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        <div className="text-center">
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

  return (
    <div className="h-screen flex bg-background text-foreground overflow-hidden">
      {/* ── LEFT SIDEBAR ── */}
      <aside className="w-[210px] shrink-0 flex flex-col border-r border-border bg-card overflow-y-auto">
        <div className="p-4 space-y-5">
          <div className="space-y-1.5">
            <p className="text-sm text-foreground">
              <span className="text-muted-foreground">Difficulty: </span>
              <span className="font-semibold">{problem.difficulty}</span>
            </p>
            <p className="text-sm text-foreground">
              <span className="text-muted-foreground">Time Limit: </span>
              <span className="font-semibold">{problem.timeLimit}</span>
            </p>
            <p className="text-sm text-foreground">
              <span className="text-muted-foreground">Memory Limit: </span>
              <span className="font-semibold">{problem.memoryLimit}</span>
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
            <p className="text-sm font-semibold text-foreground mb-2">
              Language
            </p>
            <div className="relative">
              <select
                value={language}
                onChange={(e) =>
                  handleLanguageChange(e.target.value as typeof language)
                }
                className="w-full appearance-none rounded-lg border border-border bg-card px-3 py-2 pr-8 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {LANGUAGES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronRight
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
                aria-hidden
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-foreground mb-2">
              Actions
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleRun}
                disabled={runLoading}
                className="w-full rounded-lg bg-primary text-primary-foreground font-semibold py-2 px-3 text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {runLoading ? "Running..." : "Run Code"}
              </button>
              <a
                href={problem.problemUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full rounded-lg bg-primary text-primary-foreground font-semibold py-2 px-3 text-sm hover:bg-primary/90 transition-colors text-center"
              >
                Submit on Codeforces
              </a>
              <button
                type="button"
                onClick={handleSyncSubmission}
                disabled={syncLoading}
                className="w-full rounded-lg border border-primary text-primary font-semibold py-2 px-3 text-sm hover:bg-primary/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {syncLoading ? "Syncing..." : "Sync from Codeforces"}
              </button>
              {syncMessage && (
                <p className="text-xs text-muted-foreground">
                  {syncMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* ── MIDDLE: PROBLEM STATEMENT ── */}
      <main className="flex-1 min-w-0 overflow-y-auto border-r border-border bg-card">
        <div className="max-w-[640px] px-6 py-6 space-y-5">
          <h1 className="text-xl font-bold text-foreground">
            {problem.title}
          </h1>

          <div
            className="problem-statement-content text-sm text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{
              __html:
                problem.raw?.descriptionHtml != null
                  ? stripDuplicateMathLayers(problem.raw.descriptionHtml)
                  : problem.description.replace(/\n/g, "<br/>"),
            }}
          />

          <div>
            <h2 className="text-base font-bold text-foreground mb-1">Input</h2>
            <div
              className="problem-statement-content text-sm text-muted-foreground leading-relaxed"
              dangerouslySetInnerHTML={{
                __html:
                  problem.raw?.inputSpecHtml != null
                    ? stripDuplicateMathLayers(problem.raw.inputSpecHtml)
                    : problem.inputSpecification.replace(/\n/g, "<br/>"),
              }}
            />
          </div>

          <div>
            <h2 className="text-base font-bold text-foreground mb-1">
              Output
            </h2>
            <div
              className="problem-statement-content text-sm text-muted-foreground leading-relaxed"
              dangerouslySetInnerHTML={{
                __html:
                  problem.raw?.outputSpecHtml != null
                    ? stripDuplicateMathLayers(problem.raw.outputSpecHtml)
                    : problem.outputSpecification.replace(/\n/g, "<br/>"),
              }}
            />
          </div>

          {problem.sampleTests && problem.sampleTests.length > 0 && (
            <div>
              <h2 className="text-base font-bold text-foreground mb-2">
                Example
              </h2>
              <div className="space-y-3">
                {problem.sampleTests.map((sample, i) => (
                  <div key={i} className="space-y-2">
                    <h3 className="text-sm font-bold text-foreground">
                      Input
                      {problem.sampleTests.length > 1 ? ` ${i + 1}` : ""}
                    </h3>
                    <pre className="text-sm font-mono text-muted-foreground leading-relaxed whitespace-pre-wrap rounded-lg border border-border bg-secondary/50 p-3">
                      {sample.input}
                    </pre>
                    <h3 className="text-sm font-bold text-foreground">
                      Output
                      {problem.sampleTests.length > 1 ? ` ${i + 1}` : ""}
                    </h3>
                    <pre className="text-sm font-mono text-muted-foreground leading-relaxed whitespace-pre-wrap rounded-lg border border-border bg-secondary/50 p-3">
                      {sample.output}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {problem.note && (
            <div>
              <h2 className="text-base font-bold text-foreground mb-1">Note</h2>
              <div
                className="problem-statement-content text-sm text-muted-foreground leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html:
                    problem.raw?.noteHtml != null
                      ? stripDuplicateMathLayers(problem.raw.noteHtml)
                      : problem.note.replace(/\n/g, "<br/>"),
                }}
              />
            </div>
          )}
        </div>
      </main>

      {/* ── RIGHT: CODE EDITOR + INPUT + OUTPUT ── */}
      <section className="w-[42%] shrink-0 flex flex-col min-w-0 bg-card">
        <div className="flex items-center justify-between border-b border-border bg-card px-3 py-1.5">
          <div className="flex items-center gap-2">
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
          </div>
          <button
            type="button"
            disabled={runLoading}
            className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-primary hover:text-primary/90 hover:bg-secondary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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
            readOnly={false}
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
            placeholder="Type input for your program (e.g. 42)"
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
            Output
            <ChevronDown
              className={`w-3 h-3 text-muted-foreground transition-transform ${showOutput ? "" : "rotate-180"}`}
            />
          </button>
          {showOutput && (
            <div className="h-[160px] shrink-0 overflow-auto px-3 py-2 bg-card">
              <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                {output || "Run your code to see output here."}
              </pre>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
