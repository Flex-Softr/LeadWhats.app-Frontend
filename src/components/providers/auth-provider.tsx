"use client";

import * as React from "react";
import type { AuthUser, AuthWorkspace } from "@/types/auth";
import { refreshAccessToken, setAccessToken } from "@/lib/api";
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
  logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [workspace, setWorkspace] = React.useState<AuthWorkspace | null>(null);
  const [isBootstrapping, setIsBootstrapping] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await refreshAccessToken();
        if (cancelled) return;
        if (data) {
          setUser(data.user);
          setWorkspace(data.workspace);
        } else {
          setUser(null);
          setWorkspace(null);
        }
      } catch {
        if (!cancelled) {
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

  const login = React.useCallback(async (email: string, password: string) => {
    const data = await loginRequest(email, password);
    setUser(data.user);
    setWorkspace(data.workspace);
  }, []);

  const register = React.useCallback(
    async (input: { email: string; password: string; name?: string }) => {
      const data = await registerRequest(input);
      setUser(data.user);
      setWorkspace(data.workspace);
    },
    []
  );

  const logout = React.useCallback(async () => {
    await logoutRequest();
    setAccessToken(null);
    setUser(null);
    setWorkspace(null);
  }, []);

  const value = React.useMemo(
    () => ({
      user,
      workspace,
      isBootstrapping,
      isAuthenticated: !!user,
      login,
      register,
      logout,
    }),
    [user, workspace, isBootstrapping, login, register, logout]
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
