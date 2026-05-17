/** Authenticated workspace UI — all customer routes use this prefix. */
export const DASHBOARD_BASE = "/user/dashboard";

/**
 * Build a path under the dashboard, e.g. `dashboardPath("/devices")` →
 * `/user/dashboard/devices`. Empty or `/` returns the dashboard home.
 */
export function dashboardPath(subPath = ""): string {
  if (!subPath || subPath === "/") return DASHBOARD_BASE;
  const clean = subPath.startsWith("/") ? subPath : `/${subPath}`;
  return `${DASHBOARD_BASE}${clean}`;
}

export function isUnderContacts(pathname: string): boolean {
  const base = dashboardPath("/contacts");
  return pathname === base || pathname.startsWith(`${base}/`);
}
