"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";
import { toast } from "sonner";

import {
  AuthFieldLabel,
  AuthIconInput,
  AuthPasswordField,
} from "@/features/auth/components/auth-form-primitives";
import { GoogleBrandIcon } from "@/features/auth/components/google-brand-icon";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { getGoogleOAuthStartUrl } from "@/lib/auth-google";
import { dashboardPath } from "@/config/app-routes";
import { isSafeInternalPath } from "@/lib/safe-redirect";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, isBootstrapping } = useAuth();

  React.useEffect(() => {
    if (!isBootstrapping && user) {
      const next = searchParams.get("next");
      router.replace(isSafeInternalPath(next) ? next : dashboardPath());
    }
  }, [isBootstrapping, user, router, searchParams]);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      await login(email, password);
      toast.success("Signed in");
      const next = searchParams.get("next");
      router.replace(isSafeInternalPath(next) ? next : dashboardPath());
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Could not sign in. Try again.";
      toast.error(msg);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="w-full">
      <div className="mb-8 space-y-2">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
          Sign in
        </h1>
        <p className="text-[15px] leading-relaxed text-muted-foreground">
          Welcome back — use your FlexoWhats account to open the dashboard.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <AuthFieldLabel htmlFor="email">Email address</AuthFieldLabel>
          <AuthIconInput
            id="email"
            type="email"
            autoComplete="email"
            required
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
        </div>
        <div className="space-y-2">
          <AuthFieldLabel htmlFor="password">Password</AuthFieldLabel>
          <AuthPasswordField
            id="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
        </div>

        <Button
          type="submit"
          disabled={pending}
          className="h-11 w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 font-semibold text-white shadow-md shadow-violet-950/20 hover:from-violet-500 hover:to-fuchsia-500 dark:shadow-violet-950/30"
        >
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="relative py-6">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          <span className="bg-white px-3 dark:bg-slate-950">Or continue with</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-11 w-full rounded-xl border-slate-200/90 bg-white font-medium dark:border-slate-700 dark:bg-slate-950/50"
        onClick={() => {
          const next = searchParams.get("next");
          window.location.href = getGoogleOAuthStartUrl(
            isSafeInternalPath(next) ? next : undefined
          );
        }}
      >
        <GoogleBrandIcon className="mr-2 size-5 shrink-0" />
        Continue with Google
      </Button>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link
          href="/register"
          className="font-semibold text-primary hover:underline"
        >
          Create account
        </Link>
      </p>
    </div>
  );
}
