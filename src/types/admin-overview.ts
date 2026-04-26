import type { AdminResponseMeta } from "@/types/admin-meta";

export type AdminOverviewKpiJson = {
  id: string;
  label: string;
  value: string;
  delta: string;
  positive: boolean;
  hint: string;
};

export type AdminModuleStatJson = {
  moduleId: string;
  label: string;
  value: string;
};

export type AdminOverviewResponse = {
  scope: "platform" | "workspace";
  generatedAt: string;
  meta: AdminResponseMeta;
  kpis: AdminOverviewKpiJson[];
  moduleStats: AdminModuleStatJson[];
};
