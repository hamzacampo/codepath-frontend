"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { useAdminSidebar } from "@/components/layout/AdminSidebarContext";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: "fluent-mdl2:analytics-view", exact: true },
  { href: "/admin/problems", label: "Problems", icon: "mdi:code-braces" },
  { href: "/admin/contests", label: "Contests", icon: "mdi:trophy-outline" },
  { href: "/admin/quiz", label: "Quiz", icon: "mdi:help-circle-outline" },
  { href: "/admin/roadmaps", label: "Roadmaps", icon: "streamline:arrow-roadmap" },
  { href: "/admin/topics", label: "Topics", icon: "mdi:tag-multiple-outline" },
  { href: "/admin/coaches", label: "Coach Session", icon: "mdi:presentation" },
  { href: "/admin/users", label: "Users", icon: "mdi:account-group-outline" },
  { href: "/admin/reference", label: "Reference", icon: "mdi:book-open-outline" },
  { href: "/admin/insights", label: "Insights", icon: "mdi:lightbulb-outline" },
] as const;

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { collapsed, toggleCollapsed } = useAdminSidebar();

  const closeMobile = () => setMobileOpen(false);

  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "hidden";
    };
  }, [mobileOpen]);

  useEffect(() => {
    closeMobile();
  }, [pathname]);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const desktopWidthClass = collapsed ? "lg:w-[4.5rem]" : "lg:w-56";

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed left-4 top-[calc(var(--app-header-height)+0.75rem)] z-40 flex items-center justify-center w-11 h-11 rounded-xl bg-card text-muted-foreground hover:bg-secondary hover:text-foreground border border-border active:scale-95 transition-all shadow-lg"
        aria-label="Open admin menu"
      >
        <Icon icon="mdi:menu" className="w-6 h-6" aria-hidden />
      </button>

      <div
        role="button"
        tabIndex={0}
        onClick={closeMobile}
        onKeyDown={(e) => e.key === "Escape" && closeMobile()}
        aria-hidden
        className={`
          lg:hidden fixed inset-0 bg-black/70 z-30 transition-opacity duration-200
          ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      />

      <div
        className={`hidden lg:block shrink-0 transition-[width] duration-200 ease-out ${desktopWidthClass}`}
        aria-hidden
      />

      <aside
        className={`
          w-[min(280px,85vw)] ${desktopWidthClass}
          flex flex-col bg-black border-r border-border/40
          fixed inset-y-0 left-0 z-40
          lg:top-(--app-header-height) lg:bottom-0 lg:h-[calc(100dvh-var(--app-header-height))]
          transform transition-[transform,width] duration-200 ease-out
          lg:translate-x-0
          shadow-xl lg:shadow-none lg:overflow-visible
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="relative flex h-full min-h-0 flex-col">
          <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border/60 shrink-0">
            <span className="text-sm font-semibold text-muted-foreground">Admin Menu</span>
            <button
              type="button"
              onClick={closeMobile}
              className="flex items-center justify-center w-10 h-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary active:scale-95 transition-all"
              aria-label="Close menu"
            >
              <Icon icon="mdi:close" className="w-6 h-6" aria-hidden />
            </button>
          </div>

          <div className={`px-2 pt-4 lg:pt-6 pb-2 shrink-0 ${collapsed ? "lg:hidden" : "px-4"}`}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Admin
            </p>
          </div>

          <nav className="flex flex-col gap-1 px-2 flex-1 overflow-y-auto overscroll-contain min-h-0">
            {adminNavItems.map((item) => {
              const { href, label, icon } = item;
              const exact = "exact" in item ? item.exact : false;
              const active = isActive(href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMobile}
                  title={collapsed ? label : undefined}
                  aria-current={active ? "page" : undefined}
                  aria-label={collapsed ? label : undefined}
                  className={`
                    flex items-center rounded-lg transition-colors
                    ${collapsed ? "lg:justify-center lg:px-0 lg:py-3" : "gap-3 px-3 py-3"}
                    ${active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                    }
                  `}
                >
                  <Icon
                    icon={icon}
                    className={`w-6 h-6 shrink-0 ${active ? "text-primary-foreground" : ""}`}
                    aria-hidden
                  />
                  <span className={`font-medium text-sm truncate ${collapsed ? "lg:hidden" : ""}`}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className={`shrink-0 px-2 py-4 border-t border-border/60 ${collapsed ? "lg:px-1" : ""}`}>
            <Link
              href="/dashboard"
              onClick={closeMobile}
              title={collapsed ? "Back to Mentee Dashboard" : undefined}
              aria-label={collapsed ? "Back to Mentee Dashboard" : undefined}
              className={`
                flex items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors
                ${collapsed ? "lg:justify-center lg:px-0 lg:py-3" : "gap-3 px-3 py-3"}
              `}
            >
              <Icon icon="mdi:arrow-left" className="w-5 h-5 shrink-0" aria-hidden />
              <span className={`font-medium text-sm ${collapsed ? "lg:hidden" : ""}`}>
                Back to Mentee Dashboard
              </span>
            </Link>
          </div>

          <button
            type="button"
            onClick={toggleCollapsed}
            className="hidden lg:flex absolute top-1/2 -right-3.5 z-50 h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-lg hover:bg-secondary hover:text-foreground hover:border-primary/40 active:scale-95 transition-all"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Icon
              icon={collapsed ? "mdi:chevron-right" : "mdi:chevron-left"}
              className="w-4 h-4 shrink-0"
              aria-hidden
            />
          </button>
        </div>
      </aside>
    </>
  );
}
