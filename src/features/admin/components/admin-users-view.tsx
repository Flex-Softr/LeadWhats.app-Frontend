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
import type { AdminUsersResponse } from "@/types/admin-users";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

type AdminUsersViewProps = {
  module: AdminModuleDefinition;
};

export function AdminUsersView({ module }: AdminUsersViewProps) {
  const { userId, workspaceId, routeKey } = useSessionIdentity();
  const [data, setData] = React.useState<AdminUsersResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await apiJson<AdminUsersResponse>("/v1/admin/users");
      setData(json);
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
      } else {
        setError(e instanceof Error ? e.message : "Failed to load users");
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
            {data.scope === "platform" && data.rows.length >= 500
              ? " · Showing 500 most recent memberships"
              : null}
          </p>
        ) : null}
      </div>

      {loading && !data ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
          <Loader2 className="size-8 animate-spin text-violet-600 dark:text-violet-400" />
          <p className="text-sm">Loading users…</p>
        </div>
      ) : null}

      {error && !data ? (
        <Card className="max-w-lg rounded-2xl border-rose-200/90 bg-rose-50/80 dark:border-rose-900/60 dark:bg-rose-950/40">
          <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-rose-600 dark:text-rose-400" />
            <div className="space-y-1">
              <CardTitle className="text-base text-rose-900 dark:text-rose-100">
                Could not load users
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
                className="rounded-sm px-3 py-3 text-xs font-normal"
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

          <Card className="rounded-lg border-slate-200/90 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-base">
                {data.scope === "platform"
                  ? "Membership directory"
                  : "Workspace members"}
              </CardTitle>
              <CardDescription>
                One row per user–workspace membership (same person can appear
                multiple times across workspaces in platform scope).
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead className="hidden sm:table-cell">Name</TableHead>
                    <TableHead>Role</TableHead>
                    {data.scope === "platform" ? (
                      <>
                        <TableHead className="hidden md:table-cell">
                          Workspace
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">Slug</TableHead>
                      </>
                    ) : null}
                    <TableHead className="hidden xl:table-cell">Joined</TableHead>
                    <TableHead className="hidden xl:table-cell">
                      User since
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.rows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={data.scope === "platform" ? 7 : 5}
                        className="text-center text-sm text-muted-foreground"
                      >
                        No memberships found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.rows.map((r) => (
                      <TableRow key={`${r.userId}-${r.workspaceId}`}>
                        <TableCell className="font-medium">{r.email}</TableCell>
                        <TableCell className="hidden text-muted-foreground sm:table-cell">
                          {r.name ?? "—"}
                        </TableCell>
                        <TableCell>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium dark:bg-slate-800">
                            {r.role}
                          </span>
                        </TableCell>
                        {data.scope === "platform" ? (
                          <>
                            <TableCell className="hidden md:table-cell">
                              {r.workspaceName}
                            </TableCell>
                            <TableCell className="hidden text-muted-foreground lg:table-cell">
                              {r.workspaceSlug}
                            </TableCell>
                          </>
                        ) : null}
                        <TableCell className="hidden text-muted-foreground xl:table-cell">
                          {fmtDate(r.joinedAt)}
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground xl:table-cell">
                          {fmtDate(r.userCreatedAt)}
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
