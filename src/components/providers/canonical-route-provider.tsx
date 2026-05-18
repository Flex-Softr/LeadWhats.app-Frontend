"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

const LEGACY_DASHBOARD_PREFIX = "/user/dashboard";

export function CanonicalRouteProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    if (
      pathname !== LEGACY_DASHBOARD_PREFIX &&
      !pathname.startsWith(`${LEGACY_DASHBOARD_PREFIX}/`)
    ) {
      return;
    }

    const canonicalPath = pathname.slice(LEGACY_DASHBOARD_PREFIX.length) || "/";
    router.replace(`${canonicalPath}${window.location.search}`);
  }, [pathname, router]);

  return <>{children}</>;
}
