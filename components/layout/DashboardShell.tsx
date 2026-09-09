"use client";

import { usePathname } from "next/navigation";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { DashboardSidebarProvider } from "@/components/layout/DashboardSidebarContext";
import { FloatingChatbot } from "@/components/ui/FloatingChatbot";
import { StarNetworkBackground } from "@/components/ui/StarNetworkBackground";
import { isImmersiveProblemRoute } from "@/lib/layout-routes";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const immersive = isImmersiveProblemRoute(pathname);

  if (immersive) {
    return (
      <div className="flex h-dvh w-full flex-col overflow-hidden">
        {children}
      </div>
    );
  }

  return (
    <DashboardSidebarProvider>
      <div className="flex h-full min-h-0 w-full max-w-[100vw] relative">
        <StarNetworkBackground />
        <DashboardSidebar />
        <div className="flex flex-1 min-h-0 min-w-0 flex-col relative z-0 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain">
            {children}
          </div>
        </div>
        <FloatingChatbot />
      </div>
    </DashboardSidebarProvider>
  );
}
