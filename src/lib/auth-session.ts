const AUTH_SESSION_KEY = "fw_auth_session";

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

export function markAuthSessionActive(): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(AUTH_SESSION_KEY, "1");
}

export function clearAuthSessionMarker(): void {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(AUTH_SESSION_KEY);
}

export function hasAuthSessionMarker(): boolean {
  if (!canUseStorage()) return false;
  return window.localStorage.getItem(AUTH_SESSION_KEY) === "1";
}
