import type { TemplateTypeId } from "@/features/templates/config/template-type-definitions";
import type { TemplateFormExtras } from "@/features/templates/types/template-form-extras";
import type { TemplateMedia } from "@/types/template";

/** Shape for the WhatsApp preview while editing the create form. */
export function buildLivePreviewMedia(
  typeId: TemplateTypeId,
  extras: TemplateFormExtras
): TemplateMedia | null {
  switch (typeId) {
    case "message_image":
    case "message_video":
    case "message_document":
    case "message_audio": {
      const u = extras.externalMediaUrl.trim();
      return u ? { externalUrl: u } : null;
    }
    case "message_location": {
      const lat = Number.parseFloat(extras.latitude);
      const lng = Number.parseFloat(extras.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return extras.locationName.trim() || extras.address.trim()
          ? {
              locationName: extras.locationName.trim() || undefined,
              address: extras.address.trim() || undefined,
            }
          : null;
      }
      return {
        latitude: lat,
        longitude: lng,
        locationName: extras.locationName.trim() || undefined,
        address: extras.address.trim() || undefined,
      };
    }
    case "message_contact":
      return extras.contactName.trim() || extras.contactPhone.trim()
        ? {
            contactName: extras.contactName.trim() || "Contact",
            contactPhone: extras.contactPhone.trim() || "—",
            contactOrg: extras.contactOrg.trim() || undefined,
          }
        : null;
    case "message_poll": {
      const opts = extras.pollOptions.map((o) => o.trim()).filter(Boolean);
      if (!extras.pollQuestion.trim() && opts.length === 0) return null;
      return {
        pollQuestion: extras.pollQuestion.trim() || "Poll",
        pollOptions: opts.length ? opts : ["Option A", "Option B"],
      };
    }
    case "message_list":
      return {
        listSections: extras.listSections.map((s) => ({
          title: s.title.trim() || "Section",
          rows: s.rows
            .filter((r) => r.title.trim())
            .map((r) => ({
              id: r.id,
              title: r.title.trim(),
              description: r.description.trim() || undefined,
            })),
        })),
      };
    case "message_carousel":
      return {
        carouselCards: extras.carouselCards.map((c) => ({
          title: c.title.trim() || undefined,
          body: c.body.trim() || undefined,
          imageUrl: c.imageUrl.trim() || undefined,
        })),
      };
    case "cta_button":
      return extras.ctaUrl.trim() || extras.ctaButtonLabel.trim()
        ? {
            ctaUrl: extras.ctaUrl.trim() || "https://",
            ctaButtonLabel: extras.ctaButtonLabel.trim() || "Open",
          }
        : null;
    case "copy_code":
      return extras.copyCode.trim()
        ? { copyCodeValue: extras.copyCode.trim() }
        : null;
    case "flow_message":
      return extras.flowId.trim() ? { flowId: extras.flowId.trim() } : null;
    default:
      return null;
  }
}
