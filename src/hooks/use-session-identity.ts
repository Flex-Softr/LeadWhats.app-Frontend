"use client";

import { usePathname } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";

/**
 * Use in useEffect dependency arrays so data-fetching refires when the user
 * or workspace in the JWT-backed session changes (account switch, re-login),
 * or when the route changes (client navigation back to this screen).
 */
export function useSessionIdentity(): {
  userId: string;
  workspaceId: string;
  routeKey: string;
} {
  const { user, workspace } = useAuth();
  const pathname = usePathname();
  return {
    userId: user?.id ?? "",
    workspaceId: workspace?.id ?? "",
    routeKey: pathname,
  };
}
