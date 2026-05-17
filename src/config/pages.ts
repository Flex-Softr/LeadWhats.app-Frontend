import { DASHBOARD_BASE, dashboardPath } from "@/config/app-routes";

export type PageMeta = {
  title: string;
  description: string;
};

const D = DASHBOARD_BASE;

export const PAGE_META = {
  "/": {
    title: "FlexoWhats",
    description:
      "WhatsApp automation for teams — devices, campaigns, chatbots, and more.",
  },
  [D]: {
    title: "Dashboard Overview",
    description: "WhatsApp automation performance at a glance.",
  },
  [dashboardPath("/devices")]: {
    title: "Devices",
    description: "Manage your WhatsApp sessions and connections.",
  },
  [dashboardPath("/single-message")]: {
    title: "Single Message",
    description: "Send Test messages with different Templates.",
  },
  [dashboardPath("/templates")]: {
    title: "Templates",
    description: "Create and manage reusable message templates.",
  },
  [dashboardPath("/contacts")]: {
    title: "Contacts",
    description: "Import, organize and manage your contacts.",
  },
  [dashboardPath("/bulk-messages")]: {
    title: "Bulk Messages",
    description: "Reach many recipients with compliant campaigns.",
  },
  [dashboardPath("/auto-reply")]: {
    title: "Auto Reply",
    description: "Set up automatic keyword-based responses.",
  },
  [dashboardPath("/chatbot")]: {
    title: "Chatbot",
    description: "Configure AI-powered conversations.",
  },
  [dashboardPath("/call-responder")]: {
    title: "Call Responder",
    description: "Manage call automation responses.",
  },
  [dashboardPath("/live-chat")]: {
    title: "Live Chat",
    description: "WhatsApp Automation Platform.",
  },
  [dashboardPath("/group-grabber")]: {
    title: "Group Grabber",
    description: "WhatsApp Automation Platform.",
  },
  [dashboardPath("/profile")]: {
    title: "Profile",
    description: "Your account, workspace membership, and sign-out.",
  },
  [dashboardPath("/billing")]: {
    title: "Plans & billing",
    description: "Upgrade your workspace or manage your subscription.",
  },
  [dashboardPath("/billing/success")]: {
    title: "Subscription confirmed",
    description: "Your plan is being activated.",
  },
  "/login": {
    title: "Sign in",
    description: "Access your FlexoWhats workspace.",
  },
  "/register": {
    title: "Create account",
    description: "Start automating WhatsApp with FlexoWhats.",
  },
} as const satisfies Record<string, PageMeta>;

export type PagePath = keyof typeof PAGE_META;

export function getPageMeta(pathname: string): PageMeta {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  if (normalized in PAGE_META) {
    return PAGE_META[normalized as PagePath];
  }
  const contactsBase = dashboardPath("/contacts");
  if (
    normalized.startsWith(`${contactsBase}/`) &&
    normalized !== contactsBase
  ) {
    return PAGE_META[dashboardPath("/contacts")];
  }
  const bulkBase = dashboardPath("/bulk-messages");
  if (
    normalized.startsWith(`${bulkBase}/`) &&
    normalized !== bulkBase
  ) {
    return {
      title: "Campaign details",
      description: PAGE_META[dashboardPath("/bulk-messages")].description,
    };
  }
  return {
    title: "FlexoWhats",
    description: "WhatsApp automation for your team.",
  };
}
