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
import { cn } from "@/lib/utils";
import type { AdminFleetResponse } from "@/types/admin-fleet";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function shortSession(id: string): string {
  if (id.length <= 16) return id;
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}

type AdminFleetViewProps = {
  module: AdminModuleDefinition;
};

export function AdminFleetView({ module }: AdminFleetViewProps) {
  const { userId, workspaceId, routeKey } = useSessionIdentity();
  const [data, setData] = React.useState<AdminFleetResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await apiJson<AdminFleetResponse>("/v1/admin/fleet");
      setData(json);
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
      } else {
        setError(e instanceof Error ? e.message : "Failed to load fleet");
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
            {data.scope === "platform" && data.devices.length >= 500
              ? " · Showing 500 most recently updated devices"
              : null}
          </p>
        ) : null}
      </div>

      {loading && !data ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
          <Loader2 className="size-8 animate-spin text-violet-600 dark:text-violet-400" />
          <p className="text-sm">Loading fleet…</p>
        </div>
      ) : null}

      {error && !data ? (
        <Card className="max-w-lg rounded-2xl border-rose-200/90 bg-rose-50/80 dark:border-rose-900/60 dark:bg-rose-950/40">
          <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-rose-600 dark:text-rose-400" />
            <div className="space-y-1">
              <CardTitle className="text-base text-rose-900 dark:text-rose-100">
                Could not load fleet
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

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="rounded-2xl border-slate-200/90 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-base">By status</CardTitle>
                <CardDescription>
                  WhatsApp session state across devices in scope.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.byStatus.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-muted-foreground">
                          No devices registered.
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.byStatus.map((r) => (
                        <TableRow key={r.status}>
                          <TableCell className="font-mono text-xs">
                            {r.status}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {r.count}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl border-slate-200/90 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-base">Devices</CardTitle>
              <CardDescription>
                Recent updates first. Session ID is the Baileys session key.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    {data.scope === "platform" ? (
                      <>
                        <TableHead className="hidden lg:table-cell">
                          Workspace
                        </TableHead>
                        <TableHead className="hidden xl:table-cell">Slug</TableHead>
                      </>
                    ) : null}
                    <TableHead className="hidden sm:table-cell">Phone</TableHead>
                    <TableHead className="hidden font-mono text-xs lg:table-cell">
                      Session
                    </TableHead>
                    <TableHead className="hidden xl:table-cell">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.devices.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={data.scope === "platform" ? 7 : 5}
                        className="text-center text-sm text-muted-foreground"
                      >
                        No devices yet. Pair a session from Devices.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.devices.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">{d.name}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span
                            className={cn(
                              "rounded-md px-2 py-0.5 text-xs font-medium",
                              d.status === "CONNECTED"
                                ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200"
                                : "bg-amber-100 text-amber-950 dark:bg-amber-950/50 dark:text-amber-100"
                            )}
                          >
                            {d.status}
                          </span>
                        </TableCell>
                        {data.scope === "platform" ? (
                          <>
                            <TableCell className="hidden lg:table-cell">
                              {d.workspaceName}
                            </TableCell>
                            <TableCell className="hidden text-muted-foreground xl:table-cell">
                              {d.workspaceSlug}
                            </TableCell>
                          </>
                        ) : null}
                        <TableCell className="hidden sm:table-cell">
                          {d.phone ?? "—"}
                        </TableCell>
                        <TableCell
                          className="hidden max-w-[140px] truncate font-mono text-xs lg:table-cell"
                          title={d.sessionId}
                        >
                          {shortSession(d.sessionId)}
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground xl:table-cell">
                          {fmtDate(d.updatedAt)}
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
