import { getApiBaseUrl } from "@/lib/api-config";
import { isSafeInternalPath } from "@/lib/safe-redirect";

/** Starts Google OAuth2 (authorization code) on the API — user leaves the spa briefly. */
export function getGoogleOAuthStartUrl(next?: string | null): string {
  const base = getApiBaseUrl();
  const url = new URL(`${base}/v1/auth/google/start`);
  if (next && isSafeInternalPath(next)) {
    url.searchParams.set("next", next);
  }
  return url.toString();
}
