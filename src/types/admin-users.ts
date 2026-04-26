import type { AdminResponseMeta } from "@/types/admin-meta";

export type AdminUserRow = {
  userId: string;
  email: string;
  name: string | null;
  role: string;
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
  joinedAt: string;
  userCreatedAt: string;
  userUpdatedAt: string;
};

export type AdminUsersKpi = {
  label: string;
  value: string;
  hint?: string;
};

export type AdminUsersResponse = {
  scope: "platform" | "workspace";
  generatedAt: string;
  meta: AdminResponseMeta;
  kpis: AdminUsersKpi[];
  rows: AdminUserRow[];
};
