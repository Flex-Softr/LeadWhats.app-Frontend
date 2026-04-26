import type { AdminResponseMeta } from "@/types/admin-meta";

export type AdminModerationKpi = {
  label: string;
  value: string;
  hint?: string;
};

export type AdminModerationFailureRow = {
  id: string;
  toPhone: string;
  kind: string;
  errorMessage: string | null;
  workspaceName: string;
  workspaceSlug: string;
  deviceName: string;
  bulkCampaignName: string | null;
  createdAt: string;
};

export type AdminModerationWorkspaceLeader = {
  name: string;
  slug: string;
  failed30d: number;
};

export type AdminModerationResponse = {
  scope: "platform" | "workspace";
  generatedAt: string;
  meta: AdminResponseMeta;
  kpis: AdminModerationKpi[];
  recentFailures: AdminModerationFailureRow[];
  topFailedWorkspaces: AdminModerationWorkspaceLeader[];
};
