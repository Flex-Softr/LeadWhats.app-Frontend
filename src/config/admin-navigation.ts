import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Bell,
  Building2,
  ClipboardList,
  CreditCard,
  Flag,
  Gauge,
  LayoutDashboard,
  LifeBuoy,
  MessageSquareWarning,
  Plug,
  Receipt,
  Scale,
  Settings2,
  ShieldCheck,
  Smartphone,
  Users,
} from "lucide-react";

import type { AdminModuleId } from "@/features/admin/lib/admin-module-registry";

export const ADMIN_BASE_PATH = "/admin";

export type AdminNavItem = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Matches registry id when not overview */
  moduleId?: AdminModuleId;
};

export type AdminNavSection = {
  id: string;
  label: string;
  items: AdminNavItem[];
};

/** Sidebar structure — reorder sections here without touching pages. */
export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    id: "command",
    label: "Command center",
    items: [
      {
        href: ADMIN_BASE_PATH,
        title: "Overview",
        description: "KPIs and module map",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: "growth",
    label: "Growth & revenue",
    items: [
      {
        href: `${ADMIN_BASE_PATH}/subscriptions`,
        title: "Subscriptions",
        description: "Lifecycle, trials, dunning",
        icon: Receipt,
        moduleId: "subscriptions",
      },
      {
        href: `${ADMIN_BASE_PATH}/billing`,
        title: "Revenue",
        description: "MRR, invoices, coupons",
        icon: CreditCard,
        moduleId: "billing",
      },
    ],
  },
  {
    id: "customers",
    label: "Customers",
    items: [
      {
        href: `${ADMIN_BASE_PATH}/tenants`,
        title: "Tenants",
        description: "Workspaces & plans",
        icon: Building2,
        moduleId: "tenants",
      },
      {
        href: `${ADMIN_BASE_PATH}/users`,
        title: "Users",
        description: "Identity & roles",
        icon: Users,
        moduleId: "users",
      },
      {
        href: `${ADMIN_BASE_PATH}/usage`,
        title: "Usage & quotas",
        description: "Metering vs entitlements",
        icon: Gauge,
        moduleId: "usage",
      },
    ],
  },
  {
    id: "product-risk",
    label: "Product & trust",
    items: [
      {
        href: `${ADMIN_BASE_PATH}/fleet`,
        title: "Session fleet",
        description: "WhatsApp connections",
        icon: Smartphone,
        moduleId: "fleet",
      },
      {
        href: `${ADMIN_BASE_PATH}/compliance`,
        title: "Compliance",
        description: "Templates, opt-outs, retention",
        icon: Scale,
        moduleId: "compliance",
      },
      {
        href: `${ADMIN_BASE_PATH}/moderation`,
        title: "Moderation",
        description: "Abuse queue & enforcement",
        icon: MessageSquareWarning,
        moduleId: "moderation",
      },
      {
        href: `${ADMIN_BASE_PATH}/feature-flags`,
        title: "Feature flags",
        description: "Rollouts & experiments",
        icon: Flag,
        moduleId: "feature-flags",
      },
    ],
  },
  {
    id: "platform",
    label: "Platform",
    items: [
      {
        href: `${ADMIN_BASE_PATH}/system`,
        title: "System health",
        description: "SLOs, workers, dependencies",
        icon: Activity,
        moduleId: "system",
      },
      {
        href: `${ADMIN_BASE_PATH}/integrations`,
        title: "Integrations",
        description: "Webhooks, DLQ, credentials",
        icon: Plug,
        moduleId: "integrations",
      },
      {
        href: `${ADMIN_BASE_PATH}/audit`,
        title: "Audit log",
        description: "Immutable admin trail",
        icon: ClipboardList,
        moduleId: "audit",
      },
    ],
  },
  {
    id: "gtm",
    label: "GTM & support",
    items: [
      {
        href: `${ADMIN_BASE_PATH}/support`,
        title: "Support console",
        description: "Lookup & safe tools",
        icon: LifeBuoy,
        moduleId: "support",
      },
      {
        href: `${ADMIN_BASE_PATH}/announcements`,
        title: "Announcements",
        description: "Banners & changelog",
        icon: Bell,
        moduleId: "announcements",
      },
      {
        href: `${ADMIN_BASE_PATH}/reports`,
        title: "Reports & exports",
        description: "DSAR, finance, BI",
        icon: ShieldCheck,
        moduleId: "reports",
      },
    ],
  },
  {
    id: "config",
    label: "Configuration",
    items: [
      {
        href: `${ADMIN_BASE_PATH}/settings`,
        title: "Platform settings",
        description: "Defaults, RBAC, maintenance",
        icon: Settings2,
        moduleId: "settings",
      },
    ],
  },
];

/** Flat list for lookups */
export function getAllAdminNavItems(): AdminNavItem[] {
  return ADMIN_NAV_SECTIONS.flatMap((s) => s.items);
}

export function getAdminNavMeta(pathname: string): {
  title: string;
  description: string;
} {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  const item = getAllAdminNavItems().find((i) => {
    if (i.href === ADMIN_BASE_PATH) {
      return normalized === ADMIN_BASE_PATH;
    }
    return (
      normalized === i.href || normalized.startsWith(`${i.href}/`)
    );
  });

  if (item) {
    return { title: item.title, description: item.description };
  }

  return {
    title: "Admin",
    description: "FlexoWhats operator console",
  };
}
