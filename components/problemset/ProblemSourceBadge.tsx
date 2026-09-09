export type ProblemSource = "codepath" | "codeforces";

const STYLES: Record<ProblemSource, string> = {
  codepath:
    "border-primary/30 bg-primary/10 text-primary",
  codeforces:
    "border-amber-500/30 bg-amber-500/10 text-amber-400",
};

const LABELS: Record<ProblemSource, string> = {
  codepath: "CodePath",
  codeforces: "External (Codeforces)",
};

export function ProblemSourceBadge({ source }: { source: ProblemSource }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide shrink-0 ${STYLES[source]}`}
    >
      {LABELS[source]}
    </span>
  );
}
