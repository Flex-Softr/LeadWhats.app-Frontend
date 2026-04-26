export type TemplateInteractiveButtonApi = {
  id: string;
  kind: "quick_reply" | "cta_url" | "cta_phone" | "copy_code";
  label: string;
};

/** Matches `GET /v1/templates` items and `POST /v1/templates` `template`. */
export type MessageTemplateApiRecord = {
  id: string;
  name: string;
  waTemplateName: string;
  language: string;
  content: string | null;
  body: string | null;
  category: string;
  typeId: string;
  footer: string | null;
  buttons: TemplateInteractiveButtonApi[] | null;
  media?: Record<string, unknown> | null;
  /** When false, template is hidden from send/campaign pickers. */
  active?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TemplatesListResponse = {
  templates: MessageTemplateApiRecord[];
};

/** `GET /v1/templates/media` */
export type TemplateMediaAssetApiRecord = {
  id: string;
  mimeType: string;
  originalName: string;
  byteSize: number;
  createdAt: string;
};

export type TemplateMediaListResponse = {
  assets: TemplateMediaAssetApiRecord[];
};

export type CreateTemplateResponse = {
  template: MessageTemplateApiRecord;
};

export type UpdateTemplateResponse = {
  template: MessageTemplateApiRecord;
};
