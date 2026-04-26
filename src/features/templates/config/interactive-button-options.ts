import type { LucideIcon } from "lucide-react";
import { Clipboard, Link2, MessageSquare, Phone } from "lucide-react";

import type { TemplateInteractiveKind } from "@/types/template";

export type InteractiveButtonMenuOption = {
  kind: TemplateInteractiveKind;
  title: string;
  description: string;
  icon: LucideIcon;
  defaultLabel: string;
};

export const INTERACTIVE_BUTTON_MENU_OPTIONS: InteractiveButtonMenuOption[] = [
  {
    kind: "quick_reply",
    title: "Quick Reply",
    description: "Standard interactive button",
    icon: MessageSquare,
    defaultLabel: "Quick reply",
  },
  {
    kind: "cta_url",
    title: "CTA URL",
    description: "Clickable website link",
    icon: Link2,
    defaultLabel: "Visit website",
  },
  {
    kind: "cta_phone",
    title: "CTA Phone",
    description: "Call phone number",
    icon: Phone,
    defaultLabel: "Call us",
  },
  {
    kind: "copy_code",
    title: "Copy Code",
    description: "Copy text to clipboard",
    icon: Clipboard,
    defaultLabel: "Copy offer code",
  },
];
