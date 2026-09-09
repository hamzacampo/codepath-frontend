"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  isAdminRoute,
  isDashboardRoute,
  isImmersiveProblemRoute,
  usesDashboardShell,
} from "@/lib/layout-routes";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const immersive = isImmersiveProblemRoute(pathname);
  const dashboardShell = usesDashboardShell(pathname);
  const hideFooter =
    immersive || isDashboardRoute(pathname) || isAdminRoute(pathname);
  const lockViewport = immersive || dashboardShell;

  useEffect(() => {
    if (!lockViewport) {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      return;
    }
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [lockViewport]);

  return (
    <div
      className={[
        "flex w-full flex-col",
        lockViewport ? "h-dvh overflow-hidden" : "min-h-dvh",
      ].join(" ")}
    >
      {!immersive && <Header />}
      <main
        className={[
          "flex flex-1 flex-col min-h-0 min-w-0 w-full",
          lockViewport ? "overflow-hidden" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}
