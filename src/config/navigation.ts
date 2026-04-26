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
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Billing",
    description: "Plans & upgrades",
    href: "/billing",
    icon: CreditCard,
  },
  {
    title: "Devices",
    description: "WhatsApp Sessions",
    href: "/devices",
    icon: Smartphone,
  },
  {
    title: "Single Message",
    description: "Test Messages",
    href: "/single-message",
    icon: MessageSquare,
  },
  {
    title: "Templates",
    description: "Message Templates",
    href: "/templates",
    icon: FileText,
  },
  {
    title: "Contacts",
    description: "Contact Management",
    href: "/contacts",
    icon: UserRound,
  },
  {
    title: "Bulk Messages",
    description: "Mass Messaging",
    href: "/bulk-messages",
    icon: MessagesSquare,
  },
  {
    title: "Auto Reply",
    description: "Automated Responses",
    href: "/auto-reply",
    icon: Reply,
  },
  {
    title: "Chatbot",
    description: "Flows & assistants",
    href: "/chatbot",
    icon: Bot,
  },
  {
    title: "Call Responder",
    description: "Call automation",
    href: "/call-responder",
    icon: Phone,
  },
  {
    title: "Live Chat",
    description: "Inbox & conversations",
    href: "/live-chat",
    icon: MessageCircle,
  },
  {
    title: "Group Grabber",
    description: "Extract groups & communities",
    href: "/group-grabber",
    icon: Users,
  },
];
