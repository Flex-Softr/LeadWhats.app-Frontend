import type { TemplateTypeId } from "@/features/templates/config/template-type-definitions";
import type { TemplateFormExtras } from "@/features/templates/types/template-form-extras";

export function templateTypeNeedsFileUpload(typeId: TemplateTypeId): boolean {
  return (
    typeId === "message_image" ||
    typeId === "message_video" ||
    typeId === "message_document" ||
    typeId === "message_audio"
  );
}

export function buildTemplateMediaPayload(
  typeId: TemplateTypeId,
  extras: TemplateFormExtras,
  uploadedFileId?: string
): Record<string, unknown> | undefined {
  switch (typeId) {
    case "text_message":
    case "mixed_interactive":
    case "message_buttons":
      return undefined;

    case "message_image":
    case "message_video":
    case "message_document":
    case "message_audio": {
      const out: Record<string, unknown> = {};
      if (uploadedFileId) out.fileId = uploadedFileId;
      const ext = extras.externalMediaUrl.trim();
      if (ext) out.externalUrl = ext;
      return Object.keys(out).length ? out : undefined;
    }

    case "message_location": {
      return {
        latitude: extras.latitude,
        longitude: extras.longitude,
        locationName: extras.locationName.trim() || undefined,
        address: extras.address.trim() || undefined,
      };
    }

    case "message_contact": {
      return {
        contactName: extras.contactName.trim(),
        contactPhone: extras.contactPhone.trim(),
        contactOrg: extras.contactOrg.trim() || undefined,
      };
    }

    case "message_poll": {
      return {
        pollQuestion: extras.pollQuestion.trim(),
        pollOptions: extras.pollOptions.map((o) => o.trim()).filter(Boolean),
      };
    }

    case "message_list": {
      return {
        listSections: extras.listSections.map((s) => ({
          title: s.title.trim() || "Section",
          rows: s.rows
            .map((r) => ({
              id: r.id,
              title: r.title.trim(),
              description: r.description.trim() || undefined,
            }))
            .filter((r) => r.title.length > 0),
        })),
      };
    }

    case "message_carousel": {
      return {
        carouselCards: extras.carouselCards.map((c) => ({
          title: c.title.trim() || undefined,
          body: c.body.trim() || undefined,
          imageUrl: c.imageUrl.trim() || undefined,
        })),
      };
    }

    case "cta_button": {
      return {
        ctaUrl: extras.ctaUrl.trim(),
        ctaButtonLabel: extras.ctaButtonLabel.trim(),
      };
    }

    case "copy_code": {
      return { copyCodeValue: extras.copyCode.trim() };
    }

    case "flow_message": {
      return { flowId: extras.flowId.trim() };
    }

    default:
      return undefined;
  }
}
