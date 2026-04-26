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
import type { AdminModerationResponse } from "@/types/admin-moderation";

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

type AdminModerationViewProps = {
  module: AdminModuleDefinition;
};

export function AdminModerationView({ module }: AdminModerationViewProps) {
  const { userId, workspaceId, routeKey } = useSessionIdentity();
  const [data, setData] = React.useState<AdminModerationResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await apiJson<AdminModerationResponse>(
        "/v1/admin/moderation"
      );
      setData(json);
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
      } else {
        setError(
          e instanceof Error ? e.message : "Failed to load moderation data"
        );
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
            <span className="ml-1">
              Failed-send inbox is derived from{" "}
              <code className="rounded bg-slate-100 px-1 text-[11px] dark:bg-slate-800">
                OutboundMessage
              </code>{" "}
              — there is no separate case queue yet.
            </span>
          </p>
        ) : null}
      </div>

      {loading && !data ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
          <Loader2 className="size-8 animate-spin text-violet-600 dark:text-violet-400" />
          <p className="text-sm">Loading moderation snapshot…</p>
        </div>
      ) : null}

      {error && !data ? (
        <Card className="max-w-lg rounded-2xl border-rose-200/90 bg-rose-50/80 dark:border-rose-900/60 dark:bg-rose-950/40">
          <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-rose-600 dark:text-rose-400" />
            <div className="space-y-1">
              <CardTitle className="text-base text-rose-900 dark:text-rose-100">
                Could not load moderation
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

          {data.scope === "platform" && data.topFailedWorkspaces.length > 0 ? (
            <Card className="rounded-2xl border-slate-200/90 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-base">
                  Workspaces by failed sends (30d)
                </CardTitle>
                <CardDescription>
                  Highest failure volume; use for prioritizing reviews.
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Workspace</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead className="text-right">Failed (30d)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.topFailedWorkspaces.map((w, i) => (
                      <TableRow key={`${w.slug}-${i}`}>
                        <TableCell className="font-medium">{w.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {w.slug}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {w.failed30d}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : null}

          <Card className="rounded-2xl border-slate-200/90 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-base">Recent failed sends</CardTitle>
              <CardDescription>
                Newest first. Error text comes from the messaging layer.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden lg:table-cell">When</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead className="hidden sm:table-cell">Kind</TableHead>
                    {data.scope === "platform" ? (
                      <>
                        <TableHead className="hidden md:table-cell">
                          Workspace
                        </TableHead>
                        <TableHead className="hidden xl:table-cell">Slug</TableHead>
                      </>
                    ) : null}
                    <TableHead className="hidden lg:table-cell">Device</TableHead>
                    <TableHead className="hidden sm:table-cell">Campaign</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentFailures.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={data.scope === "platform" ? 8 : 6}
                        className="text-center text-sm text-muted-foreground"
                      >
                        No failed outbound in scope — all clear.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.recentFailures.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="hidden text-muted-foreground lg:table-cell">
                          {fmtDate(r.createdAt)}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {r.toPhone}
                        </TableCell>
                        <TableCell className="hidden font-mono text-xs sm:table-cell">
                          {r.kind}
                        </TableCell>
                        {data.scope === "platform" ? (
                          <>
                            <TableCell className="hidden md:table-cell">
                              {r.workspaceName}
                            </TableCell>
                            <TableCell className="hidden text-muted-foreground xl:table-cell">
                              {r.workspaceSlug}
                            </TableCell>
                          </>
                        ) : null}
                        <TableCell className="hidden lg:table-cell">
                          {r.deviceName}
                        </TableCell>
                        <TableCell className="hidden max-w-[120px] truncate text-muted-foreground sm:table-cell">
                          {r.bulkCampaignName ?? "—"}
                        </TableCell>
                        <TableCell
                          className="max-w-[min(40vw,280px)] truncate text-xs text-rose-700 dark:text-rose-300"
                          title={r.errorMessage ?? ""}
                        >
                          {r.errorMessage ?? "—"}
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
