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
  const isRoot = node.id === "root" || node.name.toLowerCase().includes("start");

  const baseClasses = (() => {
    if (isRoot) {
      return "bg-primary border-primary text-primary-foreground";
    }

    switch (node.status) {
      case "completed":
        return "bg-[#6DCC4A] border-[#6DCC4A] text-black";
      case "in-progress":
        return "bg-gradient-to-b from-primary to-black border-primary text-primary-foreground";
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
      onClick={() => !isLocked && onClick(node)}
      className={`group relative flex flex-col items-center gap-2 focus:outline-none ${
        isLocked ? "cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <div
        className={`flex items-center justify-center w-24 h-24 rounded-full border text-xl ${baseClasses} transition-colors duration-200 group-hover:border-accent group-hover:bg-accent/20`}
      >
        <Icon icon={iconName} className="w-8 h-8" aria-hidden />
      </div>
      <div className="flex flex-col items-center gap-0.5 mt-1">
        <span className="text-sm font-medium text-foreground">
          {isRoot ? "Start Journey" : node.name}
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

function TreeLevel({
  nodes,
  onNodeClick,
}: {
  nodes: TopicNode[];
  onNodeClick: (node: TopicNode) => void;
}) {
  return (
    <div className="w-full flex items-start justify-center gap-6 sm:gap-10 lg:gap-14">
      {nodes.map((node) => (
        <TreeNodeCircle key={node.id} node={node} onClick={onNodeClick} />
      ))}
    </div>
  );
}

function BranchConnector({ count }: { count: number }) {
  if (count <= 1) {
    return (
      <div className="flex justify-center">
        <div className="w-[2px] h-8 bg-border" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-[2px] h-6 bg-border" />
      <div
        className="relative flex items-start justify-center"
        style={{ width: `${Math.max(count * 7, 14)}rem` }}
      >
        <div
          className="absolute top-0 h-[2px] bg-border"
          style={{
            left: `${100 / (count * 2)}%`,
            right: `${100 / (count * 2)}%`,
          }}
        />
        {Array.from({ length: count }).map((_, i) => (
          <div key={`branch-${i}-${count}`} className="flex-1 flex justify-center">
            <div className="w-[2px] h-6 bg-border" />
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
  onNodeClick: (n: TopicNode) => void;
}) {
  const children = node.children ?? [];

  return (
    <div className="flex flex-col items-center">
      <TreeNodeCircle node={node} onClick={onNodeClick} />

      {children.length > 0 && (
        <>
          <BranchConnector count={children.length} />
          <TreeLevel nodes={children} onNodeClick={onNodeClick} />

          {children.map((child) => {
            if (child.children && child.children.length > 0) {
              return (
                <div key={child.id} className="flex flex-col items-center mt-0">
                  <BranchConnector count={child.children.length} />
                  <TreeLevel nodes={child.children} onNodeClick={onNodeClick} />
                </div>
              );
            }
            return null;
          })}
        </>
      )}
    </div>
  );
}

export function LearningRoadmapTree({ tree }: LearningRoadmapTreeProps) {
  const [selectedNode, setSelectedNode] = useState<TopicNode | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleNodeClick = useCallback((node: TopicNode) => {
    if (node.status === "locked") return;
    setSelectedNode(node);
    setModalOpen(true);
  }, []);

  return (
    <div className="w-full">
      <RenderTree node={tree} onNodeClick={handleNodeClick} />

      <TopicDetailModal
        node={selectedNode}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}

