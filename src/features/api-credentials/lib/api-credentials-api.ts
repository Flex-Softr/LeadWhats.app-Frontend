import { apiFetch, apiJson, ApiError } from "@/lib/api";
import type {
  ApiCredentialCreatedResponse,
  ApiCredentialMutationResponse,
  ApiCredentialsListResponse,
} from "@/types/api-credentials-api";

export async function listApiCredentials() {
  return apiJson<ApiCredentialsListResponse>("/v1/api-credentials");
}

export async function createApiCredential(name: string) {
  return apiJson<ApiCredentialCreatedResponse>("/v1/api-credentials", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

export async function revokeApiCredential(id: string) {
  const res = await apiFetch(`/v1/api-credentials/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = (await res.json()) as { error?: { message?: string } };
      message = body.error?.message ?? message;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) {
    return null;
  }
  return (await res.json()) as ApiCredentialMutationResponse;
}
