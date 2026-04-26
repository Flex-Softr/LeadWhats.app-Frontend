import type { MetricCardData } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function MiniBars() {
  const heights = [40, 65, 45, 80, 55, 90, 70];
  return (
    <div className="flex h-8 items-end gap-0.5 opacity-90">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-1 rounded-sm bg-emerald-500/80 dark:bg-emerald-400/80"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

export function MetricStatCard({ metric }: { metric: MetricCardData }) {
  return (
    <Card className="border-slate-200/80 shadow-sm dark:border-slate-800">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {metric.title}
        </CardTitle>
        <div
          className={cn(
            "flex size-9 items-center justify-center rounded-lg text-white shadow-sm",
            metric.iconClass
          )}
        />
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {metric.value}
        </p>
        <div className="flex items-end justify-between gap-2">
          <p
            className={cn(
              "text-xs font-medium",
              metric.trend.accentClass,
              "flex items-center gap-1"
            )}
          >
            <span aria-hidden>↑</span>
            <span>
              {metric.trend.delta} {metric.trend.label}
            </span>
          </p>
          <MiniBars />
        </div>
      </CardContent>
    </Card>
  );
}
