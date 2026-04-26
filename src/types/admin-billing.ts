import type { AdminResponseMeta } from "@/types/admin-meta";

export type AdminBillingWorkspaceRow = {
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

export type AdminBillingWebhookRow = {
  stripeEventId: string;
  type: string;
  processedAt: string;
};

export type AdminBillingKpi = {
  label: string;
  value: string;
  hint?: string;
};

export type AdminBillingResponse = {
  scope: "platform" | "workspace";
  generatedAt: string;
  meta: AdminResponseMeta;
  stripeConfigured: boolean;
  kpis: AdminBillingKpi[];
  workspaces: AdminBillingWorkspaceRow[];
  recentWebhookEvents: AdminBillingWebhookRow[];
};
