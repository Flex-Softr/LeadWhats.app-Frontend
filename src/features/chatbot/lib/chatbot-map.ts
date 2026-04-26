import type { ChatbotFlowApi, ChatbotFlowNodeApi } from "@/types/chatbot-api";
import type { ChatbotFlow, ChatbotFlowNode } from "@/types/chatbot";

export function flowNodeApiToUi(n: ChatbotFlowNodeApi): ChatbotFlowNode {
  const base: ChatbotFlowNode = {
    id: n.id,
    name: n.name,
    kind: n.kind,
    sortOrder: n.sortOrder,
  };
  if (n.kind !== "message") {
    return base;
  }
  return {
    ...base,
    messageFormType: n.messageFormType ?? "text",
    messageBody: n.messageBody,
    templateId: n.templateId ?? null,
    templateName: n.templateName ?? null,
    attachmentType: n.attachmentType ?? null,
  };
}

export function flowApiToUi(f: ChatbotFlowApi): ChatbotFlow {
  return {
    id: f.id,
    name: f.name,
    description: f.description,
    deviceId: f.deviceId,
    deviceLabel: f.deviceLabel,
    triggerKeywords: f.triggerKeywords,
    cooldownMinutes: f.cooldownMinutes,
    active: f.active,
    conversationCount: f.conversationCount,
    nodes: f.nodes.map(flowNodeApiToUi),
    createdAt: f.createdAt,
    updatedAt: f.updatedAt,
  };
}
