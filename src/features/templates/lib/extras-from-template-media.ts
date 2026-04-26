import type { TemplateTypeId } from "@/features/templates/config/template-type-definitions";
import {
  createEmptyTemplateFormExtras,
  emptyCarouselCard,
  emptyListSection,
  type TemplateFormExtras,
} from "@/features/templates/types/template-form-extras";
import type { TemplateMedia } from "@/types/template";

function asStr(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function asNumStr(v: unknown): string {
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  if (typeof v === "string") return v;
  return "";
}

/**
 * Hydrates form "extras" from saved `media` JSON when opening the edit dialog.
 */
export function extrasFromTemplateMedia(
  typeId: TemplateTypeId,
  media: TemplateMedia | null | undefined
): TemplateFormExtras {
  const base = createEmptyTemplateFormExtras();
  if (!media || typeof media !== "object") return base;

  switch (typeId) {
    case "message_image":
    case "message_video":
    case "message_document":
    case "message_audio":
      return {
        ...base,
        externalMediaUrl: asStr(media.externalUrl),
      };

    case "message_location":
      return {
        ...base,
        latitude: asNumStr(media.latitude),
        longitude: asNumStr(media.longitude),
        locationName: asStr(media.locationName),
        address: asStr(media.address),
      };

    case "message_contact":
      return {
        ...base,
        contactName: asStr(media.contactName),
        contactPhone: asStr(media.contactPhone),
        contactOrg: asStr(media.contactOrg),
      };

    case "message_poll":
      return {
        ...base,
        pollQuestion: asStr(media.pollQuestion),
        pollOptions:
          Array.isArray(media.pollOptions) && media.pollOptions.length > 0
            ? media.pollOptions.map((o) => asStr(o))
            : ["", ""],
      };

    case "message_list": {
      const sections = media.listSections;
      if (!Array.isArray(sections) || sections.length === 0) {
        return { ...base, listSections: [emptyListSection()] };
      }
      return {
        ...base,
        listSections: sections.map((s) => ({
          title: asStr(s?.title) || "Section",
          rows: Array.isArray(s?.rows)
            ? s.rows.map((r) => ({
                id: asStr(r?.id) || `row_${Math.random().toString(36).slice(2, 9)}`,
                title: asStr(r?.title),
                description: asStr(r?.description),
              }))
            : [],
        })),
      };
    }

    case "message_carousel": {
      const cards = media.carouselCards;
      if (!Array.isArray(cards) || cards.length === 0) {
        return { ...base, carouselCards: [emptyCarouselCard()] };
      }
      return {
        ...base,
        carouselCards: cards.map((c) => ({
          title: asStr(c?.title),
          body: asStr(c?.body),
          imageUrl: asStr(c?.imageUrl),
        })),
      };
    }

    case "cta_button":
      return {
        ...base,
        ctaUrl: asStr(media.ctaUrl),
        ctaButtonLabel: asStr(media.ctaButtonLabel),
      };

    case "copy_code":
      return {
        ...base,
        copyCode: asStr(media.copyCodeValue),
      };

    case "flow_message":
      return {
        ...base,
        flowId: asStr(media.flowId),
      };

    default:
      return base;
  }
}
