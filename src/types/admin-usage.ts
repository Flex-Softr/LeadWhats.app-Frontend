import type { AdminResponseMeta } from "@/types/admin-meta";

export type AdminUsageKpi = {
  label: string;
  value: string;
  hint?: string;
};

export type AdminUsageBreakdown = {
  key: string;
  count: number;
};

export type AdminUsageWorkspaceLeader = {
  name: string;
  slug: string;
  outbound30d: number;
};

export type AdminUsageInventory = {
  templates: number;
  contacts: number;
  contactGroups: number;
  bulkCampaigns: number;
  autoReplyRules: number;
  chatbotFlows: number;
  liveChatThreads: number;
};

export type AdminUsageResponse = {
  scope: "platform" | "workspace";
  generatedAt: string;
  meta: AdminResponseMeta;
  kpis: AdminUsageKpi[];
  outbound: {
    last24h: number;
    previous24h: number;
    last7d: number;
    last30d: number;
    failed24h: number;
  };
  byStatus30d: AdminUsageBreakdown[];
  byKind30d: AdminUsageBreakdown[];
  inventory: AdminUsageInventory;
  topWorkspaces: AdminUsageWorkspaceLeader[];
};
