import type { AiSettingsForm } from "@/types/ai-credentials-api";

export function aiSettingsDefaults(): AiSettingsForm {
  return {
    credentialId: "",
    model: "",
    systemPrompt: "",
    temperature: "0.7",
    maxTokens: "",
    continuousChat: false,
  };
}

export function aiSettingsFormValid(form: AiSettingsForm): boolean {
  return form.credentialId.trim().length > 0;
}

export function buildAiSettingsPayload(form: AiSettingsForm): {
  credentialId: string;
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number | null;
} {
  const maxTok = form.maxTokens.trim();
  const payload: {
    credentialId: string;
    model?: string;
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number | null;
  } = {
    credentialId: form.credentialId.trim(),
    systemPrompt: form.systemPrompt.trim() || undefined,
    temperature: Number.parseFloat(form.temperature) || 0.7,
    maxTokens:
      maxTok === "" ? null : Math.max(1, Number.parseInt(maxTok, 10) || 512),
  };
  if (form.model.trim()) {
    payload.model = form.model.trim();
  }
  return payload;
}
