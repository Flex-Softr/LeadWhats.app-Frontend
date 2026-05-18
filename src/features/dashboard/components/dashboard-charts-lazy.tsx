"use client";

import dynamic from "next/dynamic";

import type {
  DashboardBarPoint,
  DashboardLinePoint,
} from "@/types/dashboard";

const DashboardChartsInner = dynamic(
  () =>
    import("@/features/dashboard/components/dashboard-charts").then(
      (m) => m.DashboardCharts
    ),
  {
    ssr: false,
    loading: () => (
      <div className="grid min-h-[308px] gap-5 sm:gap-6 lg:grid-cols-2">
        <div className="min-h-[308px] animate-pulse rounded-lg border border-white/60 bg-white/50 dark:border-slate-800 dark:bg-slate-900/50" />
        <div className="min-h-[308px] animate-pulse rounded-lg border border-white/60 bg-white/50 dark:border-slate-800 dark:bg-slate-900/50" />
      </div>
    ),
  }
);

type DashboardChartsLazyProps = {
  barSeries: DashboardBarPoint[];
  lineSeries: DashboardLinePoint[];
};

export function DashboardChartsLazy({
  barSeries,
  lineSeries,
}: DashboardChartsLazyProps) {
  return (
    <DashboardChartsInner barSeries={barSeries} lineSeries={lineSeries} />
  );
}
