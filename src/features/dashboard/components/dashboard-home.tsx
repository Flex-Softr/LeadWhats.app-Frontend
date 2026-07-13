"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";

import { DashboardChartsLazy } from "@/features/dashboard/components/dashboard-charts-lazy";
import { DashboardKpiCard } from "@/features/dashboard/components/dashboard-kpi-card";
import { SummaryStatCard } from "@/features/dashboard/components/summary-stat-card";
import { SystemStatusBar } from "@/features/dashboard/components/system-status-bar";
import { WelcomeBanner } from "@/features/dashboard/components/welcome-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSessionIdentity } from "@/hooks/use-session-identity";
import { ApiError, apiJson } from "@/lib/api";
import type { DashboardOverviewResponse } from "@/types/dashboard";

const emptyBar = Array.from({ length: 6 }, (_, i) => {
  const t = new Date();
  t.setUTCMonth(t.getUTCMonth() - (5 - i), 1);
  return {
    label: t.toLocaleString("en-US", { month: "short", timeZone: "UTC" }),
    value: 0,
  };
});

const emptyLine = Array.from({ length: 14 }, (_, i) => {
  const t = new Date();
  t.setUTCDate(t.getUTCDate() - (13 - i));
  return {
    x: `${t.getUTCMonth() + 1}/${t.getUTCDate()}`,
    s1: 0,
    s2: 0,
    s3: 0,
    s4: 0,
  };
});

export function DashboardHome() {
  const { userId, workspaceId, routeKey } = useSessionIdentity();
  const [data, setData] = React.useState<DashboardOverviewResponse | null>(
    null
  );
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await apiJson<DashboardOverviewResponse>(
        "/v1/dashboard/overview"
      );
      setData(json);
      setError(null);
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 503 && e.code === "DATABASE_UNAVAILABLE") {
          setError(e.message);
        } else if (e.status >= 500 || e.code === "INTERNAL_ERROR") {
          setError(
            "The server hit an error loading your dashboard. Try again, or restart the API after `npx prisma migrate deploy` if you recently updated the app."
          );
        } else {
          setError(e.message);
        }
      } else {
        setError(e instanceof Error ? e.message : "Failed to load dashboard");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    setData(null);
    void load();
  }, [load, userId, workspaceId, routeKey]);

  if (loading && !data) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 lg:gap-6">
        <div className="h-14 animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-800/80" />
        <div className="h-28 animate-pulse rounded-2xl bg-violet-200/40 dark:bg-violet-950/40" />
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800/70"
            />
          ))}
        </div>
        <div className="grid min-h-[308px] gap-3 sm:gap-4 lg:grid-cols-2">
          <div className="min-h-[240px] animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800/70" />
          <div className="min-h-[240px] animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800/70" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800/70"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <Card className="rounded-xl border-red-200 bg-red-50/90 dark:border-red-900 dark:bg-red-950/40">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex gap-3">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-400" />
              <div>
                <p className="font-semibold text-red-900 dark:text-red-100">
                  Dashboard unavailable
                </p>
                <p className="mt-1 text-sm text-red-800/90 dark:text-red-200/90">
                  {error}
                </p>
              </div>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={load}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const barSeries =
    data.barSeries.length > 0 ? data.barSeries : emptyBar;
  const lineSeries =
    data.lineSeries.length > 0 ? data.lineSeries : emptyLine;

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 lg:gap-6">
      <SystemStatusBar
        status={data.systemStatus}
        lastUpdated={data.lastUpdatedLabel}
      />

      <div className="grid gap-5 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <WelcomeBanner
            devicesOnline={data.devicesOnline}
            messagesToday={data.messagesToday}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:col-span-5">
          {data.kpis.slice(0, 4).map((k) => (
            <DashboardKpiCard key={k.id} data={k} />
          ))}
        </div>
      </div>

      {data.kpis.length > 4 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {data.kpis.slice(4).map((k) => (
            <DashboardKpiCard key={k.id} data={k} />
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.summaries.map((s) => (
          <SummaryStatCard key={s.id} data={s} />
        ))}
      </div>

      <DashboardChartsLazy barSeries={barSeries} lineSeries={lineSeries} />

      {error ? (
        <p className="text-center text-xs text-amber-600 dark:text-amber-400">
          Showing cached data — refresh failed: {error}
        </p>
      ) : null}
    </div>
  );
}
