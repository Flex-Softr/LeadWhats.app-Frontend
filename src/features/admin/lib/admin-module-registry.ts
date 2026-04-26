/**
 * Canonical catalog of operator-facing admin modules for FlexoWhats.
 * Each entry documents purpose, suggested data sources, and UI panels for
 * maximum flexibility when wiring APIs, queues, and third parties later.
 */

export type AdminModuleId =
  | "tenants"
  | "users"
  | "subscriptions"
  | "billing"
  | "usage"
  | "fleet"
  | "compliance"
  | "moderation"
  | "feature-flags"
  | "integrations"
  | "system"
  | "audit"
  | "support"
  | "announcements"
  | "reports"
  | "settings";

export type AdminModulePanel = {
  name: string;
  description: string;
};

export type AdminModuleKpi = {
  label: string;
  value: string;
  hint?: string;
};

export type AdminModuleDefinition = {
  id: AdminModuleId;
  title: string;
  subtitle: string;
  /** One-line operator intent */
  purpose: string;
  /** Systems / tables / APIs to connect */
  integrations: string[];
  /** Suggested sub-views (tabs, split panes, drawers) */
  panels: AdminModulePanel[];
  /** Demo KPIs for the module landing (replace with live queries) */
  kpis?: AdminModuleKpi[];
};

export const ADMIN_MODULE_REGISTRY: Record<
  AdminModuleId,
  AdminModuleDefinition
> = {
  tenants: {
    id: "tenants",
    title: "Tenants & workspaces",
    subtitle: "Organizations on the platform",
    purpose:
      "Create, suspend, and segment customer workspaces; override plans and limits for escalations.",
    integrations: [
      "Workspaces / orgs table",
      "Stripe customer ID mapping",
      "Plan & trial state",
      "SSO / domain claims (optional)",
    ],
    panels: [
      {
        name: "Directory",
        description:
          "Searchable grid with status, plan, MRR, last activity, country.",
      },
      {
        name: "Tenant detail",
        description:
          "Members, devices, usage snapshot, invoices, internal notes, impersonation audit.",
      },
      {
        name: "Lifecycle",
        description:
          "Onboarding checklist, churn risk flags, expansion opportunities.",
      },
    ],
    kpis: [
      { label: "Active workspaces", value: "—", hint: "Excluding churned" },
      { label: "Trials ending (7d)", value: "—" },
    ],
  },
  users: {
    id: "users",
    title: "Users & access",
    subtitle: "Identity across tenants",
    purpose:
      "Resolve login issues, enforce bans, and audit roles without touching tenant data blindly.",
    integrations: [
      "Auth provider (e.g. Clerk, Auth0, custom JWT)",
      "User ↔ workspace memberships",
      "2FA / session revocation APIs",
    ],
    panels: [
      {
        name: "Global user search",
        description: "Email, phone, external IDs; linked workspaces.",
      },
      {
        name: "Role matrix",
        description: "Owner, admin, agent — per workspace and platform staff roles.",
      },
      {
        name: "Security events",
        description: "Failed logins, password resets, suspicious sessions.",
      },
    ],
    kpis: [
      { label: "MAU (30d)", value: "—" },
      { label: "Locked accounts", value: "—" },
    ],
  },
  subscriptions: {
    id: "subscriptions",
    title: "Subscriptions",
    subtitle: "Lifecycle & retention",
    purpose:
      "See every Stripe subscription, trial, cancel reason, and win-back campaigns in one place.",
    integrations: [
      "Stripe Subscriptions API",
      "Internal plan catalog (sync with `BILLING_PLANS`)",
      "Webhook event store",
    ],
    panels: [
      {
        name: "Pipeline",
        description: "Trialing → active → past_due → canceled funnel.",
      },
      {
        name: "Cohort health",
        description: "Expansion, contraction, and downgrade trends.",
      },
      {
        name: "Dunning",
        description: "Failed payment retries, emails sent, manual outreach queue.",
      },
    ],
    kpis: [
      { label: "Active paid subs", value: "—" },
      { label: "Past due", value: "—" },
    ],
  },
  billing: {
    id: "billing",
    title: "Revenue & payouts",
    subtitle: "Money movement",
    purpose:
      "Reconcile MRR/ARR, refunds, taxes, and coupons; support finance without raw Stripe only.",
    integrations: [
      "Stripe Invoices & Balance transactions",
      "Accounting export (CSV / NetSuite)",
      "Tax engine (if applicable)",
    ],
    panels: [
      {
        name: "MRR / ARR board",
        description: "Plan mix, new vs expansion vs churn MRR.",
      },
      {
        name: "Transactions",
        description: "Filters by date, tenant, status, dispute.",
      },
      {
        name: "Coupons & credits",
        description: "Promo abuse monitoring, manual credits with approval trail.",
      },
    ],
    kpis: [
      { label: "MRR", value: "—" },
      { label: "Failed charges (24h)", value: "—" },
    ],
  },
  usage: {
    id: "usage",
    title: "Usage & quotas",
    subtitle: "Metering vs plans",
    purpose:
      "Enforce and visualize limits from Free / Pro / Business: messages, sessions, API calls.",
    integrations: [
      "Message send pipeline metrics",
      "Per-tenant counters (Redis / Timescale)",
      "Plan entitlements service",
    ],
    panels: [
      {
        name: "Quota dashboard",
        description: "Usage % vs plan caps; soft vs hard limits.",
      },
      {
        name: "Top consumers",
        description: "Tenants nearing limits or spiking cost.",
      },
      {
        name: "Overage rules",
        description: "Auto-upgrade prompts, throttling, grace windows.",
      },
    ],
    kpis: [
      { label: "Messages (24h)", value: "—" },
      { label: "Tenants over 90% quota", value: "—" },
    ],
  },
  fleet: {
    id: "fleet",
    title: "Session fleet",
    subtitle: "WhatsApp connections",
    purpose:
      "Operate connected devices at scale: health, version drift, forced logout for policy.",
    integrations: [
      "Device/session registry",
      "WhatsApp Cloud API / BSP webhooks",
      "Heartbeat & last-seen workers",
    ],
    panels: [
      {
        name: "Fleet map",
        description: "Online / degraded / disconnected by region.",
      },
      {
        name: "Session detail",
        description: "QR state, phone ID, linked tenant, message throughput.",
      },
      {
        name: "Incidents",
        description: "Meta outages, ban waves, rate-limit storms.",
      },
    ],
    kpis: [
      { label: "Sessions online", value: "—" },
      { label: "Degraded", value: "—" },
    ],
  },
  compliance: {
    id: "compliance",
    title: "Messaging compliance",
    subtitle: "Policy & consent",
    purpose:
      "Reduce WhatsApp / GDPR risk: templates, opt-outs, retention, and regional rules.",
    integrations: [
      "Template library & approval status",
      "Opt-out / block lists",
      "Data retention jobs",
    ],
    panels: [
      {
        name: "Template governance",
        description: "Pending approvals, rejection reasons, locale coverage.",
      },
      {
        name: "Consent ledger",
        description: "Subscribe/unsubscribe with timestamp and channel.",
      },
      {
        name: "Jurisdictions",
        description: "Country allowlists, quiet hours, industry vertical rules.",
      },
    ],
    kpis: [
      { label: "Open compliance tasks", value: "—" },
      { label: "Opt-outs (7d)", value: "—" },
    ],
  },
  moderation: {
    id: "moderation",
    title: "Abuse & moderation",
    subtitle: "Trust & safety",
    purpose:
      "Detect spam campaigns, scam patterns, and ToS violations across bulk and chatbot flows.",
    integrations: [
      "Bulk send audit log",
      "Keyword / regex rules engine",
      "User reports inbox",
    ],
    panels: [
      {
        name: "Review queue",
        description: "Flagged sends with message samples and risk score.",
      },
      {
        name: "Enforcement",
        description: "Warnings, throttles, workspace suspension with reason codes.",
      },
      {
        name: "Appeals",
        description: "Structured tickets tied to audit IDs.",
      },
    ],
    kpis: [
      { label: "Open cases", value: "—" },
      { label: "Actions (7d)", value: "—" },
    ],
  },
  "feature-flags": {
    id: "feature-flags",
    title: "Feature flags",
    subtitle: "Progressive delivery",
    purpose:
      "Ship safely: toggle modules (chatbot, bulk, group grabber) per plan, tenant, or percentage.",
    integrations: [
      "Flagsmith / LaunchDarkly / internal JSON store",
      "Build-time plan matrix",
    ],
    panels: [
      {
        name: "Flag matrix",
        description: "Flag × environment × audience with kill switches.",
      },
      {
        name: "Experiments",
        description: "A/B hooks for onboarding and pricing (optional).",
      },
    ],
    kpis: [{ label: "Flags active", value: "—" }],
  },
  integrations: {
    id: "integrations",
    title: "Integrations & webhooks",
    subtitle: "External pipes",
    purpose:
      "Debug Stripe, Meta, and custom webhooks; replay failures; rotate secrets.",
    integrations: [
      "Webhook ingress log",
      "Stripe webhook endpoint",
      "Outbound job queue dead-letter",
    ],
    panels: [
      {
        name: "Event stream",
        description: "Filter by vendor, status code, tenant, correlation ID.",
      },
      {
        name: "Replay & DLQ",
        description: "Safe replay with idempotency keys.",
      },
      {
        name: "Credentials",
        description: "Key rotation schedule, last verified.",
      },
    ],
    kpis: [
      { label: "Failed webhooks (24h)", value: "—" },
      { label: "DLQ depth", value: "—" },
    ],
  },
  system: {
    id: "system",
    title: "System health",
    subtitle: "Reliability",
    purpose:
      "Watch queues, workers, DB latency, and error budgets — especially around message sending peaks.",
    integrations: [
      "APM (e.g. Datadog, Grafana)",
      "Queue metrics (BullMQ, SQS)",
      "Uptime probes",
    ],
    panels: [
      {
        name: "Service map",
        description: "API, workers, schedulers, dependency status.",
      },
      {
        name: "SLOs",
        description: "Send latency p95, delivery success rate, API error ratio.",
      },
      {
        name: "Incidents",
        description: "Link to status page and postmortems.",
      },
    ],
    kpis: [
      { label: "API p95 (ms)", value: "—" },
      { label: "Worker lag", value: "—" },
    ],
  },
  audit: {
    id: "audit",
    title: "Audit log",
    subtitle: "Accountability",
    purpose:
      "Immutable trail of admin actions, config changes, and sensitive reads (impersonation, exports).",
    integrations: [
      "Append-only audit store",
      "SIEM forwarder (optional)",
    ],
    panels: [
      {
        name: "Timeline",
        description: "Actor, action, target, IP, before/after JSON.",
      },
      {
        name: "Exports",
        description: "Scheduled compliance reports with access control.",
      },
    ],
    kpis: [{ label: "Events (24h)", value: "—" }],
  },
  support: {
    id: "support",
    title: "Support console",
    subtitle: "Operator tools",
    purpose:
      "Fast context for tickets: jump to tenant, recent errors, billing state, without switching tools.",
    integrations: [
      "Zendesk / Intercom deep links",
      "Error tracking (Sentry) project scoped by tenant",
    ],
    panels: [
      {
        name: "Tenant lookup",
        description: "Single search box → unified profile.",
      },
      {
        name: "Safe impersonation",
        description: "Time-boxed, logged, reason-required sessions.",
      },
      {
        name: "Runbooks",
        description: "Linked checklists for common incidents.",
      },
    ],
    kpis: [{ label: "Open tickets (sync)", value: "—" }],
  },
  announcements: {
    id: "announcements",
    title: "Announcements",
    subtitle: "Comms to customers",
    purpose:
      "Maintenance windows, new features, and policy updates with targeting by plan or locale.",
    integrations: [
      "In-app banner store",
      "Email broadcast (optional)",
    ],
    panels: [
      {
        name: "Active banners",
        description: "Severity, audience, schedule, dismiss rules.",
      },
      {
        name: "Changelog feed",
        description: "Tie releases to customer-visible notes.",
      },
    ],
    kpis: [{ label: "Scheduled", value: "—" }],
  },
  reports: {
    id: "reports",
    title: "Reports & exports",
    subtitle: "Data out",
    purpose:
      "GDPR data packages, finance CSVs, and executive summaries without ad-hoc SQL.",
    integrations: [
      "Warehouse / BI sync",
      "Object storage for generated archives",
    ],
    panels: [
      {
        name: "Report builder",
        description: "Saved queries with RBAC on who can run them.",
      },
      {
        name: "DSAR queue",
        description: "Export / delete requests with SLA timers.",
      },
    ],
    kpis: [{ label: "Pending DSAR", value: "—" }],
  },
  settings: {
    id: "settings",
    title: "Platform settings",
    subtitle: "Global configuration",
    purpose:
      "Defaults for limits, email templates, maintenance mode, and feature rollout baselines.",
    integrations: [
      "Config service / env sync",
      "Secrets manager references (not raw secrets in DB)",
    ],
    panels: [
      {
        name: "Defaults",
        description: "Signup limits, trial length, grace quotas.",
      },
      {
        name: "Messaging",
        description: "Global send rate caps, provider failover order.",
      },
      {
        name: "Staff roles",
        description: "Internal RBAC: super-admin, support, read-only finance.",
      },
    ],
    kpis: [],
  },
};

export function isAdminModuleId(s: string): s is AdminModuleId {
  return s in ADMIN_MODULE_REGISTRY;
}

export const ADMIN_MODULE_IDS = Object.keys(
  ADMIN_MODULE_REGISTRY
) as AdminModuleId[];
