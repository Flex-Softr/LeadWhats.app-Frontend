"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, ArrowUpRight, Loader2 } from "lucide-react";

import {
  ADMIN_BASE_PATH,
  ADMIN_NAV_SECTIONS,
} from "@/config/admin-navigation";
import { AdminNoDataBanner } from "@/features/admin/components/admin-no-data-banner";
import { ADMIN_MODULE_REGISTRY } from "@/features/admin/lib/admin-module-registry";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSessionIdentity } from "@/hooks/use-session-identity";
import { ApiError, apiJson } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { AdminOverviewResponse } from "@/types/admin-overview";

function moduleStatMap(
  stats: AdminOverviewResponse["moduleStats"]
): Map<string, (typeof stats)[number]> {
  const m = new Map<string, (typeof stats)[number]>();
  for (const s of stats) m.set(s.moduleId, s);
  return m;
}

export function AdminOverview() {
  const { userId, workspaceId, routeKey } = useSessionIdentity();
  const [data, setData] = React.useState<AdminOverviewResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await apiJson<AdminOverviewResponse>("/v1/admin/overview");
      setData(json);
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
      } else {
        setError(e instanceof Error ? e.message : "Failed to load overview");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    setData(null);
    void load();
  }, [load, userId, workspaceId, routeKey]);

  const statsByModule = React.useMemo(
    () => (data ? moduleStatMap(data.moduleStats) : null),
    [data]
  );

  if (loading && !data) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
        <Loader2 className="size-8 animate-spin text-violet-600 dark:text-violet-400" />
        <p className="text-sm">Loading admin overview…</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <Card className="max-w-lg rounded-2xl border-rose-200/90 bg-rose-50/80 dark:border-rose-900/60 dark:bg-rose-950/40">
        <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <div className="space-y-1">
            <CardTitle className="text-base text-rose-900 dark:text-rose-100">
              Could not load overview
            </CardTitle>
            <CardDescription className="text-rose-800/90 dark:text-rose-200/90">
              {error}
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10">
      <AdminNoDataBanner meta={data.meta} />

      <div className="max-w-3xl space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Command center
          </h2>
          <Badge
            variant="secondary"
            className="rounded-lg text-[11px] font-medium uppercase tracking-wide text-slate-600 dark:text-slate-400"
          >
            {data.scope === "platform" ? "Platform scope" : "Workspace scope"}
          </Badge>
        </div>
        <p className="text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
          Operator view for the full FlexoWhats SaaS: revenue, customers,
          WhatsApp fleet health, compliance, and platform reliability. Each card
          below maps to a module you can extend with APIs, queues, and BI.
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Updated {new Date(data.generatedAt).toLocaleString()}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {data.kpis.map((k) => (
          <Card
            key={k.id}
            className="rounded-2xl border-slate-200/90 bg-white/90 dark:border-slate-800 dark:bg-slate-950/40"
          >
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-medium uppercase tracking-wide">
                {k.label}
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {k.value}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="secondary"
                  className={cn(
                    "rounded-lg text-xs font-medium",
                    k.positive
                      ? "border-emerald-200/80 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200"
                      : "border-amber-200/80 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-100"
                  )}
                >
                  {k.delta}
                </Badge>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {k.hint}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          Module map
        </h3>
        <div className="space-y-8">
          {ADMIN_NAV_SECTIONS.filter((s) => s.id !== "command").map(
            (section) => (
              <div key={section.id}>
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {section.label}
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {section.items.map((item) => {
                    if (item.href === ADMIN_BASE_PATH) return null;
                    const mod = item.moduleId
                      ? ADMIN_MODULE_REGISTRY[item.moduleId]
                      : null;
                    const live =
                      item.moduleId && statsByModule
                        ? statsByModule.get(item.moduleId)
                        : undefined;
                    return (
                      <Link key={item.href} href={item.href} className="group">
                        <Card className="h-full rounded-2xl border-slate-200/90 bg-white/90 transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-950/40 dark:hover:shadow-slate-900/40">
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="text-base font-semibold leading-snug">
                                {item.title}
                              </CardTitle>
                              <ArrowUpRight className="size-4 shrink-0 text-slate-300 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-amber-600 dark:text-slate-600 dark:group-hover:text-amber-400" />
                            </div>
                            <CardDescription className="text-sm leading-relaxed">
                              {mod?.purpose ?? item.description}
                            </CardDescription>
                            {live ? (
                              <p className="pt-1 text-xs tabular-nums text-slate-600 dark:text-slate-300">
                                <span className="font-medium text-slate-800 dark:text-slate-100">
                                  {live.value}
                                </span>
                                {live.label && live.label !== "—" ? (
                                  <span className="text-slate-400 dark:text-slate-500">
                                    {" "}
                                    · {live.label}
                                  </span>
                                ) : null}
                              </p>
                            ) : null}
                          </CardHeader>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
