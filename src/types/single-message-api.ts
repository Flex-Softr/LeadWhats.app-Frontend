import type { MessageTemplateApiRecord } from "@/types/templates-api";

export type SingleMessageTemplatesResponse = {
  templates: MessageTemplateApiRecord[];
};

export type ValidatePhoneResponse =
  | { valid: true; e164: string }
  | { valid: false; e164: null; message: string };

export type SingleSendResponse = {
  id: string;
  status: "queued" | "sent" | "failed" | "simulated";
  kind: "text" | "template";
  toPhone: string;
  deviceId: string;
  templateId: string | null;
  bodyText: string | null;
  createdAt: string;
  note?: string;
};
