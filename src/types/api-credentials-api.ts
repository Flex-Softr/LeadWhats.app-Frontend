export type ApiCredentialApi = {
  id: string;
  name: string;
  clientId: string;
  clientSecretPrefix: string;
  active: boolean;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiCredentialCreatedApi = ApiCredentialApi & {
  clientSecret: string;
};

export type ApiCredentialsListResponse = {
  credentials: ApiCredentialApi[];
};

export type ApiCredentialMutationResponse = {
  credential: ApiCredentialApi;
};

export type ApiCredentialCreatedResponse = {
  credential: ApiCredentialCreatedApi;
};
