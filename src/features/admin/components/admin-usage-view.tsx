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
import type { AdminUsageResponse } from "@/types/admin-usage";

type AdminUsageViewProps = {
  module: AdminModuleDefinition;
};

const INVENTORY_LABELS: Record<
  keyof AdminUsageResponse["inventory"],
  string
> = {
  templates: "Message templates",
  contacts: "Contacts",
  contactGroups: "Contact groups",
  bulkCampaigns: "Bulk campaigns",
  autoReplyRules: "Auto-reply rules",
  chatbotFlows: "Chatbot flows",
  liveChatThreads: "Live chat threads",
};

export function AdminUsageView({ module }: AdminUsageViewProps) {
  const { userId, workspaceId, routeKey } = useSessionIdentity();
  const [data, setData] = React.useState<AdminUsageResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await apiJson<AdminUsageResponse>("/v1/admin/usage");
      setData(json);
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
      } else {
        setError(e instanceof Error ? e.message : "Failed to load usage");
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
          </p>
        ) : null}
      </div>

      {loading && !data ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
          <Loader2 className="size-8 animate-spin text-violet-600 dark:text-violet-400" />
          <p className="text-sm">Loading usage…</p>
        </div>
      ) : null}

      {error && !data ? (
        <Card className="max-w-lg rounded-2xl border-rose-200/90 bg-rose-50/80 dark:border-rose-900/60 dark:bg-rose-950/40">
          <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-rose-600 dark:text-rose-400" />
            <div className="space-y-1">
              <CardTitle className="text-base text-rose-900 dark:text-rose-100">
                Could not load usage
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

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="rounded-lg border-slate-200/90 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-base">Outbound status (30d)</CardTitle>
                <CardDescription>
                  Counts by delivery status for{" "}
                  <code className="rounded bg-slate-100 px-1 text-xs dark:bg-slate-800">
                    OutboundMessage
                  </code>
                  .
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
                    {data.byStatus30d.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-muted-foreground">
                          No outbound in this window.
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.byStatus30d.map((r) => (
                        <TableRow key={r.key}>
                          <TableCell className="font-mono text-xs">
                            {r.key}
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

            <Card className="rounded-lg border-slate-200/90 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-base">Outbound kind (30d)</CardTitle>
                <CardDescription>Text vs template sends.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kind</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.byKind30d.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-muted-foreground">
                          No outbound in this window.
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.byKind30d.map((r) => (
                        <TableRow key={r.key}>
                          <TableCell className="font-mono text-xs">
                            {r.key}
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

          <Card className="rounded-lg border-slate-200/90 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-base">Feature inventory</CardTitle>
              <CardDescription>
                Counts of objects that drive metering and quotas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(
                  Object.keys(data.inventory) as (keyof AdminUsageResponse["inventory"])[]
                ).map((key) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-2 rounded-md border border-slate-200/80 px-3 py-2 dark:border-slate-700"
                  >
                    <span className="text-sm text-muted-foreground">
                      {INVENTORY_LABELS[key]}
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">
                      {data.inventory[key]}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {data.scope === "platform" && data.topWorkspaces.length > 0 ? (
            <Card className="rounded-2xl border-slate-200/90 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-base">
                  Top workspaces by outbound (30d)
                </CardTitle>
                <CardDescription>
                  Ranked by total sends; ties broken by query order.
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Workspace</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead className="text-right">Outbound (30d)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.topWorkspaces.map((w, i) => (
                      <TableRow key={`${w.slug}-${i}`}>
                        <TableCell className="font-medium">{w.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {w.slug}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {w.outbound30d}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : null}

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
