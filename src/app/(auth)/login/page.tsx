import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import { LoginForm } from "@/features/auth/components/login-form";

function LoginFallback() {
  return (
    <div className="flex flex-col items-center gap-3 text-muted-foreground">
      <Loader2 className="size-8 animate-spin" />
      <p className="text-sm">Loading…</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
