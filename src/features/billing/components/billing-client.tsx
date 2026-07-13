"use client";

import * as React from "react";
import Link from "next/link";
import {
  Check,
  CreditCard,
  Gem,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  WalletCards,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { BILLING_PLANS, isPaidPlan } from "@/config/plans";
import { useSubscription } from "@/features/billing/subscription-context";
import type { PaymentGatewayId, PlanId } from "@/types/billing";
import { ApiError, apiJson } from "@/lib/api";
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

type CheckoutResponse =
  | { url: string; gateway?: string }
  | { demo: true; planId: PlanId };

export function BillingClient() {
  const {
    planId,
    refreshPlan,
    resetToFreeDemo,
    subscriptionStatus,
    currentPeriodEnd,
    paymentGateways,
    hydrated,
  } = useSubscription();
  const [loading, setLoading] = React.useState<PlanId | null>(null);
  const [resetting, setResetting] = React.useState(false);
  const [gateway, setGateway] = React.useState<PaymentGatewayId>("sslcommerz");
  const [customerPhone, setCustomerPhone] = React.useState("");

  const sslReady = paymentGateways.find((g) => g.id === "sslcommerz")?.configured;
  const canCheckoutPaid =
    gateway === "stripe" || (gateway === "sslcommerz" && sslReady);

  React.useEffect(() => {
    const ssl = paymentGateways.find((g) => g.id === "sslcommerz");
    const st = paymentGateways.find((g) => g.id === "stripe");
    if (ssl?.configured) setGateway("sslcommerz");
    else if (st?.configured) setGateway("stripe");
  }, [paymentGateways]);

  async function startUpgrade(target: PlanId) {
    if (!isPaidPlan(target)) return;
    if (gateway === "sslcommerz" && !sslReady) {
      toast.error("SSLCommerz not configured", {
        description:
          "Set SSLCOMMERZ_STORE_ID and SSLCOMMERZ_STORE_PASSWORD on the API (sandbox for testing).",
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
      const data = await apiJson<CheckoutResponse>("/v1/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: target,
          gateway,
          ...(gateway === "sslcommerz"
            ? { customerPhone: customerPhone.trim() }
            : {}),
        }),
      });

      if ("demo" in data && data.demo) {
        await refreshPlan();
        toast.success("Plan upgraded (demo mode)", {
          description:
            "Stripe is not configured on the API, or prices are missing. Plan saved on your workspace.",
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
  const currentPlanName =
    planId === "free" ? "Free" : planId === "pro" ? "Pro" : "Business";

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6">
      <section className="grid gap-5 xl:grid-cols-12">
        <div className="relative min-h-[260px] overflow-hidden rounded-lg bg-gradient-to-br from-[#7a58d8] via-[#a777df] to-[#e166cc] px-6 py-7 text-white shadow-[0_22px_60px_rgba(101,67,164,0.22)] sm:px-8 xl:col-span-7">
          <div className="relative z-10 max-w-xl">
            <Badge className="mb-5 rounded-full border-white/25 bg-white/16 px-3 py-1 text-xs font-semibold text-white shadow-none">
              <Sparkles className="mr-1 size-3.5" />
              Billing control
            </Badge>
            <h2 className="max-w-lg text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              Choose the plan that fits your messaging scale
            </h2>
            <p className="mt-4 max-w-md text-sm font-medium leading-relaxed text-white/86">
              Upgrade devices, message volume, automation, and support from one
              polished billing workspace.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-lg bg-white/16 px-4 py-3 backdrop-blur-sm">
                <p className="text-[11px] font-semibold uppercase text-white/65">
                  Current plan
                </p>
                <p className="mt-1 text-xl font-extrabold">{currentPlanName}</p>
              </div>
              <div className="rounded-lg bg-white/16 px-4 py-3 backdrop-blur-sm">
                <p className="text-[11px] font-semibold uppercase text-white/65">
                  Status
                </p>
                <p className="mt-1 text-xl font-extrabold">
                  {subscriptionStatus ?? "Workspace"}
                </p>
              </div>
              {periodLabel ? (
                <div className="rounded-lg bg-white/16 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[11px] font-semibold uppercase text-white/65">
                    Period end
                  </p>
                  <p className="mt-1 text-xl font-extrabold">{periodLabel}</p>
                </div>
              ) : null}
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-5 right-6 hidden w-[245px] sm:block">
            <div className="relative aspect-square">
              <div className="absolute inset-7 rounded-full border-[28px] border-white/20" />
              <div className="absolute inset-7 rounded-full border-[28px] border-transparent border-t-white/75 border-r-white/75 rotate-45" />
              <div className="absolute inset-20 flex items-center justify-center rounded-full bg-white/20 text-2xl font-extrabold backdrop-blur">
                {planId === "business" ? "100%" : planId === "pro" ? "70%" : "30%"}
              </div>
              <WalletCards className="absolute left-3 top-8 size-16 text-white/22" />
            </div>
          </div>
        </div>

        <Card className="rounded-lg border-0 bg-white shadow-[0_18px_45px_rgba(77,53,128,0.08)] dark:bg-slate-900 xl:col-span-5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-extrabold text-[#251c32] dark:text-slate-50">
              <CreditCard className="size-5 text-[#6d45c8]" />
              Payment gateway
            </CardTitle>
            <CardDescription>
              Pick a provider before upgrading. SSLCommerz needs a contact
              phone; Stripe can run demo upgrades when keys are absent.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
            {paymentGateways.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGateway(g.id)}
                className={cn(
                  "rounded-lg border-0 p-4 text-left shadow-[inset_0_0_0_1px_rgba(110,69,200,0.1)] transition-all",
                  gateway === g.id
                    ? "bg-[#f0eaff] ring-2 ring-[#7d58d6]/30"
                    : "bg-[#faf8ff] hover:bg-[#f4efff] dark:bg-slate-950 dark:hover:bg-slate-800",
                  !g.configured && "opacity-70"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-[#251c32] dark:text-slate-50">
                    {g.displayName}
                  </span>
                  {g.configured ? (
                    <Badge className="rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700 shadow-none dark:bg-emerald-950 dark:text-emerald-300">
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
            <div className="space-y-2 rounded-lg bg-[#faf8ff] p-4 dark:bg-slate-950">
              <Label htmlFor="cus-phone">Contact phone (SSLCommerz)</Label>
              <Input
                id="cus-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="e.g. 01712345678"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="h-11 rounded-full border-0 bg-white px-4 shadow-inner shadow-violet-950/5 dark:bg-slate-900"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Required by SSLCommerz for receipts. Use a real number in
                production.
              </p>
            </div>
          ) : null}
            <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
              <strong className="font-semibold">Payments:</strong>{" "}
              {anyGatewayReady
                ? "A gateway is configured, so checkout can run below."
                : "Configure SSLCommerz and/or Stripe in the API .env to enable live checkouts."}
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        {BILLING_PLANS.map((plan) => {
          const current = plan.id === planId;
          const isPaid = isPaidPlan(plan.id);

          return (
            <Card
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-lg border-0 bg-white shadow-[0_18px_45px_rgba(77,53,128,0.08)] dark:bg-slate-900",
                plan.highlight && "overflow-visible",
                plan.highlight
                  ? "ring-2 ring-[#7d58d6]/35"
                  : "ring-1 ring-transparent"
              )}
            >
              {plan.highlight ? (
                <div className="absolute -top-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-r from-[#7d58d6] to-[#f05ad6] px-3 py-1 text-xs font-bold text-white shadow-md">
                  <Sparkles className="size-3.5" />
                  Popular
                </div>
              ) : null}
              <CardHeader className="pb-2 pt-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-[#f0eaff] text-[#6d45c8] dark:bg-slate-800 dark:text-violet-300">
                      {plan.id === "free" ? (
                        <ShieldCheck className="size-5" />
                      ) : plan.id === "pro" ? (
                        <Zap className="size-5" />
                      ) : (
                        <Gem className="size-5" />
                      )}
                    </span>
                    <CardTitle className="text-xl font-extrabold text-[#251c32] dark:text-slate-50">
                      {plan.name}
                    </CardTitle>
                  </div>
                  {current ? (
                    <Badge className="shrink-0 rounded-full bg-[#f0eaff] font-semibold text-[#5630a7] shadow-none">
                      Current
                    </Badge>
                  ) : null}
                </div>
                <CardDescription className="min-h-10">{plan.description}</CardDescription>
                <div className="pt-3">
                  <span className="text-4xl font-extrabold tracking-tight text-black dark:text-white">
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
                <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
                        <Check className="size-3.5" />
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="mt-auto flex flex-col gap-2 border-t border-[#eee9f8] pt-5 dark:border-slate-800">
                {current ? (
                  <Button type="button" variant="outline" className="h-11 w-full rounded-full" disabled>
                    Your current plan
                  </Button>
                ) : !isPaid ? (
                  <Button type="button" variant="outline" className="h-11 w-full rounded-full" disabled>
                    Downgrade via support
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className={cn(
                      "h-11 w-full rounded-full font-bold",
                      plan.highlight &&
                        "bg-gradient-to-r from-[#7d58d6] to-[#f05ad6] text-white shadow-[0_14px_28px_rgba(125,88,214,0.25)] hover:opacity-95"
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

      <Card className="rounded-lg border-0 bg-white shadow-[0_18px_45px_rgba(77,53,128,0.08)] dark:bg-slate-900">
        <CardContent className="flex flex-col gap-4 p-5 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between dark:text-slate-400">
          <div className="flex gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#f0eaff] text-[#6d45c8] dark:bg-slate-800 dark:text-violet-300">
              <RotateCcw className="size-5" />
            </span>
            <div>
              <p className="font-bold text-[#251c32] dark:text-slate-100">
                Reset workspace to Free
              </p>
              <p className="mt-1 max-w-2xl">
                Available when no active Stripe subscription is blocking it, and
                when any SSLCommerz-paid period has ended.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10 shrink-0 rounded-full"
            disabled={resetting}
            onClick={() => void onResetFree()}
          >
            {resetting ? "Resetting…" : "Reset to Free"}
          </Button>
        </CardContent>
      </Card>

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-500 dark:text-slate-400">
        <LockKeyhole className="size-3.5" />
        Secure hosted checkout. Questions?{" "}
        <Link href="/" className="font-medium text-primary hover:underline">
          Contact sales
        </Link>{" "}
        — prices exclude applicable taxes.
      </p>
    </div>
  );
}
