"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { apiService } from "@/lib/api-service";
import { getApiErrorMessage } from "@/lib/errors";
import { Select } from "@/components/ui/Select";
import { CodePathProblemPicker } from "@/components/admin/CodePathProblemPicker";
import {
  jsonFieldToText,
  parseProblemInput,
  textToJsonField,
} from "@/components/admin/roadmap-utils";
import type {
  CodePathProblemListItem,
  PathModuleWithDetails,
  RoadmapWithModules,
  SkillLevel,
  Topic,
} from "@/types";

const RESOURCE_TYPES = ["Book", "Article", "Video", "Course", "Documentation"];

const fieldInputClass =
  "w-full rounded-lg border border-border bg-secondary/40 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";

const fieldTextareaClass =
  "w-full rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y min-h-[108px]";

interface RoadmapFormProps {
  roadmapId?: number;
  initialRoadmap?: RoadmapWithModules | null;
}

type ModulePanelMode = "view" | "edit" | "create";

export function RoadmapForm({ roadmapId, initialRoadmap = null }: RoadmapFormProps) {
  const router = useRouter();
  const isNew = !roadmapId;

  const [title, setTitle] = useState(initialRoadmap?.title ?? "");
  const [description, setDescription] = useState(initialRoadmap?.description ?? "");
  const [targetSkillLevelId, setTargetSkillLevelId] = useState<number | null>(
    initialRoadmap?.targetSkillLevelId ?? null,
  );
  const [modules, setModules] = useState<PathModuleWithDetails[]>(
    initialRoadmap?.pathModules ?? [],
  );
  const [skillLevels, setSkillLevels] = useState<SkillLevel[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  const [savingRoadmap, setSavingRoadmap] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [expandedModuleId, setExpandedModuleId] = useState<number | "new" | null>(null);
  const [modulePanelMode, setModulePanelMode] = useState<ModulePanelMode>("view");

  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [moduleTopicId, setModuleTopicId] = useState<string>("");
  const [moduleOrder, setModuleOrder] = useState(1);
  const [moduleHours, setModuleHours] = useState(3);
  const [moduleObjectives, setModuleObjectives] = useState("");
  const [moduleSuccessCriteria, setModuleSuccessCriteria] = useState("");
  const [savingModule, setSavingModule] = useState(false);

  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [resourceType, setResourceType] = useState("Book");
  const [resourceDescription, setResourceDescription] = useState("");
  const [savingResource, setSavingResource] = useState(false);

  const [problemInput, setProblemInput] = useState("");
  const [selectedCodePathProblem, setSelectedCodePathProblem] =
    useState<CodePathProblemListItem | null>(null);
  const [problemTitleCache, setProblemTitleCache] = useState<Record<string, string>>({});
  const [problemPlatform, setProblemPlatform] = useState<"Codeforces" | "CodePath">(
    "Codeforces",
  );
  const [savingProblem, setSavingProblem] = useState(false);

  const activeModule = useMemo(() => {
    if (expandedModuleId === "new" || expandedModuleId == null) return null;
    return modules.find((m) => m.id === expandedModuleId) ?? null;
  }, [expandedModuleId, modules]);

  useEffect(() => {
    if (!activeModule) return;

    const codePathIds = activeModule.moduleProblems
      .filter((problem) => problem.platform === "CodePath")
      .map((problem) => problem.externalProblemId)
      .filter((id) => !problemTitleCache[id]);

    if (codePathIds.length === 0) return;

    let cancelled = false;
    Promise.all(
      codePathIds.map((id) => apiService.getCodePathProblem(id).catch(() => null)),
    ).then((results) => {
      if (cancelled) return;
      setProblemTitleCache((prev) => {
        const next = { ...prev };
        results.forEach((problem, index) => {
          if (problem) next[codePathIds[index]] = problem.title;
        });
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [activeModule, problemTitleCache]);

  const refreshRoadmap = useCallback(async () => {
    if (!roadmapId) return;
    const roadmap = await apiService.getRoadmapById(roadmapId);
    setModules(roadmap.pathModules ?? []);
    setTitle(roadmap.title);
    setDescription(roadmap.description ?? "");
    setTargetSkillLevelId(roadmap.targetSkillLevelId ?? null);
  }, [roadmapId]);

  useEffect(() => {
    let cancelled = false;
    setLoadingMeta(true);
    Promise.all([apiService.getSkillLevels(), apiService.getTopics()])
      .then(([levels, topicList]) => {
        if (cancelled) return;
        setSkillLevels(levels);
        setTopics(topicList);
        setTargetSkillLevelId((current) => {
          if (current != null) return current;
          return levels[0]?.id ?? null;
        });
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load skill levels or topics");
      })
      .finally(() => {
        if (!cancelled) setLoadingMeta(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const resetModuleForm = (order = modules.length + 1) => {
    setModuleTitle("");
    setModuleDescription("");
    setModuleTopicId("");
    setModuleOrder(order);
    setModuleHours(3);
    setModuleObjectives("");
    setModuleSuccessCriteria("");
    setResourceTitle("");
    setResourceUrl("");
    setResourceType("Book");
    setResourceDescription("");
    setProblemInput("");
    setSelectedCodePathProblem(null);
    setProblemPlatform("Codeforces");
  };

  const populateModuleForm = (module: PathModuleWithDetails) => {
    setModuleTitle(module.title);
    setModuleDescription(module.description);
    setModuleTopicId(module.topicId ? String(module.topicId) : "");
    setModuleOrder(module.moduleOrder ?? 1);
    setModuleHours(module.estimatedHours ?? 3);
    setModuleObjectives(jsonFieldToText(module.learningObjectives));
    setModuleSuccessCriteria(jsonFieldToText(module.successCriteria));
  };

  const handleSaveRoadmap = async () => {
    if (!title.trim() || !description.trim() || !targetSkillLevelId) {
      setError("Title, description, and level are required.");
      return;
    }

    setSavingRoadmap(true);
    setError(null);
    setSuccess(null);
    try {
      if (isNew) {
        const result = await apiService.createAdminRoadmap({
          title: title.trim(),
          description: description.trim(),
          targetSkillLevelId,
        });
        router.push(`/admin/roadmaps/${result.roadmap.id}`);
        return;
      }

      await apiService.updateAdminRoadmap(roadmapId!, {
        title: title.trim(),
        description: description.trim(),
        targetSkillLevelId,
      });
      setSuccess("Roadmap saved successfully.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to save roadmap"));
    } finally {
      setSavingRoadmap(false);
    }
  };

  const handleOpenCreateModule = () => {
    resetModuleForm(modules.length + 1);
    setExpandedModuleId("new");
    setModulePanelMode("create");
  };

  const handleOpenModule = (module: PathModuleWithDetails, mode: ModulePanelMode) => {
    populateModuleForm(module);
    setExpandedModuleId(module.id);
    setModulePanelMode(mode);
  };

  const handleSaveModule = async () => {
    if (!roadmapId) {
      setError("Save the roadmap first before adding modules.");
      return;
    }
    if (!moduleTitle.trim() || !moduleDescription.trim()) {
      setError("Module title and description are required.");
      return;
    }

    setSavingModule(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        title: moduleTitle.trim(),
        description: moduleDescription.trim(),
        topicId: moduleTopicId ? Number(moduleTopicId) : undefined,
        moduleOrder: moduleOrder,
        estimatedHours: moduleHours,
        learningObjectives: moduleObjectives.trim()
          ? { objective: textToJsonField(moduleObjectives) }
          : undefined,
        successCriteria: moduleSuccessCriteria.trim()
          ? { criteria: textToJsonField(moduleSuccessCriteria) }
          : undefined,
      };

      if (modulePanelMode === "create") {
        await apiService.createRoadmapModule({
          learningPathId: roadmapId,
          ...payload,
        });
        setSuccess("Module created.");
      } else if (expandedModuleId !== "new" && expandedModuleId != null) {
        await apiService.updateRoadmapModule(expandedModuleId, payload);
        setSuccess("Module updated.");
      }

      await refreshRoadmap();
      setExpandedModuleId(null);
      setModulePanelMode("view");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to save module"));
    } finally {
      setSavingModule(false);
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!window.confirm("Delete this module and all its resources/problems?")) return;
    setError(null);
    try {
      await apiService.deleteRoadmapModule(moduleId);
      if (expandedModuleId === moduleId) {
        setExpandedModuleId(null);
      }
      await refreshRoadmap();
      setSuccess("Module deleted.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to delete module"));
    }
  };

  const handleAddResource = async () => {
    if (!activeModule) return;
    if (!resourceTitle.trim()) {
      setError("Resource title is required.");
      return;
    }

    setSavingResource(true);
    setError(null);
    try {
      await apiService.createRoadmapResource({
        pathModuleId: activeModule.id,
        resourceType: resourceType,
        title: resourceTitle.trim(),
        description: resourceDescription.trim() || undefined,
        url: resourceUrl.trim() || undefined,
      });
      setResourceTitle("");
      setResourceUrl("");
      setResourceDescription("");
      await refreshRoadmap();
      setSuccess("Resource added.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to add resource"));
    } finally {
      setSavingResource(false);
    }
  };

  const handleDeleteResource = async (resourceId: number) => {
    if (!window.confirm("Delete this resource?")) return;
    try {
      await apiService.deleteRoadmapResource(resourceId);
      await refreshRoadmap();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to delete resource"));
    }
  };

  const handleAddProblem = async () => {
    if (!activeModule) return;

    const externalProblemId =
      problemPlatform === "CodePath"
        ? selectedCodePathProblem?.id ?? ""
        : parseProblemInput(problemInput, problemPlatform);

    if (!externalProblemId) {
      setError(
        problemPlatform === "CodePath"
          ? "Select a CodePath problem to add."
          : "Problem ID or URL is required.",
      );
      return;
    }

    setSavingProblem(true);
    setError(null);
    try {
      await apiService.createRoadmapProblem({
        pathModuleId: activeModule.id,
        externalProblemId,
        platform: problemPlatform,
      });
      if (problemPlatform === "CodePath" && selectedCodePathProblem) {
        setProblemTitleCache((prev) => ({
          ...prev,
          [selectedCodePathProblem.id]: selectedCodePathProblem.title,
        }));
        setSelectedCodePathProblem(null);
      } else {
        setProblemInput("");
      }
      await refreshRoadmap();
      setSuccess("Problem added.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to add problem"));
    } finally {
      setSavingProblem(false);
    }
  };

  const handleProblemPlatformChange = (platform: "Codeforces" | "CodePath") => {
    setProblemPlatform(platform);
    setProblemInput("");
    setSelectedCodePathProblem(null);
  };

  const handleDeleteProblem = async (problemId: number) => {
    if (!window.confirm("Remove this problem from the module?")) return;
    try {
      await apiService.deleteRoadmapProblem(problemId);
      await refreshRoadmap();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to delete problem"));
    }
  };

  if (loadingMeta) {
    return (
      <div className="py-16 text-center text-muted-foreground">Loading roadmap form...</div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-[936px]">
      {error && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-green-500/10 border border-green-500/30 px-4 py-3 text-sm text-green-400">
          {success}
        </div>
      )}

      {/* Roadmap details */}
      <section className="flex flex-col gap-4">
        <div className="relative">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/40 px-4 h-[53px]">
            <Icon
              icon="streamline-sharp:module-puzzle-2-solid"
              className="w-[26px] h-[26px] text-primary shrink-0"
              aria-hidden
            />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Roadmap title"
              className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Roadmap description"
          rows={5}
          className={fieldTextareaClass}
        />

        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <div className="flex flex-wrap gap-3 flex-1">
            {skillLevels.map((level) => {
              const selected = targetSkillLevelId === level.id;
              return (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => setTargetSkillLevelId(level.id)}
                  className={`flex items-center gap-3 rounded-lg border px-5 h-[53px] min-w-[180px] transition-colors ${
                    selected
                      ? "border-primary bg-primary/20 text-foreground"
                      : "border-border bg-secondary/40 text-muted-foreground hover:bg-secondary/60"
                  }`}
                >
                  <Icon
                    icon={selected ? "ri:radio-button-fill" : "ri:radio-button-line"}
                    className={`w-6 h-6 ${selected ? "text-primary" : ""}`}
                    aria-hidden
                  />
                  <span className="text-base font-medium">{level.title}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={savingRoadmap}
            onClick={handleSaveRoadmap}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 h-[53px] text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 shrink-0"
          >
            <Icon icon="material-symbols:save-outline" className="w-5 h-5" aria-hidden />
            {savingRoadmap ? "Saving..." : "Save"}
          </button>
        </div>
      </section>

      {!isNew && (
        <>
          {/* Modules list header */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-foreground">Modules List</h2>
              <button
                type="button"
                onClick={handleOpenCreateModule}
                className="text-primary hover:text-primary/80 transition-colors"
                aria-label="Add module"
              >
                <Icon icon="gridicons:add-outline" className="w-5 h-5" aria-hidden />
              </button>
            </div>

            <div className="rounded-[10px] bg-linear-to-r from-white/6 to-white/24 px-6 py-3.5 grid grid-cols-[1.2fr_1.5fr_0.7fr_0.5fr_72px] gap-3 items-center text-[18px] font-semibold text-white tracking-[0.18px]">
              <span>Module Title</span>
              <span>Description</span>
              <span>Topic</span>
              <span>Duration</span>
              <span className="sr-only">Actions</span>
            </div>

            <div className="flex flex-col">
              {modules.length === 0 ? (
                <p className="py-6 text-sm text-muted-foreground text-center">
                  No modules yet. Click + to add one.
                </p>
              ) : (
                modules.map((module) => (
                  <div key={module.id} className="border-b border-border/60">
                    <div className="grid grid-cols-[1.2fr_1.5fr_0.7fr_0.5fr_72px] gap-3 items-center px-6 py-3 text-[16px] text-foreground tracking-[0.16px]">
                      <span className="truncate font-medium">{module.title}</span>
                      <span className="truncate text-muted-foreground">
                        {module.description}
                      </span>
                      <span className="truncate">{module.topic?.title ?? "—"}</span>
                      <span>{module.estimatedHours ?? 0}h</span>
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => handleOpenModule(module, "view")}
                          className="text-foreground hover:text-primary transition-colors"
                          aria-label={`View ${module.title}`}
                        >
                          <Icon icon="lets-icons:view" className="w-6 h-6" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenModule(module, "edit")}
                          className="text-primary hover:text-primary/80 transition-colors"
                          aria-label={`Edit ${module.title}`}
                        >
                          <Icon icon="mingcute:edit-line" className="w-5 h-5" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteModule(module.id)}
                          className="text-destructive hover:text-destructive/80 transition-colors"
                          aria-label={`Delete ${module.title}`}
                        >
                          <Icon
                            icon="material-symbols:delete-outline"
                            className="w-5 h-5"
                            aria-hidden
                          />
                        </button>
                      </div>
                    </div>

                    {expandedModuleId === module.id && (
                      <ModuleDetailPanel
                        mode={modulePanelMode}
                        module={module}
                        topics={topics}
                        moduleTitle={moduleTitle}
                        moduleDescription={moduleDescription}
                        moduleTopicId={moduleTopicId}
                        moduleOrder={moduleOrder}
                        moduleHours={moduleHours}
                        moduleObjectives={moduleObjectives}
                        moduleSuccessCriteria={moduleSuccessCriteria}
                        resourceTitle={resourceTitle}
                        resourceUrl={resourceUrl}
                        resourceType={resourceType}
                        resourceDescription={resourceDescription}
                        problemInput={problemInput}
                        selectedCodePathProblem={selectedCodePathProblem}
                        problemTitleCache={problemTitleCache}
                        problemPlatform={problemPlatform}
                        savingModule={savingModule}
                        savingResource={savingResource}
                        savingProblem={savingProblem}
                        onModuleTitleChange={setModuleTitle}
                        onModuleDescriptionChange={setModuleDescription}
                        onModuleTopicIdChange={setModuleTopicId}
                        onModuleOrderChange={setModuleOrder}
                        onModuleHoursChange={setModuleHours}
                        onModuleObjectivesChange={setModuleObjectives}
                        onModuleSuccessCriteriaChange={setModuleSuccessCriteria}
                        onResourceTitleChange={setResourceTitle}
                        onResourceUrlChange={setResourceUrl}
                        onResourceTypeChange={setResourceType}
                        onResourceDescriptionChange={setResourceDescription}
                        onProblemInputChange={setProblemInput}
                        onSelectedCodePathProblemChange={setSelectedCodePathProblem}
                        onProblemPlatformChange={handleProblemPlatformChange}
                        onSaveModule={handleSaveModule}
                        onAddResource={handleAddResource}
                        onDeleteResource={handleDeleteResource}
                        onAddProblem={handleAddProblem}
                        onDeleteProblem={handleDeleteProblem}
                        onClose={() => setExpandedModuleId(null)}
                        onSwitchToEdit={() => setModulePanelMode("edit")}
                      />
                    )}
                  </div>
                ))
              )}
            </div>

            {expandedModuleId === "new" && (
              <div className="rounded-xl border border-border bg-secondary/20 p-4">
                <ModuleDetailPanel
                  mode="create"
                  module={null}
                  topics={topics}
                  moduleTitle={moduleTitle}
                  moduleDescription={moduleDescription}
                  moduleTopicId={moduleTopicId}
                  moduleOrder={moduleOrder}
                  moduleHours={moduleHours}
                  moduleObjectives={moduleObjectives}
                  moduleSuccessCriteria={moduleSuccessCriteria}
                  resourceTitle={resourceTitle}
                  resourceUrl={resourceUrl}
                  resourceType={resourceType}
                  resourceDescription={resourceDescription}
                  problemInput={problemInput}
                  selectedCodePathProblem={selectedCodePathProblem}
                  problemTitleCache={problemTitleCache}
                  problemPlatform={problemPlatform}
                  savingModule={savingModule}
                  savingResource={savingResource}
                  savingProblem={savingProblem}
                  onModuleTitleChange={setModuleTitle}
                  onModuleDescriptionChange={setModuleDescription}
                  onModuleTopicIdChange={setModuleTopicId}
                  onModuleOrderChange={setModuleOrder}
                  onModuleHoursChange={setModuleHours}
                  onModuleObjectivesChange={setModuleObjectives}
                  onModuleSuccessCriteriaChange={setModuleSuccessCriteria}
                  onResourceTitleChange={setResourceTitle}
                  onResourceUrlChange={setResourceUrl}
                  onResourceTypeChange={setResourceType}
                  onResourceDescriptionChange={setResourceDescription}
                  onProblemInputChange={setProblemInput}
                  onSelectedCodePathProblemChange={setSelectedCodePathProblem}
                  onProblemPlatformChange={handleProblemPlatformChange}
                  onSaveModule={handleSaveModule}
                  onAddResource={handleAddResource}
                  onDeleteResource={handleDeleteResource}
                  onAddProblem={handleAddProblem}
                  onDeleteProblem={handleDeleteProblem}
                  onClose={() => setExpandedModuleId(null)}
                  onSwitchToEdit={() => setModulePanelMode("edit")}
                />
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

interface ModuleDetailPanelProps {
  mode: ModulePanelMode;
  module: PathModuleWithDetails | null;
  topics: Topic[];
  moduleTitle: string;
  moduleDescription: string;
  moduleTopicId: string;
  moduleOrder: number;
  moduleHours: number;
  moduleObjectives: string;
  moduleSuccessCriteria: string;
  resourceTitle: string;
  resourceUrl: string;
  resourceType: string;
  resourceDescription: string;
  problemInput: string;
  selectedCodePathProblem: CodePathProblemListItem | null;
  problemTitleCache: Record<string, string>;
  problemPlatform: "Codeforces" | "CodePath";
  savingModule: boolean;
  savingResource: boolean;
  savingProblem: boolean;
  onModuleTitleChange: (v: string) => void;
  onModuleDescriptionChange: (v: string) => void;
  onModuleTopicIdChange: (v: string) => void;
  onModuleOrderChange: (v: number) => void;
  onModuleHoursChange: (v: number) => void;
  onModuleObjectivesChange: (v: string) => void;
  onModuleSuccessCriteriaChange: (v: string) => void;
  onResourceTitleChange: (v: string) => void;
  onResourceUrlChange: (v: string) => void;
  onResourceTypeChange: (v: string) => void;
  onResourceDescriptionChange: (v: string) => void;
  onProblemInputChange: (v: string) => void;
  onSelectedCodePathProblemChange: (problem: CodePathProblemListItem | null) => void;
  onProblemPlatformChange: (v: "Codeforces" | "CodePath") => void;
  onSaveModule: () => void;
  onAddResource: () => void;
  onDeleteResource: (id: number) => void;
  onAddProblem: () => void;
  onDeleteProblem: (id: number) => void;
  onClose: () => void;
  onSwitchToEdit: () => void;
}

function ModuleDetailPanel({
  mode,
  module,
  topics,
  moduleTitle,
  moduleDescription,
  moduleTopicId,
  moduleOrder,
  moduleHours,
  moduleObjectives,
  moduleSuccessCriteria,
  resourceTitle,
  resourceUrl,
  resourceType,
  resourceDescription,
  problemInput,
  selectedCodePathProblem,
  problemTitleCache,
  problemPlatform,
  savingModule,
  savingResource,
  savingProblem,
  onModuleTitleChange,
  onModuleDescriptionChange,
  onModuleTopicIdChange,
  onModuleOrderChange,
  onModuleHoursChange,
  onModuleObjectivesChange,
  onModuleSuccessCriteriaChange,
  onResourceTitleChange,
  onResourceUrlChange,
  onResourceTypeChange,
  onResourceDescriptionChange,
  onProblemInputChange,
  onSelectedCodePathProblemChange,
  onProblemPlatformChange,
  onSaveModule,
  onAddResource,
  onDeleteResource,
  onAddProblem,
  onDeleteProblem,
  onClose,
  onSwitchToEdit,
}: ModuleDetailPanelProps) {
  const readOnly = mode === "view";
  const showResources = mode !== "create" && module != null;

  return (
    <div className="px-2 sm:px-4 py-6 flex flex-col gap-8 bg-secondary/10 rounded-xl my-2">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-foreground">Modules Details</h3>
        <div className="flex items-center gap-2">
          {readOnly && (
            <button
              type="button"
              onClick={onSwitchToEdit}
              className="text-sm text-primary hover:underline"
            >
              Edit
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Close
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <input
          type="text"
          value={moduleTitle}
          onChange={(e) => onModuleTitleChange(e.target.value)}
          placeholder="Module Title"
          readOnly={readOnly}
          className={fieldInputClass}
        />
        <input
          type="text"
          value={moduleDescription}
          onChange={(e) => onModuleDescriptionChange(e.target.value)}
          placeholder="Short Description"
          readOnly={readOnly}
          className={fieldInputClass}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Select
              value={moduleTopicId}
              onChange={(e) => onModuleTopicIdChange(e.target.value)}
              disabled={readOnly}
              placeholder="Topic"
              options={topics.map((t) => ({ value: String(t.id), label: t.title }))}
              className="h-10"
            />
          </div>
          <div className="relative flex items-center">
            <input
              type="number"
              min={1}
              value={moduleOrder}
              onChange={(e) => onModuleOrderChange(Number(e.target.value) || 1)}
              readOnly={readOnly}
              className={fieldInputClass}
              aria-label="Module order"
            />
            <div className="absolute right-3 flex flex-col text-muted-foreground pointer-events-none">
              <Icon icon="lsicon:triangle-up-filled" className="w-4 h-4" aria-hidden />
              <Icon icon="akar-icons:triangle-down-fill" className="w-4 h-4 -mt-1" aria-hidden />
            </div>
          </div>
          <div className="relative">
            <input
              type="number"
              min={1}
              value={moduleHours}
              onChange={(e) => onModuleHoursChange(Number(e.target.value) || 1)}
              readOnly={readOnly}
              className={fieldInputClass}
              aria-label="Duration in hours"
            />
            <Icon
              icon="mingcute:time-duration-fill"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none"
              aria-hidden
            />
          </div>
        </div>

        <textarea
          value={moduleObjectives}
          onChange={(e) => onModuleObjectivesChange(e.target.value)}
          placeholder="Learning objectives"
          readOnly={readOnly}
          className={fieldTextareaClass}
        />
        <textarea
          value={moduleSuccessCriteria}
          onChange={(e) => onModuleSuccessCriteriaChange(e.target.value)}
          placeholder="Success criteria"
          readOnly={readOnly}
          className={fieldTextareaClass}
        />

        {!readOnly && (
          <button
            type="button"
            disabled={savingModule}
            onClick={onSaveModule}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {savingModule ? "Saving..." : mode === "create" ? "Create Module" : "Save Module"}
          </button>
        )}
      </div>

      {showResources && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-semibold text-foreground">Module Resources</h4>
            <Icon icon="gridicons:add-outline" className="w-4 h-4 text-primary" aria-hidden />
          </div>

          <div className="flex flex-wrap gap-3">
            {module.moduleResources.map((resource) => (
              <div
                key={resource.id}
                className="inline-flex items-center gap-2 rounded-full bg-primary/30 border border-primary/40 px-3 py-2 text-sm text-foreground max-w-[200px]"
              >
                <Icon icon="ix:book" className="w-5 h-5 text-primary shrink-0" aria-hidden />
                <span className="truncate">{resource.title}</span>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => onDeleteResource(resource.id)}
                    className="text-destructive shrink-0"
                    aria-label="Delete resource"
                  >
                    <Icon icon="mdi:close" className="w-4 h-4" aria-hidden />
                  </button>
                )}
              </div>
            ))}
          </div>

          {!readOnly && (
            <>
              <input
                type="text"
                value={resourceTitle}
                onChange={(e) => onResourceTitleChange(e.target.value)}
                placeholder="Resource Title"
                className={fieldInputClass}
              />
              <input
                type="url"
                value={resourceUrl}
                onChange={(e) => onResourceUrlChange(e.target.value)}
                placeholder="Resource URL"
                className={fieldInputClass}
              />
              <div className="relative">
                <Icon
                  icon="ix:book"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary pointer-events-none"
                  aria-hidden
                />
                <Select
                  value={resourceType}
                  onChange={(e) => onResourceTypeChange(e.target.value)}
                  options={RESOURCE_TYPES.map((t) => ({ value: t, label: t }))}
                  className="pl-10 h-10"
                />
              </div>
              <textarea
                value={resourceDescription}
                onChange={(e) => onResourceDescriptionChange(e.target.value)}
                placeholder="Resource Description"
                className={fieldTextareaClass}
              />
              <button
                type="button"
                disabled={savingResource}
                onClick={onAddResource}
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {savingResource ? "Adding..." : "Save / Add"}
              </button>
            </>
          )}
        </section>
      )}

      {showResources && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-semibold text-foreground">Module Problems</h4>
            <Icon icon="gridicons:add-outline" className="w-4 h-4 text-primary" aria-hidden />
          </div>

          <div className="flex flex-wrap gap-3">
            {module.moduleProblems.map((problem) => {
              const label =
                problem.platform === "CodePath"
                  ? problemTitleCache[problem.externalProblemId] ?? problem.externalProblemId
                  : problem.externalProblemId;

              return (
              <div
                key={problem.id}
                className="inline-flex items-center gap-2 rounded-full bg-primary/20 border border-primary/30 px-3 py-2 text-sm text-foreground"
              >
                <Icon
                  icon="ooui:mathematics-display-block"
                  className="w-5 h-5 text-primary shrink-0"
                  aria-hidden
                />
                <span className="max-w-[180px] truncate">{label}</span>
                <span className="text-xs text-muted-foreground">({problem.platform})</span>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => onDeleteProblem(problem.id)}
                    className="text-destructive shrink-0"
                    aria-label="Delete problem"
                  >
                    <Icon icon="mdi:close" className="w-4 h-4" aria-hidden />
                  </button>
                )}
              </div>
            );
            })}
          </div>

          {!readOnly && (
            <>
              <Select
                value={problemPlatform}
                onChange={(e) =>
                  onProblemPlatformChange(e.target.value as "Codeforces" | "CodePath")
                }
                options={[
                  { value: "Codeforces", label: "Codeforces" },
                  { value: "CodePath", label: "CodePath" },
                ]}
                className="h-10"
              />
              {problemPlatform === "CodePath" ? (
                <CodePathProblemPicker
                  value={selectedCodePathProblem}
                  onChange={onSelectedCodePathProblemChange}
                  excludeIds={module.moduleProblems
                    .filter((p) => p.platform === "CodePath")
                    .map((p) => p.externalProblemId)}
                />
              ) : (
                <input
                  type="text"
                  value={problemInput}
                  onChange={(e) => onProblemInputChange(e.target.value)}
                  placeholder="Codeforces problem ID or URL (e.g. 2155F)"
                  className={fieldInputClass}
                />
              )}
              <button
                type="button"
                disabled={
                  savingProblem ||
                  (problemPlatform === "CodePath"
                    ? !selectedCodePathProblem
                    : !problemInput.trim())
                }
                onClick={onAddProblem}
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {savingProblem ? "Adding..." : "Save / Add"}
              </button>
            </>
          )}
        </section>
      )}
    </div>
  );
}
