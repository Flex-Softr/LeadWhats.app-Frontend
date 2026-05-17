"use client";

import * as React from "react";
import type { AuthUser, AuthWorkspace } from "@/types/auth";
import {
  getAccessToken,
  isAccessTokenExpired,
  refreshAccessToken,
  setAccessToken,
} from "@/lib/api";
import {
  clearAuthSessionMarker,
  hasAuthSessionMarker,
  markAuthSessionActive,
} from "@/lib/auth-session";
import {
  loginRequest,
  logoutRequest,
  registerRequest,
} from "@/lib/auth-api";

type AuthContextValue = {
  user: AuthUser | null;
  workspace: AuthWorkspace | null;
  /** True until first refresh/bootstrap attempt finishes */
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    email: string;
    password: string;
    name?: string;
  }) => Promise<void>;
  /** Loads user/workspace from the httpOnly refresh cookie (used after Google OAuth redirect). */
  syncAuthFromApi: () => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [workspace, setWorkspace] = React.useState<AuthWorkspace | null>(null);
  const [isBootstrapping, setIsBootstrapping] = React.useState(true);

  const logout = React.useCallback(async () => {
    await logoutRequest();
    clearAuthSessionMarker();
    setAccessToken(null);
    setUser(null);
    setWorkspace(null);
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!hasAuthSessionMarker()) {
          setUser(null);
          setWorkspace(null);
          return;
        }

        const data = await refreshAccessToken();
        if (cancelled) return;
        if (data) {
          markAuthSessionActive();
          setUser(data.user);
          setWorkspace(data.workspace);
        } else {
          clearAuthSessionMarker();
          setUser(null);
          setWorkspace(null);
        }
      } catch {
        if (!cancelled) {
          clearAuthSessionMarker();
          setUser(null);
          setWorkspace(null);
        }
      } finally {
        if (!cancelled) setIsBootstrapping(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    if (isBootstrapping || !user) return;

    const checkTokenExpiry = () => {
      const token = getAccessToken();
      if (!token || isAccessTokenExpired(token)) {
        void logout();
      }
    };

    const intervalId = window.setInterval(checkTokenExpiry, 60_000);
    return () => window.clearInterval(intervalId);
  }, [isBootstrapping, user, logout]);

  const login = React.useCallback(async (email: string, password: string) => {
    const data = await loginRequest(email, password);
    markAuthSessionActive();
    setUser(data.user);
    setWorkspace(data.workspace);
  }, []);

  const register = React.useCallback(
    async (input: { email: string; password: string; name?: string }) => {
      const data = await registerRequest(input);
      markAuthSessionActive();
      setUser(data.user);
      setWorkspace(data.workspace);
    },
    []
  );

  const syncAuthFromApi = React.useCallback(async () => {
    try {
      const data = await refreshAccessToken();
      if (data) {
        markAuthSessionActive();
        setUser(data.user);
        setWorkspace(data.workspace);
        return true;
      }
      clearAuthSessionMarker();
      setUser(null);
      setWorkspace(null);
      return false;
    } catch {
      clearAuthSessionMarker();
      setUser(null);
      setWorkspace(null);
      return false;
    }
  }, []);

  const value = React.useMemo(
    () => ({
      user,
      workspace,
      isBootstrapping,
      isAuthenticated: !!user,
      login,
      register,
      syncAuthFromApi,
      logout,
    }),
    [user, workspace, isBootstrapping, login, register, syncAuthFromApi, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
