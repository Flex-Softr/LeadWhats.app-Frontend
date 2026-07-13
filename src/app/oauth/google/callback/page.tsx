import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import { GoogleOAuthCallbackClient } from "@/features/auth/components/google-oauth-callback-client";

function CallbackFallback() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader2 className="size-8 animate-spin" />
      <p className="text-sm">Finishing Google sign-in…</p>
    </div>
  );
}

export default function GoogleOAuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackFallback />}>
      <GoogleOAuthCallbackClient />
    </Suspense>
  );
}
