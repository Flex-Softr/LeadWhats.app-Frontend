"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  CreditCard,
  MessageCircle,
  MessageSquare,
  MessagesSquare,
  Reply,
  Shield,
  Smartphone,
  Zap,
  ChevronDown,
} from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { BILLING_PLANS } from "@/config/plans";
import { dashboardPath } from "@/config/app-routes";
import { LandingComplaintSection } from "@/features/landing/components/landing-complaint-section";
import { LandingNavbar } from "@/features/landing/components/landing-navbar";
import { ScrollReveal } from "@/features/landing/components/scroll-reveal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import StatsSection from "./landing-state";

const FEATURE_CARDS = [
  {
    title: "Multi-device workspace",
    description:
      "Connect WhatsApp sessions, monitor health, and switch devices without losing context.",
    icon: Smartphone,
  },
  {
    title: "Templates & rich sends",
    description:
      "Build reusable templates for text, media, and interactive flows—then ship with confidence.",
    icon: MessageSquare,
  },
  {
    title: "Bulk campaigns",
    description:
      "Launch compliant broadcasts with scheduling, progress, and per-recipient outcomes.",
    icon: MessagesSquare,
  },
  {
    title: "Auto-reply rules",
    description:
      "Keyword triggers, instant acknowledgements, and guardrails tuned for high volume.",
    icon: Reply,
  },
  {
    title: "Chatbot flows",
    description:
      "Guide conversations with branching flows, capture intent, and hand off to humans.",
    icon: Bot,
  },
  {
    title: "Live inbox & analytics",
    description:
      "Live chat, call responder hooks, group insights, and KPIs in one glass dashboard.",
    icon: BarChart3,
  },
] as const;

const STEPS = [
  {
    title: "Connect your workspace",
    body: "Create a FlexoWhats workspace, invite your team, and link WhatsApp sessions securely.",
  },
  {
    title: "Design messages & automations",
    body: "Compose templates, auto-replies, chatbots, and campaigns with previews before you send.",
  },
  {
    title: "Measure & iterate",
    body: "Track delivery, engagement, and system status—then optimize with built-in analytics.",
  },
] as const;

const FAQS = [
  {
    q: "Is FlexoWhats the same as the WhatsApp consumer app?",
    a: "FlexoWhats is a separate automation studio for teams. You control official or bridge-backed sessions from the dashboard while staying aligned with WhatsApp policies.",
  },
  {
    q: "Which payment options are supported?",
    a: "Billing supports Stripe cards where configured, plus SSLCommerz for hosted checkout popular in Bangladesh—your workspace admin picks the gateway in-app.",
  },
  {
    q: "Can I start on the Free plan?",
    a: "Yes. Free includes core automation paths so you can validate workflows before upgrading to Pro or Business for higher limits and premium support.",
  },
] as const;

export function LandingPage() {
  const { user, isAuthenticated, isBootstrapping } = useAuth();
  const [scrolled, setScrolled] = React.useState(false);
  const [scrollY, setScrollY] = React.useState(0);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  const parallax = React.useCallback(
    (factor: number) => {
      if (typeof window === "undefined") return 0;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return 0;
      return scrollY * factor;
    },
    [scrollY]
  );

  React.useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      setScrollY(window.scrollY);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.45] dark:opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgb(148 163 184 / 0.09) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(148 163 184 / 0.09) 1px, transparent 1px)
          `,
          backgroundSize: "56px 56px",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed -left-32 top-24 -z-10 size-[420px] rounded-full bg-gradient-to-br from-violet-500/25 via-fuchsia-500/15 to-transparent blur-3xl lw-animate-float"
        style={{ transform: `translate3d(0, ${parallax(0.06)}px, 0)` }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed -right-24 bottom-32 -z-10 size-[380px] rounded-full bg-gradient-to-bl from-indigo-500/20 via-violet-500/10 to-transparent blur-3xl lw-animate-float-delayed"
        style={{ transform: `translate3d(0, ${parallax(-0.05)}px, 0)` }}
        aria-hidden
      />

      <LandingNavbar
        scrolled={scrolled}
        mobileNavOpen={mobileNavOpen}
        setMobileNavOpen={setMobileNavOpen}
      />

      <main>
        <section className="relative  ">
        <section className="bg-gradient-to-r from-violet-800/05 via-fuchsia-300/20 dark:via-fuchsia-900/35 to-blue-800/05">
          <div className="mx-auto min-h-[calc(110vh-30px)] md:min-h-[calc(110vh-0px)] max-w-5xl text-center px-4 sm:px-6  lg:px-8 pb-10 pt-32  sm:pt-16  lg:pt-16">
            <div className="flex flex-col items-center justify-center min-h-[calc(110vh-10px)] md:min-h-[calc(110vh-0px)]">
            <ScrollReveal>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/80 px-4 py-1.5 md:text-xs text-[10px] font-semibold uppercase tracking-wider text-violet-700 shadow-sm backdrop-blur dark:border-violet-500/30 dark:bg-slate-900/60 dark:text-violet-200">
                <Zap className="size-3.5" />
                WhatsApp automation studio
              </div>
            </ScrollReveal>
            <ScrollReveal delayMs={60}>
              <h1 className="font-heading text-3xl md:text-4xl font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-6xl">
                <span className="block text-slate-900 dark:text-white">Scale conversations</span>
                <span className="mt-2 block bg-gradient-to-r from-violet-900 via-fuchsia-500 to-blue-600 bg-clip-text text-transparent lw-animate-gradient-text dark:from-violet-900 dark:via-fuchsia-500 dark:to-blue-900">
                  without losing the human touch
                </span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delayMs={120}>
              <p className="mx-auto mt-6 max-w-2xl text-sm md:text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
                FlexoWhats unifies devices, templates, bulk sends, auto-replies, chatbots, live chat, and
                billing—so your team can orchestrate WhatsApp like a product, not a patchwork of tools.
              </p>
            </ScrollReveal>
            <ScrollReveal delayMs={180}>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                {!isBootstrapping && isAuthenticated && user ? (
                  <Button
                    size="lg"
                    className="h-12 min-w-[200px] rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 text-base text-white shadow-lg shadow-violet-500/30 hover:from-violet-500 hover:to-fuchsia-500"
                    render={<Link href={dashboardPath()} />}
                  >
                    Go to dashboard
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="h-12 min-w-[200px] rounded-lg border-none bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 text-base text-white shadow-lg shadow-violet-500/30 hover:from-violet-500 hover:to-fuchsia-500"
                    render={<Link href="/register" />}
                  >
                    Start free
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                )}
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 min-w-[200px] rounded-lg border-slate-200/90 bg-white/70 backdrop-blur dark:border-slate-700 dark:bg-slate-900/50"
                  render={<Link href={dashboardPath()} />}
                >
                  Open dashboard
                </Button>
              </div>
            </ScrollReveal>
            {!isBootstrapping && !isAuthenticated ? (
              <ScrollReveal delayMs={220}>
                <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                  Already registered?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-violet-600 underline-offset-4 hover:underline dark:text-violet-300"
                  >
                    Sign in
                  </Link>
                </p>
              </ScrollReveal>
            ) : null}
             <ScrollReveal delayMs={230}>
            <StatsSection></StatsSection>
            </ScrollReveal>
            </div>
          </div>
          </section>

          {/* <ScrollReveal delayMs={140} className="relative mx-auto mt-32 mb-20 max-w-5xl px-4 sm:px-6  lg:px-8">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-violet-500/20 via-fuchsia-500/15 to-indigo-500/20 blur-3xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/70 p-6 shadow-2xl shadow-violet-500/10 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/50 sm:p-10">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-6 dark:border-slate-700/80">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-300">
                    Live workspace
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                    KPIs, campaigns, and system status
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-200">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                  </span>
                  Bridge ready
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Active devices", value: "5 sessions", icon: Smartphone },
                  { label: "30-day sends", value: "12.4k", icon: MessageCircle },
                  { label: "Automations on", value: "24 flows", icon: Bot },
                ].map((k) => (
                  <div
                    key={k.label}
                    className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-700/80 dark:bg-slate-950/40"
                  >
                    <k.icon className="size-5 text-violet-600 dark:text-violet-300" />
                    <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      {k.value}
                    </p>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{k.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal> */}
        </section>

        <section
          id="features"
          className="scroll-mt-24 border-y border-slate-200/60 bg-white/50 py-20 dark:border-slate-800/60 dark:bg-slate-900/30"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                Everything you need to run WhatsApp at scale
              </h2>
              <p className="mt-4 text-slate-600 dark:text-slate-300">
                Purpose-built modules mirror your real workflows—from first template to enterprise-grade
                billing and compliance-friendly sends.
              </p>
            </ScrollReveal>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURE_CARDS.map((card, i) => (
                <ScrollReveal key={card.title} delayMs={i * 70}>
                  <div className="group relative h-full overflow-hidden cursor-pointer rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/80 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/10 dark:border-slate-800/80 dark:from-slate-900/80 dark:to-slate-950/80 dark:hover:border-violet-500/40 hover:bg-gradient-to-r hover:from-violet-800/30 hover:via-fuchsia-600/20 hover:to-indigo-600/20 transition-all duration-300 hover:text-white">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-700 ring-1 ring-violet-500/15 dark:text-violet-200">
                      <card.icon className="size-5" strokeWidth={2} />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{card.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {card.description}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section id="how" className="scroll-mt-24 py-20 bg-gradient-to-r from-violet-800/05 via-fuchsia-300/20 dark:via-fuchsia-900/35 to-blue-800/05">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <ScrollReveal>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                  Ship faster with a guided operating model
                </h2>
                <p className="mt-4 text-slate-600 dark:text-slate-300">
                  FlexoWhats keeps messaging, automation, and monetization in one control plane—so operators
                  and engineers stay aligned.
                </p>
                <ul className="mt-8 space-y-6">
                  {STEPS.map((step, idx) => (
                    <ScrollReveal key={step.title} delayMs={idx * 90}>
                      <li className="flex gap-4">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-sm font-bold text-white shadow-md">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{step.title}</p>
                          <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                            {step.body}
                          </p>
                        </div>
                      </li>
                    </ScrollReveal>
                  ))}
                </ul>
              </ScrollReveal>
              <ScrollReveal delayMs={120}>
                <div className="relative rounded-[1.75rem] border border-slate-200/80 bg-gradient-to-br from-violet-600/10 via-fuchsia-500/5 to-indigo-600/10 p-8 dark:border-slate-800/80">
                  <Shield className="size-10 text-violet-600 dark:text-violet-300" />
                  <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">
                    Enterprise-friendly guardrails
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    Role-aware workspaces, subscription state in-product, and clear separation between admin
                    consoles and customer automation—all designed for teams that take compliance seriously.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {["Workspace roles", "Stripe & SSLCommerz", "Audit-friendly logs"].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-lg border border-white/40 bg-white/60 px-3 py-1 text-xs font-medium text-slate-700 backdrop-blur dark:border-slate-700/80 dark:bg-slate-900/60 dark:text-slate-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section
          id="pricing"
          className="scroll-mt-24 border-y border-slate-200/60 bg-white/50 py-20 dark:border-slate-800/60 dark:bg-slate-900/30"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                Simple plans that grow with you
              </h2>
              <p className="mt-4 text-slate-600 dark:text-slate-300">
                Pricing shown matches the in-app catalog. Upgrade anytime from{" "}
                <Link
                  href={dashboardPath("/billing")}
                  className="font-semibold text-violet-600 underline-offset-4 hover:underline dark:text-violet-300"
                >
                  Plans &amp; billing
                </Link>
                .
              </p>
            </ScrollReveal>
            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {BILLING_PLANS.map((plan, i) => (
                <ScrollReveal key={plan.id} delayMs={i * 80}>
                  <div
                    className={cn(
                      "relative flex h-full flex-col rounded-xl cursor-pointer border bg-gradient-to-b p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:scale-103",
                      plan.highlight
                        ? "border-violet-400/60 from-violet-50/90 to-white shadow-violet-500/15 dark:border-violet-500/50 dark:from-violet-950/50 dark:to-slate-950/80"
                        : "border-slate-200/80 from-white to-slate-50/80 dark:border-slate-800/80 dark:from-slate-900/80 dark:to-slate-950/80"
                    )}
                  >
                    {plan.highlight ? (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-md">
                        Most popular
                      </span>
                    ) : null}
                    <div className="flex items-center gap-2">
                      <CreditCard className="size-5 text-violet-600 dark:text-violet-300" />
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{plan.name}</h3>
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{plan.description}</p>
                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {plan.priceLabel}
                      </span>
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        / {plan.periodLabel}
                      </span>
                    </div>
                    <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                      {plan.features.map((f) => (
                        <li key={f} className="flex gap-2">
                          <Check className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={cn(
                        "mt-8 h-11 w-full rounded-lg",
                        plan.highlight
                          ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md hover:from-violet-500 hover:to-fuchsia-500"
                          : " hover:bg-gradient-to-r hover:from-violet-600 hover:to-fuchsia-600 hover:text-white"
                      )}
                      variant={plan.highlight ? "default" : "outline"}
                      render={<Link href="/register" />}
                    >
                      {plan.id === "free" ? "Start for free" : "Get started"}
                    </Button>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-violet-600/80 via-fuchsia-500/70 to-indigo-600/90 dark:bg-gradient-to-r dark:from-violet-800/20 dark:via-fuchsia-600/60 dark:to-indigo-700/90  px-8 py-10 text-center shadow-xl sm:flex-row sm:text-left dark:border-slate-700/80 dark:from-slate-950 dark:to-slate-900">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-violet-300">Payments</p>
                  <p className="mt-2 text-xl font-semibold text-white">Stripe &amp; SSLCommerz ready</p>
                  <p className="mt-1 max-w-xl text-sm text-slate-300">
                    Use cards globally with Stripe, or offer hosted checkout with SSLCommerz for local
                    methods—surfaced automatically when configured on your backend.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3 sm:justify-end">
                  <span className="rounded-lg border border-white/10 bg-white/60 dark:bg-white/5 px-4 py-2 text-sm font-medium text-indigo-900 dark:text-white backdrop-blur">
                    Stripe
                  </span>
                  <span className="rounded-lg border border-white/10 bg-white/60 dark:bg-white/5 px-4 py-2 text-sm font-medium text-indigo-900 dark:text-white backdrop-blur">
                    SSLCommerz
                  </span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <LandingComplaintSection />

        <section id="faq" className="scroll-mt-24 py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Frequently asked questions
              </h2>
            </ScrollReveal>
            <div className="mt-10 space-y-3">
              {FAQS.map((item, i) => (
                <ScrollReveal key={item.q} delayMs={i * 70}>
                  <details className="group rounded-lg border border-slate-200/80 bg-white/80 p-4 open:shadow-md dark:border-slate-800/80 dark:bg-slate-900/50">
                    <summary className="cursor-pointer list-none font-semibold text-slate-900 outline-none marker:content-none dark:text-white [&::-webkit-details-marker]:hidden">
                      <span className="flex items-center justify-between gap-3">
                        {item.q}
                        <ChevronDown className="size-4 shrink-0 text-violet-500 transition-transform group-open:rotate-180" />
                      </span>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.a}</p>
                  </details>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200/60 bg-gradient-to-br from-violet-800/80 via-fuchsia-500/80 to-indigo-900/80 dark:bg-gradient-to-r dark:from-violet-800/10 dark:via-fuchsia-600/50 dark:to-indigo-900/20 py-16 text-white dark:border-slate-800/60">
          <ScrollReveal>
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 text-center sm:flex-row sm:text-left sm:px-6 lg:px-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Ready to orchestrate WhatsApp?</h2>
                <p className="mt-2 max-w-xl text-sm text-white/85">
                  Create your workspace, connect a device, and send your first templated message in minutes.
                </p>
              </div>
              <div className="flex flex-row gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="h-12 rounded-lg bg-white text-violet-700 shadow-lg hover:bg-black hover:text-white"
                  render={<Link href="/register" />}
                >
                  Create account
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-4 rounded-lg border-white/40 bg-transparent text-white hover:bg-white/10"
                  render={<Link href="/login" />}
                >
                  Log in
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </main>

      <footer className="border-t border-slate-200/80 bg-white/80 py-10 text-sm text-slate-500 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/80 dark:text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} FlexoWhats. WhatsApp automation for modern teams.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href={dashboardPath()} className="hover:text-violet-600 dark:hover:text-violet-300">
              Dashboard
            </Link>
            <button
              type="button"
              onClick={() => document.getElementById("complaints")?.scrollIntoView({ behavior: "smooth" })}
              className="hover:text-violet-600 dark:hover:text-violet-300"
            >
              Complaints
            </button>
            <Link href="/login" className="hover:text-violet-600 dark:hover:text-violet-300">
              Sign in
            </Link>
            <Link href="/register" className="hover:text-violet-600 dark:hover:text-violet-300">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
