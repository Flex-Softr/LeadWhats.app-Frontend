import type { AdminResponseMeta } from "@/types/admin-meta";

export type AdminComplianceKpi = {
  label: string;
  value: string;
  hint?: string;
};

export type AdminComplianceBreakdown = {
  key: string;
  count: number;
};

export type AdminComplianceTemplateRow = {
  id: string;
  name: string;
  waTemplateName: string;
  active: boolean;
  language: string;
  category: string;
  workspaceName: string;
  workspaceSlug: string;
  updatedAt: string;
};

export type AdminComplianceResponse = {
  scope: "platform" | "workspace";
  generatedAt: string;
  meta: AdminResponseMeta;
  kpis: AdminComplianceKpi[];
  contactByStatus: AdminComplianceBreakdown[];
  bulkCampaignByStatus: AdminComplianceBreakdown[];
  templates: AdminComplianceTemplateRow[];
};
