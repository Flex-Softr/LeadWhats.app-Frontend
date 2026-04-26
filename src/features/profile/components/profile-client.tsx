"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, CreditCard, LogOut, Mail, User } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/components/providers/auth-provider";
import { ConfirmDestructiveDialog } from "@/features/shared/components/confirm-destructive-dialog";
import { userDisplayName, userInitials } from "@/lib/user-display";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function workspaceRoleLabel(role: string): string {
  switch (role) {
    case "OWNER":
      return "Owner";
    case "ADMIN":
      return "Admin";
    default:
      return "Member";
  }
}

export function ProfileClient() {
  const router = useRouter();
  const { user, workspace, logout } = useAuth();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = React.useState(false);

  async function confirmLogout() {
    try {
      await logout();
      toast.success("Signed out", {
        description: "You can sign in again anytime.",
      });
      router.push("/login");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      toast.error("Could not sign out", { description: message });
      throw err;
    }
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <Card className="rounded-3xl border border-white/70 bg-white/90 shadow-md dark:border-slate-800/80 dark:bg-slate-950/60">
        <CardHeader>
          <CardTitle className="text-xl">Account</CardTitle>
          <CardDescription>
            Signed in as {user.email}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <Avatar className="size-20 border border-slate-200 dark:border-slate-700">
            <AvatarFallback className="bg-gradient-to-br from-violet-600 to-fuchsia-600 text-2xl font-semibold text-white">
              {userInitials(user)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Display name
              </p>
              <p className="mt-1 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
                <User className="size-5 shrink-0 text-slate-400" aria-hidden />
                {userDisplayName(user)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Email
              </p>
              <p className="mt-1 flex items-center gap-2 break-all text-slate-700 dark:text-slate-300">
                <Mail className="size-4 shrink-0 text-slate-400" aria-hidden />
                {user.email}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {workspace ? (
        <Card className="rounded-3xl border border-white/70 bg-white/90 shadow-md dark:border-slate-800/80 dark:bg-slate-950/60">
          <CardHeader>
            <CardTitle className="text-xl">Workspace</CardTitle>
            <CardDescription>
              The organization this session is using.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
              <Building2 className="mt-0.5 size-5 shrink-0 text-violet-600 dark:text-violet-400" />
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 dark:text-slate-50">
                  {workspace.name}
                </p>
                <p className="mt-1 font-mono text-sm text-slate-500 dark:text-slate-400">
                  {workspace.slug}
                </p>
                <Badge variant="secondary" className="mt-3">
                  {workspaceRoleLabel(workspace.role)}
                </Badge>
              </div>
            </div>
            <Link
              href="/billing"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "inline-flex w-full items-center justify-center gap-2"
              )}
            >
              <CreditCard className="size-4" />
              Plans & billing
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <Card className="rounded-3xl border border-red-200/60 bg-red-50/30 dark:border-red-900/40 dark:bg-red-950/20">
        <CardHeader>
          <CardTitle className="text-lg text-slate-900 dark:text-slate-50">
            Session
          </CardTitle>
          <CardDescription>
            Log out on this browser. You can sign in again anytime.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="destructive"
            className="w-full gap-2 sm:w-auto"
            onClick={() => setLogoutConfirmOpen(true)}
          >
            <LogOut className="size-4" />
            Log out
          </Button>
        </CardContent>
      </Card>

      <ConfirmDestructiveDialog
        open={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
        title="Sign out?"
        description="You will need to sign in again to use this workspace on this browser."
        confirmLabel="Sign out"
        destructive={false}
        onConfirm={confirmLogout}
      />
    </div>
  );
}
