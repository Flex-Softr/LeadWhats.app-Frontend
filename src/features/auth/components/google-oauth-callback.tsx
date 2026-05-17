"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { dashboardPath } from "@/config/app-routes";
import { useAuth } from "@/components/providers/auth-provider";
import { isSafeInternalPath } from "@/lib/safe-redirect";

const ERROR_MESSAGES: Record<string, string> = {
  access_denied: "Google sign-in was cancelled.",
  oauth_not_configured:
    "Google sign-in is not configured on the server. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.",
  invalid_state: "Sign-in session expired. Try again.",
  GOOGLE_EMAIL_UNVERIFIED:
    "Your Google account email must be verified before you can sign in.",
  GOOGLE_LINK_MISMATCH:
    "This email is already linked to a different Google account.",
  EMAIL_TAKEN: "That email is already registered.",
  GOOGLE_OAUTH_DISABLED: "Google sign-in is not available.",
  GOOGLE_TOKEN_INVALID: "Google sign-in could not be completed.",
  GOOGLE_PROFILE_INVALID: "Google returned an incomplete profile.",
  GOOGLE_OAUTH_FAILED: "Google sign-in failed.",
};

export function GoogleOAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { syncAuthFromApi } = useAuth();

  React.useEffect(() => {
    let cancelled = false;
    const error = searchParams.get("error");
    const ok = searchParams.get("ok");
    const next = searchParams.get("next");

    void (async () => {
      if (error) {
        if (!cancelled) {
          toast.error(ERROR_MESSAGES[error] ?? "Google sign-in failed.");
          router.replace("/login");
        }
        return;
      }

      if (ok === "1") {
        const success = await syncAuthFromApi();
        if (cancelled) return;
        if (success) {
          toast.success("Signed in with Google");
          router.replace(isSafeInternalPath(next) ? next : dashboardPath());
          return;
        }
        toast.error("Could not finish sign-in. Try again.");
        router.replace("/login");
        return;
      }

      if (!cancelled) {
        router.replace("/login");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams, syncAuthFromApi]);

  return (
    <div className="flex flex-col items-center gap-3 text-muted-foreground">
      <Loader2 className="size-8 animate-spin" />
      <p className="text-sm">Completing Google sign-in…</p>
    </div>
  );
}
