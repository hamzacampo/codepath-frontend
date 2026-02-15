"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";

const navItems = [
  { href: "/dashboard", label: "CodePrint", icon: "fluent-mdl2:analytics-view" },
  { href: "/dashboard/problemset", label: "Problemset", icon: "mdi:set" },
  { href: "/dashboard/favourites", label: "Favorite Problems", icon: "mdi:heart" },
  { href: "/dashboard/roadmap", label: "My Roadmap", icon: "eos-icons:machine-learning-outlined" },
  { href: "/dashboard/profile", label: "Profile", icon: "iconamoon:profile" },
] as const;

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile menu button - middle left so navbar stays visible */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed left-4 top-1/2 -translate-y-1/2 z-60 flex items-center justify-center w-11 h-11 rounded-xl bg-gray-900 text-gray-300 hover:bg-gray-800 hover:text-white border border-gray-700 active:scale-95 transition-all shadow-lg"
        aria-label="Open dashboard menu"
      >
        <Icon icon="mdi:menu" className="w-6 h-6" aria-hidden />
      </button>

      {/* Backdrop when sidebar is open on mobile */}
      <div
        role="button"
        tabIndex={0}
        onClick={closeMobile}
        onKeyDown={(e) => e.key === "Escape" && closeMobile()}
        aria-hidden
        className={`
          lg:hidden fixed inset-0 bg-black/70 z-55 transition-opacity duration-200
          ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      />

      {/* Sidebar panel - drawer on mobile, static on desktop */}
      <aside
        className={`
          w-[min(280px,85vw)] lg:w-56 min-h-screen flex flex-col py-6 bg-black shrink-0
          fixed lg:static inset-y-0 left-0 z-60
          transform transition-transform duration-200 ease-out
          lg:translate-x-0 lg:transform-none
          shadow-xl lg:shadow-none
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Close button - visible only on mobile when sidebar is open */}
        <div className="lg:hidden flex items-center justify-between px-4 pb-3 border-b border-gray-800">
          <span className="text-sm font-semibold text-gray-300">Menu</span>
          <button
            type="button"
            onClick={closeMobile}
            className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 active:scale-95 transition-all"
            aria-label="Close menu"
          >
            <Icon icon="mdi:close" className="w-6 h-6" aria-hidden />
          </button>
        </div>
        <nav className="flex flex-col gap-1 px-3 pt-4 lg:pt-6">
          {navItems.map(({ href, label, icon }) => {
            const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={closeMobile}
                aria-current={isActive ? "page" : undefined}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive
                    ? "bg-[#7c3aed] text-white"
                    : "text-gray-400 hover:text-gray-300 hover:bg-gray-900/50"
                  }
                `}
              >
                <Icon
                  icon={icon}
                  className={`w-6 h-6 shrink-0 ${isActive ? "text-white" : "text-gray-400"}`}
                  aria-hidden
                />
                <span className="font-medium text-sm">{label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
