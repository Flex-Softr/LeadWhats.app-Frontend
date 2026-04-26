"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { licenseFromPlan } from "@/features/billing/lib/license-from-plan";
import { apiJson } from "@/lib/api";
import {
  isPlanId,
  type PaymentGatewayMeta,
  type PlanId,
} from "@/types/billing";
import type { UserLicense } from "@/types/dashboard";

type BillingApiResponse = {
  planId: string;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  stripeConfigured: boolean;
  paymentGateways: PaymentGatewayMeta[];
};

type SubscriptionContextValue = {
  planId: PlanId;
  license: UserLicense;
  /** True after auth + billing snapshot loaded (or skipped when logged out). */
  hydrated: boolean;
  stripeConfigured: boolean;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  /** Reload plan from API (after checkout, webhook delay, etc.). */
  refreshPlan: () => Promise<void>;
  /** Optimistic local update; prefer refreshPlan when server is source of truth. */
  setPlan: (plan: PlanId) => void;
  resetToFreeDemo: () => Promise<void>;
  /** Available payment providers (from API). */
  paymentGateways: PaymentGatewayMeta[];
};

const SubscriptionContext = React.createContext<SubscriptionContextValue | null>(
  null
);

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isBootstrapping: authBootstrapping, workspace } = useAuth();
  const [planId, setPlanId] = React.useState<PlanId>("free");
  const [hydrated, setHydrated] = React.useState(false);
  const [stripeConfigured, setStripeConfigured] = React.useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = React.useState<
    string | null
  >(null);
  const [currentPeriodEnd, setCurrentPeriodEnd] = React.useState<string | null>(
    null
  );
  const [paymentGateways, setPaymentGateways] = React.useState<
    PaymentGatewayMeta[]
  >([]);

  const applyBillingPayload = React.useCallback((data: BillingApiResponse) => {
    if (isPlanId(data.planId)) {
      setPlanId(data.planId);
    }
    setStripeConfigured(data.stripeConfigured);
    setSubscriptionStatus(data.subscriptionStatus);
    setCurrentPeriodEnd(data.currentPeriodEnd);
    setPaymentGateways(data.paymentGateways ?? []);
  }, []);

  const refreshPlan = React.useCallback(async () => {
    if (!user) {
      setPlanId("free");
      setStripeConfigured(false);
      setSubscriptionStatus(null);
      setCurrentPeriodEnd(null);
      setPaymentGateways([]);
      return;
    }
    const data = await apiJson<BillingApiResponse>("/v1/billing");
    applyBillingPayload(data);
  }, [user, applyBillingPayload]);

  React.useEffect(() => {
    if (authBootstrapping) return;

    let cancelled = false;
    (async () => {
      if (!user) {
        if (!cancelled) {
          setPlanId("free");
          setStripeConfigured(false);
          setSubscriptionStatus(null);
          setCurrentPeriodEnd(null);
          setPaymentGateways([]);
          setHydrated(true);
        }
        return;
      }

      try {
        const data = await apiJson<BillingApiResponse>("/v1/billing");
        if (!cancelled) {
          applyBillingPayload(data);
        }
      } catch {
        if (!cancelled) {
          setPlanId("free");
        }
      } finally {
        if (!cancelled) {
          setHydrated(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authBootstrapping, user, workspace?.id, applyBillingPayload, pathname]);

  const setPlan = React.useCallback((plan: PlanId) => {
    setPlanId(plan);
  }, []);

  const resetToFreeDemo = React.useCallback(async () => {
    await apiJson("/v1/billing/reset-to-free", { method: "POST" });
    await refreshPlan();
  }, [refreshPlan]);

  const license = React.useMemo(() => licenseFromPlan(planId), [planId]);

  const value = React.useMemo(
    () => ({
      planId,
      license,
      hydrated,
      stripeConfigured,
      subscriptionStatus,
      currentPeriodEnd,
      refreshPlan,
      setPlan,
      resetToFreeDemo,
      paymentGateways,
    }),
    [
      planId,
      license,
      hydrated,
      stripeConfigured,
      subscriptionStatus,
      currentPeriodEnd,
      refreshPlan,
      setPlan,
      resetToFreeDemo,
      paymentGateways,
    ]
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = React.useContext(SubscriptionContext);
  if (!ctx) {
    throw new Error("useSubscription must be used within SubscriptionProvider");
  }
  return ctx;
}
