"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { useIsAdmin } from "@/store/auth-store";
import { useDashboardSidebar } from "@/components/layout/DashboardSidebarContext";

const navItems = [
  { href: "/dashboard", label: "CodePrint", icon: "fluent-mdl2:analytics-view" },
  { href: "/dashboard/problemset", label: "Problemset", icon: "mdi:set" },
  { href: "/dashboard/contests", label: "Contests", icon: "mdi:trophy-outline" },
  { href: "/dashboard/favourites", label: "Favorite Problems", icon: "mdi:heart" },
  { href: "/dashboard/roadmap", label: "My Roadmap", icon: "eos-icons:machine-learning-outlined" },
  { href: "/dashboard/coaches", label: "Coaching Sessions", icon: "mdi:account-tie-outline" },
  { href: "/dashboard/reference", label: "Reference", icon: "mdi:book-open-outline" },
  { href: "/dashboard/peers", label: "Nearby Peers", icon: "mdi:account-group-outline" },
  { href: "/dashboard/profile", label: "Profile", icon: "iconamoon:profile" },
] as const;

const adminNavItem = {
  href: "/admin",
  label: "Admin",
  icon: "mdi:shield-account-outline",
} as const;

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { collapsed, toggleCollapsed } = useDashboardSidebar();
  const isAdmin = useIsAdmin();

  const closeMobile = () => setMobileOpen(false);

  const allNavItems = isAdmin ? [...navItems, adminNavItem] : navItems;

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

  const desktopWidthClass = collapsed ? "lg:w-[4.5rem]" : "lg:w-56";

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed left-4 top-[calc(var(--app-header-height)+0.75rem)] z-40 flex items-center justify-center w-11 h-11 rounded-xl bg-card text-muted-foreground hover:bg-secondary hover:text-foreground border border-border active:scale-95 transition-all shadow-lg"
        aria-label="Open dashboard menu"
      >
        <Icon icon="mdi:menu" className="w-6 h-6" aria-hidden />
      </button>

      {/* Mobile backdrop */}
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

      {/* Desktop spacer — reserves horizontal space while aside is fixed */}
      <div
        className={`hidden lg:block shrink-0 transition-[width] duration-200 ease-out ${desktopWidthClass}`}
        aria-hidden
      />

      {/* Sidebar */}
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
          <span className="text-sm font-semibold text-muted-foreground">Menu</span>
          <button
            type="button"
            onClick={closeMobile}
            className="flex items-center justify-center w-10 h-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary active:scale-95 transition-all"
            aria-label="Close menu"
          >
            <Icon icon="mdi:close" className="w-6 h-6" aria-hidden />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-2 py-4 lg:py-6 overflow-y-auto overscroll-contain min-h-0">
          {allNavItems.map(({ href, label, icon }) => {
            const isActive =
              pathname === href ||
              (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={closeMobile}
                title={collapsed ? label : undefined}
                aria-current={isActive ? "page" : undefined}
                aria-label={collapsed ? label : undefined}
                className={`
                  flex items-center rounded-lg transition-colors
                  ${collapsed ? "lg:justify-center lg:px-0 lg:py-3" : "gap-3 px-3 py-3"}
                  ${isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  }
                `}
              >
                <Icon
                  icon={icon}
                  className={`w-6 h-6 shrink-0 ${isActive ? "text-primary-foreground" : ""}`}
                  aria-hidden
                />
                <span
                  className={`font-medium text-sm truncate ${collapsed ? "lg:hidden" : ""}`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop collapse — pops out from the right edge */}
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
