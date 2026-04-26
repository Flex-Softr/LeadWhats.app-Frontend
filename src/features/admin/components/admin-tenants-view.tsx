"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

import { ADMIN_BASE_PATH } from "@/config/admin-navigation";
import { AdminNoDataBanner } from "@/features/admin/components/admin-no-data-banner";
import type { AdminModuleDefinition } from "@/features/admin/lib/admin-module-registry";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSessionIdentity } from "@/hooks/use-session-identity";
import { ApiError, apiJson } from "@/lib/api";
import type { AdminTenantsResponse } from "@/types/admin-tenants";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

type AdminTenantsViewProps = {
  module: AdminModuleDefinition;
};

export function AdminTenantsView({ module }: AdminTenantsViewProps) {
  const { userId, workspaceId, routeKey } = useSessionIdentity();
  const [data, setData] = React.useState<AdminTenantsResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await apiJson<AdminTenantsResponse>("/v1/admin/tenants");
      setData(json);
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
      } else {
        setError(e instanceof Error ? e.message : "Failed to load tenants");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    setData(null);
    void load();
  }, [load, userId, workspaceId, routeKey]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
            {module.subtitle}
          </p>
          {data ? (
            <Badge
              variant="secondary"
              className="rounded-lg text-[11px] font-medium uppercase tracking-wide"
            >
              {data.scope === "platform" ? "Platform" : "Workspace"} data
            </Badge>
          ) : null}
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {module.title}
        </h2>
        <p className="max-w-3xl text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
          {module.purpose}
        </p>
        {data ? (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Updated {new Date(data.generatedAt).toLocaleString()}
            {data.scope === "platform" && data.tenants.length >= 500
              ? " · Showing 500 most recently updated workspaces"
              : null}
          </p>
        ) : null}
      </div>

      {loading && !data ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
          <Loader2 className="size-8 animate-spin text-violet-600 dark:text-violet-400" />
          <p className="text-sm">Loading tenants…</p>
        </div>
      ) : null}

      {error && !data ? (
        <Card className="max-w-lg rounded-2xl border-rose-200/90 bg-rose-50/80 dark:border-rose-900/60 dark:bg-rose-950/40">
          <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-rose-600 dark:text-rose-400" />
            <div className="space-y-1">
              <CardTitle className="text-base text-rose-900 dark:text-rose-100">
                Could not load tenants
              </CardTitle>
              <CardDescription className="text-rose-800/90 dark:text-rose-200/90">
                {error}
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      ) : null}

      {data ? (
        <>
          <AdminNoDataBanner meta={data.meta} />

          <div className="flex flex-wrap gap-2">
            {data.kpis.map((k) => (
              <Badge
                key={k.label}
                variant="secondary"
                className="rounded-lg px-3 py-1.5 text-xs font-normal"
              >
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {k.label}:{" "}
                </span>
                {k.value}
                {k.hint ? (
                  <span className="ml-1 text-muted-foreground">({k.hint})</span>
                ) : null}
              </Badge>
            ))}
          </div>

          <Card className="rounded-2xl border-slate-200/90 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-base">
                {data.scope === "platform"
                  ? "Workspace directory"
                  : "Your workspace"}
              </CardTitle>
              <CardDescription>
                Plans, subscription status, team size, and WhatsApp device counts.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead className="hidden md:table-cell">Billing</TableHead>
                    <TableHead className="text-right">Members</TableHead>
                    <TableHead className="hidden text-right sm:table-cell">
                      Devices
                    </TableHead>
                    <TableHead className="hidden text-right lg:table-cell">
                      Online
                    </TableHead>
                    <TableHead className="hidden xl:table-cell">Created</TableHead>
                    <TableHead className="hidden xl:table-cell">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.tenants.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-center text-sm text-muted-foreground"
                      >
                        No workspaces found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.tenants.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {t.slug}
                        </TableCell>
                        <TableCell>{t.plan}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {t.subscriptionStatus ?? "—"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {t.memberCount}
                        </TableCell>
                        <TableCell className="hidden text-right tabular-nums sm:table-cell">
                          {t.deviceCount}
                        </TableCell>
                        <TableCell className="hidden text-right tabular-nums lg:table-cell">
                          {t.connectedDevices}
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground xl:table-cell">
                          {fmtDate(t.createdAt)}
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground xl:table-cell">
                          {fmtDate(t.updatedAt)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Link
            href={ADMIN_BASE_PATH}
            className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:underline dark:text-amber-400"
          >
            <ArrowLeft className="size-4" />
            Back to command center
          </Link>
        </>
      ) : null}
    </div>
  );
}
