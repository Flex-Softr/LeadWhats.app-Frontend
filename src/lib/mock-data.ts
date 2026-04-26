import type {
  DashboardOverview,
  UserLicense,
  UserProfile,
} from "@/types/dashboard";

export const demoUser: UserProfile = {
  name: "Rahul",
  initials: "R",
};

/** Default demo license; live UI uses `useSubscription().license`. */
export const demoLicense: UserLicense = {
  tier: "trial",
  tierLabel: "Free plan",
  statusLabel: "Upgrade available",
  statusVariant: "secondary",
  daysRemaining: undefined,
  isUpgraded: false,
};

export const dashboardOverview: DashboardOverview = {
  systemStatus: "offline",
  lastUpdated: "Mar 29, 2026 · 09:42",
  devicesOnline: 0,
  messagesToday: 0,
  metrics: [
    {
      id: "sent",
      title: "Messages Sent",
      value: 0,
      trend: { label: "today", delta: 0, accentClass: "text-emerald-600" },
      iconClass: "bg-blue-500",
    },
    {
      id: "delivered",
      title: "Delivered",
      value: 0,
      trend: { label: "today", delta: 0, accentClass: "text-emerald-600" },
      iconClass: "bg-emerald-500",
    },
    {
      id: "read",
      title: "Read Rate",
      value: 0,
      trend: { label: "sessions", delta: 0, accentClass: "text-emerald-600" },
      iconClass: "bg-violet-500",
    },
    {
      id: "chats",
      title: "Active Chats",
      value: 0,
      trend: { label: "now", delta: 0, accentClass: "text-emerald-600" },
      iconClass: "bg-amber-500",
    },
  ],
  summaries: [
    {
      id: "auto-reply",
      title: "Auto Reply",
      rows: [
        { label: "Active Rules", value: 0 },
        { label: "Total Responses", value: 0 },
      ],
      progress: 12,
      icon: "reply",
    },
    {
      id: "bulk",
      title: "Bulk Sends",
      rows: [
        { label: "Campaigns", value: 0 },
        { label: "Queued", value: 0 },
      ],
      progress: 8,
      icon: "bulk",
    },
    {
      id: "chatbot",
      title: "Chatbot",
      rows: [
        { label: "Active Flows", value: 0 },
        { label: "Handoffs", value: 0 },
      ],
      progress: 20,
      icon: "bot",
    },
    {
      id: "templates",
      title: "Templates",
      rows: [
        { label: "Approved", value: 0 },
        { label: "Drafts", value: 0 },
      ],
      progress: 5,
      icon: "template",
    },
  ],
};
