import { TEMPLATE_TYPE_OPTIONS } from "@/features/templates/config/template-type-definitions";
import type { TemplateTypeId } from "@/features/templates/config/template-type-definitions";
import type { MessageTemplateApiRecord } from "@/types/templates-api";
import type {
  MessageTemplateRecord,
  TemplateInteractiveButton,
  TemplateMedia,
} from "@/types/template";

function formatTemplateDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

function coerceTypeId(id: string): TemplateTypeId {
  if (TEMPLATE_TYPE_OPTIONS.some((t) => t.id === id)) {
    return id as TemplateTypeId;
  }
  return "text_message";
}

export function messageTemplateApiToRecord(
  t: MessageTemplateApiRecord
): MessageTemplateRecord {
  const content = t.content ?? t.body ?? "";
  const rawButtons = t.buttons;
  const buttons =
    rawButtons && rawButtons.length > 0
      ? (rawButtons as TemplateInteractiveButton[])
      : undefined;

  const rawMedia = t.media;
  const media: TemplateMedia | null =
    rawMedia && typeof rawMedia === "object" && !Array.isArray(rawMedia)
      ? (rawMedia as TemplateMedia)
      : null;

  return {
    id: t.id,
    name: t.name,
    waTemplateName: t.waTemplateName,
    language: t.language || "en",
    category: t.category,
    typeId: coerceTypeId(t.typeId),
    content,
    footer: t.footer ?? undefined,
    buttons,
    media,
    active: t.active !== false,
    createdAtLabel: formatTemplateDate(t.createdAt),
    updatedAtLabel: formatTemplateDate(t.updatedAt),
  };
}
