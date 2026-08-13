"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";

/** Restricts /admin/* to platform ADMIN users. */
export function RequirePlatformAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isBootstrapping } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (isBootstrapping) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (user.role !== "ADMIN") {
      router.replace("/");
    }
  }, [isBootstrapping, user, router, pathname]);

  if (isBootstrapping || !user) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="size-8 animate-spin" />
        <p className="text-sm">Checking admin access…</p>
      </div>
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
        Redirecting…
      </div>
    );
  }

  return <>{children}</>;
}
