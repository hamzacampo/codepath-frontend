/** Routes that use the full-viewport problem solver (no header, footer, or dashboard sidebar). */
export function isImmersiveProblemRoute(pathname: string): boolean {
  if (/^\/dashboard\/problems\/cf\/\d+\/[^/]+/.test(pathname)) return true;
  if (/^\/dashboard\/problems\/(?!cf\/)[^/]+$/.test(pathname)) return true;
  return false;
}

export function isDashboardRoute(pathname: string): boolean {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

export function isAdminRoute(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

/** Dashboard and admin use an internal scroll container instead of the site footer. */
export function usesDashboardShell(pathname: string): boolean {
  return (isDashboardRoute(pathname) || isAdminRoute(pathname)) && !isImmersiveProblemRoute(pathname);
}
