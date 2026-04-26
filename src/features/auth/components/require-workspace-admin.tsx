"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/providers/auth-provider";

type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER";

export function isWorkspaceAdminRole(role: WorkspaceRole | undefined): boolean {
  return role === "OWNER" || role === "ADMIN";
}

/**
 * Allows only workspace OWNER and ADMIN. MEMBER is redirected to the dashboard.
 * Use inside {@link RequireAuth} so `user` and `workspace` are present after bootstrap.
 */
export function RequireWorkspaceAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, workspace, isBootstrapping } = useAuth();
  const router = useRouter();
  const denied =
    !isBootstrapping && !!user && !!workspace && !isWorkspaceAdminRole(workspace.role);

  React.useEffect(() => {
    if (!denied) return;
    toast.error("Access denied", {
      description:
        "The admin console is only available to workspace owners and admins.",
    });
    router.replace("/");
  }, [denied, router]);

  if (isBootstrapping) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
        <Loader2 className="size-8 animate-spin text-violet-600 dark:text-violet-400" />
        <p className="text-sm">Loading your session…</p>
      </div>
    );
  }

  if (!user || !workspace) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
        <Loader2 className="size-8 animate-spin text-violet-600 dark:text-violet-400" />
        <p className="text-sm">Loading your workspace…</p>
      </div>
    );
  }

  if (!isWorkspaceAdminRole(workspace.role)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500 dark:text-slate-400">
        Redirecting…
      </div>
    );
  }

  return <>{children}</>;
}
