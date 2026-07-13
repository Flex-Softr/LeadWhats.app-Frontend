import type { AuthSessionPayload } from "@/types/auth";
import { getApiBaseUrl } from "@/lib/api-config";
import { ApiError, setAccessToken } from "@/lib/api";

async function parseError(res: Response): Promise<ApiError> {
  try {
    const body = (await res.json()) as {
      error?: { code?: string; message?: string };
    };
    return new ApiError(
      res.status,
      body.error?.message ?? res.statusText,
      body.error?.code
    );
  } catch {
    return new ApiError(res.status, res.statusText);
  }
}

export async function loginRequest(
  email: string,
  password: string
): Promise<AuthSessionPayload> {
  let res: Response;
  try {
    res = await fetch(`${getApiBaseUrl()}/api/v1/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new ApiError(
      0,
      "Cannot reach the API. Start the server in /server (npm run dev) on port 5001.",
      "NETWORK_ERROR"
    );
  }
  if (!res.ok) {
    throw await parseError(res);
  }
  const data = (await res.json()) as AuthSessionPayload;
  setAccessToken(data.accessToken);
  return data;
}

export async function registerRequest(input: {
  email: string;
  password: string;
  name?: string;
}): Promise<AuthSessionPayload> {
  let res: Response;
  try {
    res = await fetch(`${getApiBaseUrl()}/v1/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    throw new ApiError(
      0,
      "Cannot reach the API. Start the server in /server (npm run dev) on port 5001.",
      "NETWORK_ERROR"
    );
  }
  if (!res.ok) {
    throw await parseError(res);
  }
  const data = (await res.json()) as AuthSessionPayload;
  setAccessToken(data.accessToken);
  return data;
}

export async function logoutRequest(): Promise<void> {
  try {
    await fetch(`${getApiBaseUrl()}/v1/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch {
    /* offline — still clear client session */
  }
  setAccessToken(null);
}

export async function forgotPasswordRequest(email: string): Promise<{
  ok: true;
  resetUrl?: string;
  emailDelivered?: boolean;
}> {
  let res: Response;
  try {
    res = await fetch(`${getApiBaseUrl()}/v1/auth/forgot-password`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  } catch {
    throw new ApiError(
      0,
      "Cannot reach the API. Start the server in /server (npm run dev) on port 5001.",
      "NETWORK_ERROR"
    );
  }
  if (!res.ok) {
    throw await parseError(res);
  }
  return res.json() as Promise<{
    ok: true;
    resetUrl?: string;
    emailDelivered?: boolean;
  }>;
}

export async function resetPasswordRequest(input: {
  token: string;
  password: string;
}): Promise<{ ok: true }> {
  let res: Response;
  try {
    res = await fetch(`${getApiBaseUrl()}/v1/auth/reset-password`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    throw new ApiError(
      0,
      "Cannot reach the API. Start the server in /server (npm run dev) on port 5001.",
      "NETWORK_ERROR"
    );
  }
  if (!res.ok) {
    throw await parseError(res);
  }
  setAccessToken(null);
  return res.json() as Promise<{ ok: true }>;
}

export function buildGoogleOAuthStartUrl(next?: string | null): string {
  const url = new URL(`${getApiBaseUrl()}/v1/auth/google/start`);
  if (next) {
    url.searchParams.set("next", next);
  }
  return url.toString();
}
