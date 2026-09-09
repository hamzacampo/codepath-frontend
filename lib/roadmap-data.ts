import type {
  MyRoadmapModulesWithProgress,
  RoadmapWithModules,
} from "@/types";

export type TopicStatus = "completed" | "in-progress" | "locked";

export interface TopicNode {
  id: string;
  name: string;
  topicTitle?: string;
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
  problems?: { id: string; solved: boolean; platform?: string; href?: string }[];
  resources?: { title: string; url: string }[];
  children?: TopicNode[];
}

const MODULES_PER_TREE_ROW = 2;

/** Distribute module nodes into a multi-level tree (not one flat row). */
export function buildLeveledModuleTree(
  modules: TopicNode[],
  perRow = MODULES_PER_TREE_ROW,
): TopicNode[] {
  if (modules.length === 0) return [];
  if (modules.length <= perRow) return modules;

  const row = modules.slice(0, perRow);
  const remaining = modules.slice(perRow);
  const chunkSize = Math.ceil(remaining.length / perRow);

  row.forEach((node, index) => {
    const slice = remaining.slice(index * chunkSize, (index + 1) * chunkSize);
    if (slice.length > 0) {
      node.children = buildLeveledModuleTree(slice, perRow);
    }
  });

  return row;
}

function moduleProblemHref(
  platform: string,
  externalProblemId: string,
): string | undefined {
  if (platform === "CodePath") {
    return `/dashboard/problems/${externalProblemId}`;
  }
  const match = externalProblemId.match(/^(\d+)([A-Za-z]+)$/);
  if (platform === "Codeforces" && match) {
    return `/dashboard/problems/cf/${match[1]}/${match[2]}`;
  }
  return undefined;
}

export function buildTreeFromApiData(
  modulesWithProgress: MyRoadmapModulesWithProgress,
  roadmapWithModules: RoadmapWithModules | null,
): TopicNode {
  const currentId = modulesWithProgress.currentModule?.id ?? null;
  const moduleDetailsById = new Map(
    (roadmapWithModules?.pathModules ?? []).map((m) => [m.id, m]),
  );

  const moduleNodes: TopicNode[] = [...modulesWithProgress.modules]
    .sort((a, b) => (a.moduleOrder ?? 0) - (b.moduleOrder ?? 0))
    .map((mod) => {
    const status: TopicStatus = mod.isCompleted
      ? "completed"
      : mod.id === currentId
        ? "in-progress"
        : "locked";

    const details = moduleDetailsById.get(mod.id);
    const problems =
      mod.problems?.map((problem) => ({
        id: problem.externalProblemId,
        solved: problem.solved,
        platform: problem.platform,
        href: moduleProblemHref(problem.platform, problem.externalProblemId),
      })) ??
      details?.moduleProblems.map((problem) => ({
        id: problem.externalProblemId,
        solved: false,
        platform: problem.platform,
        href: moduleProblemHref(problem.platform, problem.externalProblemId),
      }));

    const resources = details?.moduleResources.map((resource) => ({
      title: resource.title,
      url: resource.url ?? "#",
    }));

    return {
      id: String(mod.id),
      name: mod.title,
      topicTitle: mod.topicTitle ?? mod.title,
      status,
      progress: mod.completionPercentage,
      proficiency: mod.proficiency,
      accuracy: mod.accuracy,
      performance: mod.performance,
      icon:
        status === "completed"
          ? "mdi:check-circle"
          : status === "in-progress"
            ? "mdi:progress-clock"
            : "hugeicons:locked",
      problems,
      resources,
      children: undefined,
    };
  });

  const perRow =
    moduleNodes.length > 8 ? 3 : MODULES_PER_TREE_ROW;
  const children = buildLeveledModuleTree(moduleNodes, perRow);

  const rootName =
    modulesWithProgress.learningPathTitle?.trim() || "My Roadmap";

  return {
    id: "start",
    name: rootName,
    status: "completed",
    icon: "mdi:rocket-launch",
    children,
  };
}
