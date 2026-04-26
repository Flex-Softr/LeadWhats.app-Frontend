import type { TemplateInteractiveButton } from "@/types/template";

export type ListRowForm = {
  id: string;
  title: string;
  description: string;
};

export type ListSectionForm = {
  title: string;
  rows: ListRowForm[];
};

export type CarouselCardForm = {
  title: string;
  body: string;
  imageUrl: string;
};

export type TemplateFormExtras = {
  /** Pending file before upload on save */
  mediaFile: File | null;
  localMediaObjectUrl: string | null;
  externalMediaUrl: string;
  latitude: string;
  longitude: string;
  locationName: string;
  address: string;
  contactName: string;
  contactPhone: string;
  contactOrg: string;
  pollQuestion: string;
  pollOptions: string[];
  listSections: ListSectionForm[];
  carouselCards: CarouselCardForm[];
  ctaUrl: string;
  ctaButtonLabel: string;
  copyCode: string;
  flowId: string;
  messageButtons: TemplateInteractiveButton[];
};

let rowSeq = 0;
function rowId() {
  rowSeq += 1;
  return `row_${rowSeq}`;
}

export function emptyListSection(): ListSectionForm {
  return {
    title: "Options",
    rows: [
      { id: rowId(), title: "", description: "" },
      { id: rowId(), title: "", description: "" },
    ],
  };
}

export function emptyCarouselCard(): CarouselCardForm {
  return { title: "", body: "", imageUrl: "" };
}

export function createEmptyTemplateFormExtras(): TemplateFormExtras {
  return {
    mediaFile: null,
    localMediaObjectUrl: null,
    externalMediaUrl: "",
    latitude: "",
    longitude: "",
    locationName: "",
    address: "",
    contactName: "",
    contactPhone: "",
    contactOrg: "",
    pollQuestion: "",
    pollOptions: ["", ""],
    listSections: [emptyListSection()],
    carouselCards: [emptyCarouselCard()],
    ctaUrl: "",
    ctaButtonLabel: "",
    copyCode: "",
    flowId: "",
    messageButtons: [],
  };
}
