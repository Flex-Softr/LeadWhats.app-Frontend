export type AiProviderId = "gemini" | "openrouter";

export type AiModelTier = "free" | "paid";

export type AiCredentialApi = {
  id: string;
  name: string;
  provider: AiProviderId;
  apiKeyMasked: string;
  model: string;
  modelLabel: string | null;
  apiEndpoint: string | null;
  defaultApiEndpoint: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AiCredentialsListResponse = {
  credentials: AiCredentialApi[];
};

export type AiCredentialMutationResponse = {
  credential: AiCredentialApi;
};

export type AiProviderApi = {
  id: AiProviderId;
  label: string;
  defaultApiEndpoint: string;
};

export type AiProvidersResponse = {
  providers: AiProviderApi[];
};

export type AiModelApi = {
  id: string;
  provider: AiProviderId;
  label: string;
  tier: AiModelTier;
  modelId: string;
};

export type AiModelsResponse = {
  models: AiModelApi[];
};

export type AiSettingsForm = {
  credentialId: string;
  model: string;
  systemPrompt: string;
  temperature: string;
  maxTokens: string;
  continuousChat: boolean;
};

export type AiSettingsPayload = {
  credentialId: string;
  model: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number | null;
  continuousChat?: boolean;
};
