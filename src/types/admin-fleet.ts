import type { AdminResponseMeta } from "@/types/admin-meta";

export type AdminFleetDeviceRow = {
  id: string;
  name: string;
  sessionId: string;
  status: string;
  phone: string | null;
  workspaceName: string;
  workspaceSlug: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminFleetKpi = {
  label: string;
  value: string;
  hint?: string;
};

export type AdminFleetStatusBreakdown = {
  status: string;
  count: number;
};

export type AdminFleetResponse = {
  scope: "platform" | "workspace";
  generatedAt: string;
  meta: AdminResponseMeta;
  kpis: AdminFleetKpi[];
  byStatus: AdminFleetStatusBreakdown[];
  devices: AdminFleetDeviceRow[];
};
