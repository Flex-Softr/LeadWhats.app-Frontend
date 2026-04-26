export type ChatbotFlowNodeApi = {
  id: string;
  name: string;
  kind: "message" | "question" | "action" | "condition";
  sortOrder: number;
  messageFormType?: "text" | "template";
  messageBody?: string;
  templateId?: string | null;
  templateName?: string | null;
  attachmentType?: string | null;
};

export type ChatbotFlowApi = {
  id: string;
  name: string;
  description: string;
  deviceId: string;
  deviceLabel: string;
  triggerKeywords: string;
  cooldownMinutes: number;
  active: boolean;
  conversationCount: number;
  nodes: ChatbotFlowNodeApi[];
  createdAt: string;
  updatedAt: string;
};

export type ChatbotFlowsListResponse = {
  flows: ChatbotFlowApi[];
};

export type ChatbotFlowMutationResponse = {
  flow: ChatbotFlowApi;
};
