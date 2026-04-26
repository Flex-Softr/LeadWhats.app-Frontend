export type ChatbotNodeKind = "message" | "question" | "action" | "condition";

export type ChatbotFlowNode = {
  id: string;
  name: string;
  kind: ChatbotNodeKind;
  sortOrder: number;
  /** When kind is message */
  messageFormType?: "text" | "template";
  messageBody?: string;
  templateId?: string | null;
  templateName?: string | null;
  attachmentType?: string | null;
};

export type ChatbotFlow = {
  id: string;
  name: string;
  description: string;
  deviceId: string;
  deviceLabel: string;
  triggerKeywords: string;
  cooldownMinutes: number;
  active: boolean;
  nodes: ChatbotFlowNode[];
  conversationCount: number;
  createdAt: string;
  updatedAt: string;
};
