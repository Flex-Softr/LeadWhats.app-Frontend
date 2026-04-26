import type { AdminResponseMeta } from "@/types/admin-meta";

export type AdminTenantRow = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  subscriptionStatus: string | null;
  memberCount: number;
  deviceCount: number;
  connectedDevices: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminTenantsKpi = {
  label: string;
  value: string;
  hint?: string;
};

export type AdminTenantsResponse = {
  scope: "platform" | "workspace";
  generatedAt: string;
  meta: AdminResponseMeta;
  kpis: AdminTenantsKpi[];
  tenants: AdminTenantRow[];
};
