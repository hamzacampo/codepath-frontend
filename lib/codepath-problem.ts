/**
 * Minimal formatting for CodePath problem statements (markdown-lite).
 */
export function formatProblemText(text: string): string {
  if (!text) return "";
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
}

export const VERDICT_LABELS: Record<string, string> = {
  AC: "Accepted",
  WA: "Wrong Answer",
  TLE: "Time Limit Exceeded",
  RE: "Runtime Error",
  CE: "Compilation Error",
  JE: "Judge Error",
};

export const VERDICT_COLORS: Record<string, string> = {
  AC: "text-green-400 border-green-500/40 bg-green-500/10",
  WA: "text-amber-400 border-amber-500/40 bg-amber-500/10",
  TLE: "text-orange-400 border-orange-500/40 bg-orange-500/10",
  RE: "text-red-400 border-red-500/40 bg-red-500/10",
  CE: "text-red-400 border-red-500/40 bg-red-500/10",
  JE: "text-muted-foreground border-border bg-muted/30",
};

export const DEFAULT_CODE_BY_LANG: Record<
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

export const LANGUAGE_OPTIONS = [
  { value: "cpp" as const, label: "C++" },
  { value: "java" as const, label: "Java" },
  { value: "python" as const, label: "Python" },
  { value: "javascript" as const, label: "JavaScript" },
];
