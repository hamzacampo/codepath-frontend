export interface Problem {
  id: string;
  title: string;
  tags: string[];
  rating: number;
  index: string;
  contestId: number;
  difficulty: number;
  timeLimit: string;
  memoryLimit: string;
  statement: string;
  inputFormat: string;
  outputFormat: string;
  exampleInput: string;
  exampleOutput: string;
}

const baseProblems: (Omit<Problem, "rating" | "contestId"> & { rating: number; contestId: number })[] = [
  {
    id: "2162C",
    title: "Beautiful Tree",
    tags: ["Constructive Algorithms", "Math", "Probabilities", "Trees"],
    rating: 2500,
    index: "C",
    contestId: 2162,
    difficulty: 2500,
    timeLimit: "2 sec",
    memoryLimit: "256 MB",
    statement: `You are given a tree with n nodes. Each node has a value. Find the number of beautiful subtrees.

A subtree is beautiful if the XOR of all node values in the subtree equals zero.`,
    inputFormat: "First line: n. Next n-1 lines: edges. Next line: n integers (values).",
    outputFormat: "Single integer: number of beautiful subtrees.",
    exampleInput: "3\n1 2\n2 3\n1 2 3",
    exampleOutput: "1",
  },
  {
    id: "1790D",
    title: "Green Subsequence",
    tags: ["Greedy", "Sorting", "Implementation"],
    rating: 1700,
    index: "D",
    contestId: 1790,
    difficulty: 1700,
    timeLimit: "1 sec",
    memoryLimit: "256 MB",
    statement: `Given an array, find the longest subsequence such that each element is at least the previous one.`,
    inputFormat: "First line: n. Second line: n integers.",
    outputFormat: "Length of the longest non-decreasing subsequence.",
    exampleInput: "5\n1 3 2 4 5",
    exampleOutput: "4",
  },
  {
    id: "1900E",
    title: "Graph Shadows",
    tags: ["Graphs", "DFS", "Trees"],
    rating: 2100,
    index: "E",
    contestId: 1900,
    difficulty: 2100,
    timeLimit: "2 sec",
    memoryLimit: "512 MB",
    statement: `Given a tree, for each node compute the sum of distances to all other nodes.`,
    inputFormat: "First line: n. Next n-1 lines: edges (u, v).",
    outputFormat: "n space-separated integers.",
    exampleInput: "3\n1 2\n2 3",
    exampleOutput: "3 2 3",
  },
  {
    id: "1633B",
    title: "Binary Beauty",
    tags: ["Bitmasks", "Greedy"],
    rating: 1400,
    index: "B",
    contestId: 1633,
    difficulty: 1400,
    timeLimit: "1 sec",
    memoryLimit: "256 MB",
    statement: `You are given a binary string. In one move you can flip any bit. Find the minimum moves so that no two adjacent bits are equal.`,
    inputFormat: "Single line: binary string.",
    outputFormat: "Minimum number of moves.",
    exampleInput: "1010",
    exampleOutput: "0",
  },
];

const TOTAL_PROBLEMS = 120;

function buildProblems(): Problem[] {
  return Array.from({ length: TOTAL_PROBLEMS }).map((_, idx) => {
    const base = baseProblems[idx % baseProblems.length];
    return {
      ...base,
      id: `${base.id}-${idx + 1}`,
      rating: base.rating + ((idx % 3) - 1) * 50,
      contestId: base.contestId + Math.floor(idx / baseProblems.length),
    };
  });
}

export const problemsList: Problem[] = buildProblems();

export function getProblemById(id: string): Problem | null {
  return problemsList.find((p) => p.id === id) ?? null;
}

export const uniqueTagsList = Array.from(
  new Set(baseProblems.flatMap((p) => p.tags))
).sort();

export function getDefaultProblem(): Problem {
  return problemsList[0];
}
