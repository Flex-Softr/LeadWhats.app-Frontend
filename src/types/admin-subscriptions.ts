import type { AdminResponseMeta } from "@/types/admin-meta";

export type AdminSubscriptionWorkspaceRow = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  updatedAt: string;
};

export type AdminSubscriptionsKpi = {
  label: string;
  value: string;
  hint?: string;
};

export type AdminSubscriptionsResponse = {
  scope: "platform" | "workspace";
  generatedAt: string;
  meta: AdminResponseMeta;
  kpis: AdminSubscriptionsKpi[];
  workspaces: AdminSubscriptionWorkspaceRow[];
};
