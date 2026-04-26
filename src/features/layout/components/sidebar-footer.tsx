"use client";

import Link from "next/link";

import { useAuth } from "@/components/providers/auth-provider";
import { isWorkspaceAdminRole } from "@/features/auth/components/require-workspace-admin";

export function SidebarFooter() {
  const { workspace } = useAuth();
  const showAdmin = isWorkspaceAdminRole(workspace?.role);

  return (
    <div className="mt-auto px-4 pb-2 pt-6">
      {showAdmin ? (
        <p className="mb-3 px-1 text-center">
          <Link
            href="/admin"
            className="text-[11px] font-semibold text-amber-700/90 hover:underline dark:text-amber-400/90"
          >
            Admin console →
          </Link>
        </p>
      ) : null}
      <p className="px-1 text-center text-[11px] leading-relaxed text-slate-400 dark:text-slate-600">
        FlexoWhats · crafted for modern messaging · ©{" "}
        {new Date().getFullYear()}
      </p>
    </div>
  );
}
