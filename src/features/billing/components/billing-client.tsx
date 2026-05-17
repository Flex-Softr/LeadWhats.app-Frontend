"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, CreditCard, ExternalLink, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { BILLING_PLANS, isPaidPlan } from "@/config/plans";
import { dashboardPath } from "@/config/app-routes";
import { useSubscription } from "@/features/billing/subscription-context";
import type { PaymentGatewayId, PlanId } from "@/types/billing";
import { ApiError } from "@/lib/api";
import {
  postBillingCheckout,
  postStripeBillingPortal,
} from "@/services/billing.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function BillingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    planId,
    refreshPlan,
    resetToFreeDemo,
    subscriptionStatus,
    currentPeriodEnd,
    paymentGateways,
    hydrated,
    stripePortalEligible,
  } = useSubscription();
  const [loading, setLoading] = React.useState<PlanId | null>(null);
  const [resetting, setResetting] = React.useState(false);
  const [gateway, setGateway] = React.useState<PaymentGatewayId>("sslcommerz");
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [portalLoading, setPortalLoading] = React.useState(false);

  const sslReady = paymentGateways.find((g) => g.id === "sslcommerz")?.configured;
  const stripeReady = paymentGateways.find((g) => g.id === "stripe")?.configured;
  const canCheckoutPaid =
    (gateway === "stripe" && Boolean(stripeReady)) ||
    (gateway === "sslcommerz" && Boolean(sslReady));

  React.useEffect(() => {
    const ssl = paymentGateways.find((g) => g.id === "sslcommerz");
    const st = paymentGateways.find((g) => g.id === "stripe");
    if (ssl?.configured) setGateway("sslcommerz");
    else if (st?.configured) setGateway("stripe");
  }, [paymentGateways]);

  React.useEffect(() => {
    const payment = searchParams.get("payment");
    const canceled = searchParams.get("canceled");
    if (canceled === "1") {
      toast.message("Checkout canceled", {
        id: "billing-return-canceled",
        description: "No charge was made. You can try again whenever you like.",
      });
      router.replace(dashboardPath("/billing"), { scroll: false });
      return;
    }
    if (!payment) return;

    const id = `billing-return-${payment}`;
    const lower = payment.toLowerCase();
    if (lower === "confirm_failed") {
      toast.error("Could not confirm payment", {
        id,
        description:
          "The gateway returned success but validation failed. Contact support if you were charged.",
      });
    } else if (lower === "invalid") {
      toast.error("Invalid return", {
        id,
        description: "Missing transaction reference from the payment gateway.",
      });
    } else if (lower === "failed" || lower === "expired" || lower === "unattempted") {
      toast.error("Payment not completed", {
        id,
        description: `Status: ${payment}. You can try checkout again.`,
      });
    } else if (lower === "canceled" || lower === "cancelled") {
      toast.message("Checkout canceled", {
        id,
        description: "No charge was made.",
      });
    } else if (lower === "unknown") {
      toast.error("Payment status unknown", {
        id,
        description: "Try again or contact support if a charge appears on your statement.",
      });
    } else {
      toast.message("Returned from checkout", {
        id,
        description: `Payment status: ${payment}`,
      });
    }
    router.replace(dashboardPath("/billing"), { scroll: false });
  }, [searchParams, router]);

  async function openStripePortal() {
    setPortalLoading(true);
    try {
      const { url } = await postStripeBillingPortal();
      window.location.href = url;
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Could not open the billing portal.";
      toast.error("Portal unavailable", { description: msg });
    } finally {
      setPortalLoading(false);
    }
  }

  async function startUpgrade(target: PlanId) {
    if (!isPaidPlan(target)) return;
    if (gateway === "sslcommerz" && !sslReady) {
      toast.error("SSLCommerz not configured", {
        description:
          "Set SSLCOMMERZ_STORE_ID and SSLCOMMERZ_STORE_PASSWORD on the API (sandbox for testing).",
      });
      return;
    }
    if (gateway === "stripe" && !stripeReady) {
      toast.error("Stripe not fully configured", {
        description:
          "Set STRIPE_SECRET_KEY plus STRIPE_PRICE_PRO_MONTHLY and STRIPE_PRICE_BUSINESS_MONTHLY (Stripe price_… / prod_…, or a decimal amount with STRIPE_CURRENCY) on the API.",
      });
      return;
    }
    if (gateway === "sslcommerz" && !customerPhone.trim()) {
      toast.error("Phone required", {
        description:
          "SSLCommerz needs a contact phone. Enter a valid number for receipts and support.",
      });
      return;
    }
    setLoading(target);
    try {
      const data = await postBillingCheckout({
        planId: target as Exclude<PlanId, "free">,
        gateway,
        ...(gateway === "sslcommerz"
          ? { customerPhone: customerPhone.trim() }
          : {}),
      });

      if ("demo" in data && data.demo) {
        await refreshPlan();
        toast.success("Plan upgraded (demo mode)", {
          description:
            "The API treated this as a demo upgrade. Check Stripe keys and price IDs if you expected live checkout.",
        });
        return;
      }

      if ("url" in data && data.url) {
        window.location.href = data.url;
        return;
      }
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Try again in a moment.";
      toast.error("Checkout failed", { description: msg });
    } finally {
      setLoading(null);
    }
  }

  async function onResetFree() {
    setResetting(true);
    try {
      await resetToFreeDemo();
      toast.message("Plan reset", {
        description: "Your workspace is on the Free plan.",
      });
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Could not reset. Try again.";
      toast.error("Reset failed", { description: msg });
    } finally {
      setResetting(false);
    }
  }

  const periodLabel =
    currentPeriodEnd && subscriptionStatus
      ? new Date(currentPeriodEnd).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : null;

  const anyGatewayReady = paymentGateways.some((g) => g.configured);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
          Plans &amp; billing
        </h2>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
          You are on the{" "}
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {planId === "free" ? "Free" : planId === "pro" ? "Pro" : "Business"}
          </span>{" "}
          plan. Choose a payment provider, then upgrade.
        </p>
        {subscriptionStatus ? (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Subscription status:{" "}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {subscriptionStatus}
            </span>
            {periodLabel ? (
              <>
                {" "}
                · Renews / period ends{" "}
                <span className="font-medium">{periodLabel}</span>
              </>
            ) : null}
          </p>
        ) : null}
        <p className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
          <strong className="font-semibold">Payments:</strong>{" "}
          {anyGatewayReady
            ? "At least one gateway is configured on the API — you can complete checkout below."
            : "Configure SSLCommerz and/or Stripe in the API environment (store credentials, Stripe price IDs, APP_PUBLIC_URL, API_PUBLIC_URL) to enable checkout."}{" "}
          Use SSLCommerz for hosted pay in Bangladesh; use Stripe for card subscriptions and the customer portal.
        </p>
      </div>

      {stripePortalEligible ? (
        <Card className="rounded-lg border border-slate-200/80 bg-white/90 dark:border-slate-800 dark:bg-slate-950/40">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ExternalLink className="size-5 text-violet-600 dark:text-violet-400" />
              Stripe subscription
            </CardTitle>
            <CardDescription>
              Update your payment method, view invoices, or cancel renewal in
              Stripe&apos;s secure customer portal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="secondary"
              className="rounded-xl"
              disabled={portalLoading}
              onClick={() => void openStripePortal()}
            >
              {portalLoading ? "Opening portal…" : "Open Stripe billing portal"}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card className="rounded-lg border border-slate-200/80 bg-white/90 dark:border-slate-800 dark:bg-slate-950/40">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="size-5 text-violet-600 dark:text-violet-400" />
            Payment gateway
          </CardTitle>
          <CardDescription>
            Select where you want to pay. SSLCommerz uses a hosted page (sandbox
            for testing); Stripe uses subscription checkout when configured.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {paymentGateways.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGateway(g.id)}
                className={cn(
                  "rounded-lg border p-4 text-left transition-colors",
                  gateway === g.id
                    ? "border-violet-500 bg-violet-50/80 ring-2 ring-violet-500/30 dark:border-violet-600 dark:bg-violet-950/40"
                    : "border-slate-200 bg-slate-50/50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/30",
                  !g.configured && "opacity-70"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-slate-900 dark:text-slate-50">
                    {g.displayName}
                  </span>
                  {g.configured ? (
                    <Badge variant="secondary" className="text-xs font-normal">
                      Ready
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs font-normal">
                      Not configured
                    </Badge>
                  )}
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {g.description}
                </p>
              </button>
            ))}
          </div>
          {gateway === "sslcommerz" ? (
            <div className="space-y-2">
              <Label htmlFor="cus-phone">Contact phone (SSLCommerz)</Label>
              <Input
                id="cus-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="e.g. 01712345678"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="max-w-md rounded-md py-4"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Required by SSLCommerz for receipts. Use a real number in
                production.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        {BILLING_PLANS.map((plan) => {
          const current = plan.id === planId;
          const isPaid = isPaidPlan(plan.id);

          return (
            <Card
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-lg border bg-white/90 shadow-sm backdrop-blur-md dark:bg-slate-950/60",
                plan.highlight && "overflow-visible",
                plan.highlight
                  ? "border-violet-400/60 shadow-md shadow-violet-500/10 dark:border-violet-600/50"
                  : "border-white/70 dark:border-slate-800/80"
              )}
            >
              {plan.highlight ? (
                <div className="absolute -top-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-1 text-xs font-semibold text-white shadow-md">
                  <Sparkles className="size-3.5" />
                  Popular
                </div>
              ) : null}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  {current ? (
                    <Badge variant="secondary" className="shrink-0 font-normal">
                      Current
                    </Badge>
                  ) : null}
                </div>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-3">
                  <span className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                    {plan.priceLabel}
                  </span>
                  {plan.priceUsd != null && plan.priceUsd > 0 ? (
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {" "}
                      / {plan.periodLabel}
                    </span>
                  ) : (
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {" "}
                      {plan.periodLabel}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3 pb-6">
                <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="mt-auto flex flex-col gap-2 border-t border-slate-100 pt-5 dark:border-slate-800">
                {current ? (
                  <Button type="button" variant="outline" className="w-full rounded-sm py-5" disabled>
                    Your current plan
                  </Button>
                ) : !isPaid ? (
                  <Button type="button" variant="outline" className="w-full rounded-sm py-5" disabled>
                    Downgrade via support
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className={cn(
                      "w-full",
                      plan.highlight &&
                        "bg-violet-600 text-white hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500 rounded-sm py-5"
                    )}
                    disabled={loading !== null || !hydrated || !canCheckoutPaid}
                    onClick={() => startUpgrade(plan.id)}
                  >
                    {loading === plan.id
                      ? "Redirecting…"
                      : `Upgrade to ${plan.name}`}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Card className="rounded-2xl border border-slate-200/80 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40">
        <CardContent className="flex flex-col gap-3 p-5 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between dark:text-slate-400">
          <p>
            Need the Free plan again? Resets your workspace when no active
            Stripe subscription is blocking it, and when your SSLCommerz-paid
            period has ended.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 rounded-sm py-4"
            disabled={resetting}
            onClick={() => void onResetFree()}
          >
            {resetting ? "Resetting…" : "Reset to Free"}
          </Button>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        Questions?{" "}
        <Link href={dashboardPath()} className="font-medium text-primary hover:underline">
          Contact sales
        </Link>{" "}
        — prices exclude applicable taxes.
      </p>
    </div>
  );
}
