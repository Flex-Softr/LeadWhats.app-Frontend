"use client";

import * as React from "react";
import Link from "next/link";
import {
  CreditCard,
  Loader2,
  Shield,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { StatCard } from "@/features/shared/components/stat-card";
import { fetchAdminOverview } from "@/features/admin/lib/admin-api";
import type { AdminOverviewResponse } from "@/types/admin-api";
import { ApiError } from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AdminOverviewClient() {
  const [data, setData] = React.useState<AdminOverviewResponse | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const overview = await fetchAdminOverview();
        if (!cancelled) setData(overview);
      } catch (err) {
        const msg =
          err instanceof ApiError ? err.message : "Could not load overview.";
        toast.error("Admin overview failed", { description: msg });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin" />
        <p className="text-sm">Loading admin overview…</p>
      </div>
    );
  }

  if (!data) {
    return (
      <p className="text-sm text-muted-foreground">
        Overview data is unavailable.
      </p>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="rounded-lg border border-border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Shield className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Admin Overview
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Platform health across users, subscriptions, and payments.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total users"
          value={data.users.total}
          icon={Users}
          accent="blue"
        />
        <StatCard
          label="Blocked"
          value={data.users.blocked}
          icon={Users}
          accent="red"
        />
        <StatCard
          label="Paid workspaces"
          value={data.workspaces.paid}
          icon={CreditCard}
          accent="green"
        />
        <StatCard
          label="Pending payments"
          value={data.payments.pending}
          icon={Wallet}
          accent="amber"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Customers:{" "}
              <span className="font-semibold text-foreground">
                {data.users.customers}
              </span>
            </p>
            <p>
              Admins:{" "}
              <span className="font-semibold text-foreground">
                {data.users.admins}
              </span>
            </p>
            <p>
              New (7 days):{" "}
              <span className="font-semibold text-foreground">
                {data.users.newLast7Days}
              </span>
            </p>
            <Link
              href="/admin/users"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-2")}
            >
              Manage users
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subscriptions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Workspaces:{" "}
              <span className="font-semibold text-foreground">
                {data.workspaces.total}
              </span>
            </p>
            <p>
              Free:{" "}
              <span className="font-semibold text-foreground">
                {data.workspaces.free}
              </span>
            </p>
            <p>
              Paid:{" "}
              <span className="font-semibold text-foreground">
                {data.workspaces.paid}
              </span>
            </p>
            <Link
              href="/admin/subscriptions"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-2")}
            >
              Manage subscriptions
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Paid:{" "}
              <span className="font-semibold text-foreground">
                {data.payments.paid}
              </span>
            </p>
            <p>
              Pending review:{" "}
              <span className="font-semibold text-foreground">
                {data.payments.pending}
              </span>
            </p>
            <Link
              href="/admin/payments"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-2")}
            >
              Verify payments
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
