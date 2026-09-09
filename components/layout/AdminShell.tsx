"use client";

import AdminSidebar from "@/components/layout/AdminSidebar";
import { AdminSidebarProvider } from "@/components/layout/AdminSidebarContext";
import { StarNetworkBackground } from "@/components/ui/StarNetworkBackground";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminSidebarProvider>
      <div className="flex h-full min-h-0 w-full max-w-[100vw] relative">
        <StarNetworkBackground />
        <AdminSidebar />
        <div className="flex flex-1 min-h-0 min-w-0 flex-col relative z-0 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain">
            {children}
          </div>
        </div>
      </div>
    </AdminSidebarProvider>
  );
}
