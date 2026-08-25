import { apiFetch, apiJson } from "@/lib/api";
import type { AuthUser, AuthWorkspace } from "@/types/auth";

export type ProfileResponse = {
  user: AuthUser;
  workspace: AuthWorkspace;
};

export type UpdateProfileInput = {
  name?: string | null;
  phone?: string | null;
};

export type ChangePasswordInput = {
  currentPassword?: string;
  newPassword: string;
};

export type ChangePasswordResponse = {
  ok: boolean;
  message: string;
};

export async function getProfile(): Promise<ProfileResponse> {
  return apiJson<ProfileResponse>("/v1/auth/me");
}

export async function updateProfile(
  input: UpdateProfileInput
): Promise<ProfileResponse> {
  return apiJson<ProfileResponse>("/v1/auth/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function changePassword(
  input: ChangePasswordInput
): Promise<ChangePasswordResponse> {
  return apiJson<ChangePasswordResponse>("/v1/auth/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function logoutAllSessions(): Promise<void> {
  await apiFetch("/v1/auth/logout-all", {
    method: "POST",
  });
}
