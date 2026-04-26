import type { LucideIcon } from "lucide-react";
import {
  BarChart2,
  Copy,
  FileText,
  GalleryHorizontal,
  ImageIcon,
  LayoutGrid,
  Link2,
  List,
  MapPin,
  MessageSquare,
  MousePointerClick,
  Music,
  UserRound,
  Video,
  Workflow,
} from "lucide-react";

export type TemplateTypeDefinition = {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Helper line under the grid */
  hint: string;
};

export const TEMPLATE_TYPE_OPTIONS = [
  {
    id: "text_message",
    label: "Text Message",
    icon: MessageSquare,
    hint: "Simple text message with variables",
  },
  {
    id: "message_image",
    label: "Message + Image",
    icon: ImageIcon,
    hint: "Image caption and optional body text",
  },
  {
    id: "message_document",
    label: "Message + Document",
    icon: FileText,
    hint: "PDF or document with a short message",
  },
  {
    id: "message_contact",
    label: "Message + Contact",
    icon: UserRound,
    hint: "Share a vCard with your message",
  },
  {
    id: "message_poll",
    label: "Message + Poll",
    icon: BarChart2,
    hint: "Poll with options for recipients",
  },
  {
    id: "message_buttons",
    label: "Message + Buttons",
    icon: MousePointerClick,
    hint: "Up to three quick-reply or CTA buttons",
  },
  {
    id: "message_list",
    label: "Message + List",
    icon: List,
    hint: "Structured list menu for user selection",
  },
  {
    id: "message_carousel",
    label: "Message + Carousel",
    icon: GalleryHorizontal,
    hint: "Multiple cards in a horizontal carousel",
  },
  {
    id: "message_location",
    label: "Message + Location",
    icon: MapPin,
    hint: "Static map preview with address text",
  },
  {
    id: "message_video",
    label: "Message + Video",
    icon: Video,
    hint: "Video message with caption",
  },
  {
    id: "message_audio",
    label: "Message + Audio",
    icon: Music,
    hint: "Audio clip with optional text",
  },
  {
    id: "cta_button",
    label: "CTA Button",
    icon: Link2,
    hint: "Single high‑intent call‑to‑action link",
  },
  {
    id: "copy_code",
    label: "Copy Code",
    icon: Copy,
    hint: "One‑tap copy string for offers or codes",
  },
  {
    id: "flow_message",
    label: "Flow Message",
    icon: Workflow,
    hint: "WhatsApp Flows for structured data collection",
  },
  {
    id: "mixed_interactive",
    label: "Mixed Interactive Buttons",
    icon: LayoutGrid,
    hint: "Combine replies, links, phone, and copy actions",
  },
] as const satisfies readonly TemplateTypeDefinition[];

export type TemplateTypeId = (typeof TEMPLATE_TYPE_OPTIONS)[number]["id"];

export function getTemplateTypeHint(id: TemplateTypeId): string {
  const row = TEMPLATE_TYPE_OPTIONS.find((t) => t.id === id);
  return row?.hint ?? "";
}
