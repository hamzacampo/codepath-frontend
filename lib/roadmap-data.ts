import type {
  MyRoadmapModulesWithProgress,
  RoadmapWithModules,
} from "@/types";

export type TopicStatus = "completed" | "in-progress" | "locked";

export interface TopicNode {
  id: string;
  name: string;
  status: TopicStatus;
  progress?: number;
  icon?: string;
  proficiency?: string;
  accuracy?: number;
  performance?: {
    roadmapProblems: number;
    generalProblems: number;
    wrongSubmissions: number;
    acceptedSolutions: number;
  };
  problems?: { id: string; solved: boolean }[];
  resources?: { title: string; url: string }[];
  children?: TopicNode[];
}

export const roadmapTree: TopicNode = {
  id: "start",
  name: "Start Journey",
  status: "completed",
  icon: "mdi:rocket-launch",
  children: [
    {
      id: "brute-force",
      name: "Brute Force",
      status: "completed",
      progress: 100,
      icon: "mdi:arm-flex",
      proficiency: "Advanced",
      accuracy: 92,
      performance: {
        roadmapProblems: 45,
        generalProblems: 30,
        wrongSubmissions: 8,
        acceptedSolutions: 67,
      },
      problems: [
        { id: "1200A", solved: true },
        { id: "1300B", solved: true },
        { id: "1400C", solved: true },
        { id: "1500D", solved: true },
        { id: "1600E", solved: true },
      ],
      resources: [
        { title: "Brute Force Guide", url: "#" },
        { title: "Common Patterns", url: "#" },
        { title: "Practice Set", url: "#" },
      ],
    },
    {
      id: "data-structures",
      name: "Data Structures",
      status: "in-progress",
      progress: 75,
      icon: "mdi:database",
      proficiency: "Moderate",
      accuracy: 78,
      performance: {
        roadmapProblems: 35,
        generalProblems: 28,
        wrongSubmissions: 15,
        acceptedSolutions: 48,
      },
      problems: [
        { id: "2155F", solved: true },
        { id: "2155F", solved: false },
        { id: "2155F", solved: false },
        { id: "2155F", solved: false },
        { id: "2155F", solved: false },
      ],
      resources: [
        { title: "How to learn Graph...", url: "#" },
        { title: "How to learn Graph...", url: "#" },
        { title: "How to learn Graph...", url: "#" },
        { title: "How to learn Graph...", url: "#" },
      ],
      children: [
        {
          id: "greedy",
          name: "Greedy",
          status: "locked",
          icon: "mdi:diamond",
        },
        {
          id: "dp",
          name: "DP",
          status: "locked",
          icon: "mdi:table",
        },
        {
          id: "graph",
          name: "Graph",
          status: "locked",
          icon: "mdi:graph",
        },
      ],
    },
  ],
};

export function getCurrentFocus(node: TopicNode): string {
  if (node.status === "in-progress") return node.name;

  if (node.children) {
    for (const child of node.children) {
      const result = getCurrentFocus(child);
      if (result) return result;
    }
  }

  return "";
}

// Build TopicNode tree from backend API data
export function buildTreeFromApiData(
  modulesWithProgress: MyRoadmapModulesWithProgress,
  roadmapWithModules: RoadmapWithModules | null
): TopicNode {
  const currentId = modulesWithProgress.currentModule?.id ?? null;
  const moduleDetailsById = new Map(
    (roadmapWithModules?.pathModules ?? []).map((m) => [m.id, m])
  );

  const children: TopicNode[] = modulesWithProgress.modules
    .sort((a, b) => (a.moduleOrder ?? 0) - (b.moduleOrder ?? 0))
    .map((mod) => {
      const status: TopicStatus =
        mod.isCompleted
          ? "completed"
          : mod.id === currentId
            ? "in-progress"
            : "locked";
      const details = moduleDetailsById.get(mod.id);
      const problems = details?.moduleProblems.map((p, i) => ({
        id: p.externalProblemId,
        solved: i < mod.solvedProblems,
      }));
      const resources = details?.moduleResources.map((r) => ({
        title: r.title,
        url: r.url ?? "#",
      }));
      return {
        id: String(mod.id),
        name: mod.title,
        status,
        progress: mod.completionPercentage,
        icon:
          status === "completed"
            ? "mdi:check-circle"
            : status === "in-progress"
              ? "mdi:progress-clock"
              : "hugeicons:locked",
        performance: {
          roadmapProblems: mod.totalProblems,
          generalProblems: 0,
          wrongSubmissions: 0,
          acceptedSolutions: mod.solvedProblems,
        },
        problems,
        resources,
      };
    });

  return {
    id: "start",
    name: "Start Journey",
    status: "completed",
    icon: "mdi:rocket-launch",
    children,
  };
}

