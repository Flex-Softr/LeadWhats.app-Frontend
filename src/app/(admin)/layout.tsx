import type { Metadata } from "next";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { RequireAuth } from "@/features/auth/components/require-auth";
import { RequireWorkspaceAdmin } from "@/features/auth/components/require-workspace-admin";

export const metadata: Metadata = {
  title: "Admin — FlexoWhats",
  description:
    "Operator console for tenants, billing, WhatsApp fleet, compliance, and platform health.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <RequireWorkspaceAdmin>
        <AdminShell>{children}</AdminShell>
      </RequireWorkspaceAdmin>
    </RequireAuth>
  );
}
