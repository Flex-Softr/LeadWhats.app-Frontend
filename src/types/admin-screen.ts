import type { AdminResponseMeta } from "@/types/admin-meta";

export type AdminScreenKpi = {
  label: string;
  value: string;
  hint?: string;
};

export type AdminScreenTable = {
  id: string;
  title: string;
  description?: string;
  columns: { field: string; header: string }[];
  rows: Record<string, string | number | null>[];
};

export type AdminScreenResponse = {
  moduleId: string;
  scope: "platform" | "workspace";
  generatedAt: string;
  meta: AdminResponseMeta;
  kpis: AdminScreenKpi[];
  tables: AdminScreenTable[];
  notes: string[];
};
