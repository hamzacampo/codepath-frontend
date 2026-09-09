"use client";

import { useCallback, useState } from "react";
import type { TopicNode } from "@/lib/roadmap-data";
import { Icon } from "@iconify/react";
import { TopicDetailModal } from "@/components/ui/TopicDetailModal";

interface LearningRoadmapTreeProps {
  tree: TopicNode;
}

interface TreeNodeCircleProps {
  node: TopicNode;
  onClick: (node: TopicNode) => void;
}

function TreeNodeCircle({ node, onClick }: TreeNodeCircleProps) {
  const isLocked = node.status === "locked";
  const isRoot = node.id === "start" || node.id === "root";

  const baseClasses = (() => {
    if (isRoot) {
      return "bg-primary border-primary text-primary-foreground";
    }

    switch (node.status) {
      case "completed":
        return "bg-[#6DCC4A] border-[#6DCC4A] text-black";
      case "in-progress":
        return "bg-linear-to-b from-primary to-black border-primary text-primary-foreground";
      case "locked":
      default:
        return "bg-accent border-accent text-accent-foreground";
    }
  })();

  const iconName = (() => {
    if (isRoot) return "streamline-plump:balloon-remix";
    switch (node.status) {
      case "completed":
        return "ic:sharp-done-all";
      case "in-progress":
        return "lets-icons:progress";
      case "locked":
        return "hugeicons:locked";
      default:
        return "hugeicons:locked";
    }
  })();

  const statusLabel = (() => {
    if (isRoot) return "";
    switch (node.status) {
      case "completed":
        return "Completed";
      case "in-progress":
        return "In Progress";
      case "locked":
        return "Locked";
      default:
        return "";
    }
  })();

  return (
    <button
      type="button"
      onClick={() => !isLocked && !isRoot && onClick(node)}
      disabled={isLocked || isRoot}
      className={`group relative flex flex-col items-center gap-2 focus:outline-none ${
        isLocked || isRoot ? "cursor-default" : "cursor-pointer"
      }`}
    >
      <div
        className={`flex items-center justify-center rounded-full border ${
          isRoot ? "w-[4.5rem] h-[4.5rem] sm:w-20 sm:h-20" : "w-14 h-14 sm:w-16 sm:h-16"
        } ${baseClasses} transition-colors duration-200 ${
          !isLocked && !isRoot
            ? "group-hover:border-accent group-hover:bg-accent/20"
            : ""
        }`}
      >
        <Icon
          icon={iconName}
          className={`${isRoot ? "w-6 h-6 sm:w-7 sm:h-7" : "w-5 h-5 sm:w-6 sm:h-6"}`}
          aria-hidden
        />
      </div>
      <div className="flex flex-col items-center gap-0.5 mt-1.5 px-1">
        <span
          className={`font-medium text-foreground text-center leading-tight ${
            isRoot ? "text-sm max-w-40" : "text-xs max-w-32"
          }`}
        >
          {node.name}
        </span>
        {statusLabel && !isRoot && (
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {statusLabel}
          </span>
        )}
      </div>
    </button>
  );
}

const SIBLING_ROW_CLASS =
  "flex items-start justify-center flex-wrap gap-x-6 sm:gap-x-12 lg:gap-x-16 gap-y-4 px-1 sm:px-2 max-w-full";
const SIBLING_COLUMN_CLASS =
  "flex flex-col items-center shrink-0 w-[6.5rem] sm:w-28";

function BranchConnector({ count }: { count: number }) {
  if (count <= 1) {
    return (
      <div className="flex justify-center">
        <div className="w-0.5 h-6 bg-border" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-0.5 h-5 bg-border" />
      <div className={`relative ${SIBLING_ROW_CLASS}`}>
        <div
          className="absolute top-0 left-[calc(3.25rem/2)] right-[calc(3.25rem/2)] sm:left-14 sm:right-14 h-0.5 bg-border pointer-events-none"
          aria-hidden
        />
        {Array.from({ length: count }).map((_, i) => (
          <div key={`branch-${i}-${count}`} className={SIBLING_COLUMN_CLASS}>
            <div className="w-0.5 h-5 bg-border" />
          </div>
        ))}
      </div>
    </div>
  );
}

function RenderTree({
  node,
  onNodeClick,
}: {
  node: TopicNode;
  onNodeClick: (node: TopicNode) => void;
}) {
  const children = node.children ?? [];

  return (
    <div className="flex flex-col items-center w-full">
      <TreeNodeCircle node={node} onClick={onNodeClick} />

      {children.length > 0 && (
        <>
          <BranchConnector count={children.length} />
          <div className={`${SIBLING_ROW_CLASS} gap-y-6 w-full`}>
            {children.map((child) => (
              <div key={child.id} className={SIBLING_COLUMN_CLASS}>
                <RenderTree node={child} onNodeClick={onNodeClick} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function LearningRoadmapTree({ tree }: LearningRoadmapTreeProps) {
  const [selectedNode, setSelectedNode] = useState<TopicNode | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleNodeClick = useCallback((node: TopicNode) => {
    if (node.status === "locked" || node.id === "start") return;
    setSelectedNode(node);
    setModalOpen(true);
  }, []);

  return (
    <div className="w-full max-w-full min-w-0 overflow-x-hidden flex justify-center">
      <RenderTree node={tree} onNodeClick={handleNodeClick} />

      <TopicDetailModal
        node={selectedNode}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
