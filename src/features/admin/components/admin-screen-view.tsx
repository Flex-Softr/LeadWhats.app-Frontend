"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

import { ADMIN_BASE_PATH } from "@/config/admin-navigation";
import type { AdminModuleDefinition } from "@/features/admin/lib/admin-module-registry";
import { AdminNoDataBanner } from "@/features/admin/components/admin-no-data-banner";
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
import type { AdminScreenResponse } from "@/types/admin-screen";

function cellStr(v: string | number | null): string {
  if (v === null || v === undefined) return "—";
  return String(v);
}

type AdminScreenViewProps = {
  module: AdminModuleDefinition;
};

export function AdminScreenView({ module }: AdminScreenViewProps) {
  const { userId, workspaceId, routeKey } = useSessionIdentity();
  const [data, setData] = React.useState<AdminScreenResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await apiJson<AdminScreenResponse>(
        `/v1/admin/screen/${module.id}`
      );
      setData(json);
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
      } else {
        setError(e instanceof Error ? e.message : "Failed to load screen");
      }
    } finally {
      setLoading(false);
    }
  }, [module.id]);

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
          <p className="text-sm">Loading…</p>
        </div>
      ) : null}

      {error && !data ? (
        <Card className="max-w-lg rounded-2xl border-rose-200/90 bg-rose-50/80 dark:border-rose-900/60 dark:bg-rose-950/40">
          <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-rose-600 dark:text-rose-400" />
            <div className="space-y-1">
              <CardTitle className="text-base text-rose-900 dark:text-rose-100">
                Could not load this screen
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

          {data.kpis.length > 0 ? (
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
                    <span className="ml-1 text-muted-foreground">
                      ({k.hint})
                    </span>
                  ) : null}
                </Badge>
              ))}
            </div>
          ) : null}

          {data.tables.map((tbl) => (
            <Card
              key={tbl.id}
              className="rounded-2xl border-slate-200/90 dark:border-slate-800"
            >
              <CardHeader>
                <CardTitle className="text-base">{tbl.title}</CardTitle>
                {tbl.description ? (
                  <CardDescription>{tbl.description}</CardDescription>
                ) : null}
              </CardHeader>
              <CardContent className="overflow-x-auto">
                {tbl.rows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No rows for this block.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {tbl.columns.map((c) => (
                          <TableHead key={c.field}>{c.header}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tbl.rows.map((row, ri) => (
                        <TableRow key={ri}>
                          {tbl.columns.map((c) => (
                            <TableCell
                              key={c.field}
                              className="max-w-[280px] truncate text-xs sm:text-sm"
                              title={cellStr(row[c.field] ?? null)}
                            >
                              {cellStr(row[c.field] ?? null)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          ))}

          {data.notes.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {data.notes.map((n, i) => (
                <li key={`${i}-${n.slice(0, 24)}`}>{n}</li>
              ))}
            </ul>
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
