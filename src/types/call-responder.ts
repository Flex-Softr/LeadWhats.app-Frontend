export type CallResponderCallType =
  | "received"
  | "outgoing"
  | "missed"
  | "rejected";

export type CallResponderRule = {
  id: string;
  name: string;
  deviceId: string;
  deviceLabel: string;
  callTypes: CallResponderCallType[];
  responseDelayMinutes: number;
  messageFormType: "text" | "template";
  messageBody?: string;
  templateId?: string | null;
  templateName?: string | null;
  active: boolean;
  responsesSent: number;
  callsToday: number;
};
