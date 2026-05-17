import type { LucideIcon } from "lucide-react";
import {
  Bot,
  CreditCard,
  LayoutDashboard,
  MessageCircle,
  MessageSquare,
  MessagesSquare,
  Phone,
  Reply,
  Smartphone,
  UserRound,
  Users,
  FileText,
} from "lucide-react";

import { dashboardPath } from "@/config/app-routes";

export type NavItem = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  {
    title: "Overview",
    description: "Dashboard & analytics",
    href: dashboardPath(),
    icon: LayoutDashboard,
  },
  {
    title: "Billing",
    description: "Plans & upgrades",
    href: dashboardPath("/billing"),
    icon: CreditCard,
  },
  {
    title: "Devices",
    description: "WhatsApp Sessions",
    href: dashboardPath("/devices"),
    icon: Smartphone,
  },
  {
    title: "Single Message",
    description: "Test Messages",
    href: dashboardPath("/single-message"),
    icon: MessageSquare,
  },
  {
    title: "Templates",
    description: "Message Templates",
    href: dashboardPath("/templates"),
    icon: FileText,
  },
  {
    title: "Contacts",
    description: "Contact Management",
    href: dashboardPath("/contacts"),
    icon: UserRound,
  },
  {
    title: "Bulk Messages",
    description: "Mass Messaging",
    href: dashboardPath("/bulk-messages"),
    icon: MessagesSquare,
  },
  {
    title: "Auto Reply",
    description: "Automated Responses",
    href: dashboardPath("/auto-reply"),
    icon: Reply,
  },
  {
    title: "Chatbot",
    description: "Flows & assistants",
    href: dashboardPath("/chatbot"),
    icon: Bot,
  },
  {
    title: "Call Responder",
    description: "Call automation",
    href: dashboardPath("/call-responder"),
    icon: Phone,
  },
  {
    title: "Live Chat",
    description: "Inbox & conversations",
    href: dashboardPath("/live-chat"),
    icon: MessageCircle,
  },
  {
    title: "Group Grabber",
    description: "Extract groups & communities",
    href: dashboardPath("/group-grabber"),
    icon: Users,
  },
];
