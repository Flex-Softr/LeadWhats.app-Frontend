"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { useSubscription } from "@/features/billing/subscription-context";

/** Paths accessible even when trial is expired so user can pay or manage profile */
const ALLOWED_EXPIRED_PREFIXES = ["/billing", "/profile"];

export function RequireSubscription({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isBootstrapping: authBootstrapping } = useAuth();
  const { hydrated, hasActiveSubscription, isTrialExpired } = useSubscription();
  const router = useRouter();
  const pathname = usePathname();

  const normalizedPath =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  const isAllowedPath = ALLOWED_EXPIRED_PREFIXES.some(
    (prefix) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)
  );

  React.useEffect(() => {
    if (authBootstrapping || !hydrated) return;
    if (!user) return;

    // Platform admins always have full access
    if (user.role === "ADMIN") return;

    // If trial is expired and no active paid plan, redirect non-allowed pages to /billing
    if (!hasActiveSubscription || isTrialExpired) {
      if (!isAllowedPath) {
        router.replace("/billing?expired=1");
      }
    }
  }, [
    authBootstrapping,
    hydrated,
    user,
    hasActiveSubscription,
    isTrialExpired,
    isAllowedPath,
    router,
  ]);

  if (authBootstrapping || !hydrated) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
        <Loader2 className="size-8 animate-spin text-foreground dark:text-muted-foreground" />
        <p className="text-sm">Loading your subscription…</p>
      </div>
    );
  }

  if (user?.role !== "ADMIN" && (!hasActiveSubscription || isTrialExpired) && !isAllowedPath) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
        <Loader2 className="size-8 animate-spin text-foreground dark:text-muted-foreground" />
        <p className="text-sm">Your 3-day free trial has expired. Redirecting to subscription page…</p>
      </div>
    );
  }

  return <>{children}</>;
}
