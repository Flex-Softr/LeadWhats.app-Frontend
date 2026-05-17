import type { BillingSnapshot, PaymentGatewayId, PlanId } from "@/types/billing";
import { apiJson } from "@/lib/api";

export async function fetchBillingSnapshot(): Promise<BillingSnapshot> {
  return apiJson<BillingSnapshot>("/v1/billing");
}

type CheckoutResponse =
  | { url: string; gateway?: string }
  | { demo: true; planId: PlanId };

export async function postBillingCheckout(body: {
  planId: Exclude<PlanId, "free">;
  gateway: PaymentGatewayId;
  customerPhone?: string;
}): Promise<CheckoutResponse> {
  return apiJson<CheckoutResponse>("/v1/billing/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function getBillingConfirm(sessionId: string): Promise<{
  planId: string;
  demo: boolean;
}> {
  return apiJson(
    `/v1/billing/confirm?session_id=${encodeURIComponent(sessionId)}`
  );
}

export async function postBillingResetToFree(): Promise<void> {
  await apiJson("/v1/billing/reset-to-free", { method: "POST" });
}

export async function postStripeBillingPortal(): Promise<{ url: string }> {
  return apiJson<{ url: string }>("/v1/billing/stripe-portal", {
    method: "POST",
  });
}
