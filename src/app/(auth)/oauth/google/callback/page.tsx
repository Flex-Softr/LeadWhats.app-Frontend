import { Suspense } from "react";

import { GoogleOAuthCallback } from "@/features/auth/components/google-oauth-callback";

function Fallback() {
  return (
    <div className="flex flex-col items-center gap-3 text-muted-foreground">
      <p className="text-sm">Loading…</p>
    </div>
  );
}

export default function GoogleOAuthCallbackPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <GoogleOAuthCallback />
    </Suspense>
  );
}
