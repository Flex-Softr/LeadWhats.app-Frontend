export type PlanId = "free" | "pro" | "business";

export function isPlanId(value: string): value is PlanId {
  return value === "free" || value === "pro" || value === "business";
}

export type PaymentGatewayId = "stripe" | "sslcommerz";

export type PaymentGatewayMeta = {
  id: PaymentGatewayId;
  displayName: string;
  description: string;
  configured: boolean;
};

/** GET /v1/billing snapshot (workspace plan + gateway availability). */
export type BillingSnapshot = {
  planId: string;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  stripeConfigured: boolean;
  stripePortalEligible: boolean;
  paymentGateways: PaymentGatewayMeta[];
};

export function isPaymentGatewayId(value: string): value is PaymentGatewayId {
  return value === "stripe" || value === "sslcommerz";
}
