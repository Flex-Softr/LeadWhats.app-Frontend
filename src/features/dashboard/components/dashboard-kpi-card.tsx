import type { LucideIcon } from "lucide-react";
import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Gauge,
  MessageCircle,
  Minus,
  Send,
  Smartphone,
  Users,
} from "lucide-react";

import type { DashboardKpiCardData } from "@/types/dashboard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const KPI_ICONS: Record<DashboardKpiCardData["iconKey"], LucideIcon> = {
  users: Users,
  revenue: DollarSign,
  messages: MessageCircle,
  delivery: Send,
  sessions: Smartphone,
  response: Gauge,
};

const KPI_ICON_STYLES: Record<
  DashboardKpiCardData["iconKey"],
  string
> = {
  users: "bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-300",
  revenue:
    "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300",
  messages:
    "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-950 dark:text-fuchsia-300",
  delivery:
    "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300",
  sessions:
    "bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300",
  response:
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
};

type DashboardKpiCardProps = {
  data: DashboardKpiCardData;
  className?: string;
};

function resolveTrend(
  data: DashboardKpiCardData
): "positive" | "negative" | "neutral" {
  if (data.trend) return data.trend;
  if (data.trendPositive === false) return "negative";
  if (data.trendPositive === true) return "positive";
  return "neutral";
}

export function DashboardKpiCard({ data, className }: DashboardKpiCardProps) {
  const Icon = KPI_ICONS[data.iconKey];
  const iconStyle = KPI_ICON_STYLES[data.iconKey];
  const trend = resolveTrend(data);

  return (
    <Card
      className={cn(
        "border border-white/70 bg-white/90 shadow-sm shadow-violet-950/5 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/60",
        "rounded-xl transition-shadow duration-200 hover:shadow-md hover:shadow-violet-500/10 sm:rounded-2xl",
        className
      )}
    >
      <CardContent className="flex gap-3 p-4 sm:gap-4 sm:p-5">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl sm:size-10",
            iconStyle
          )}
        >
          <Icon className="size-4" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {data.label}
          </p>
          <p className="mt-0.5 text-xl font-semibold tracking-tight text-slate-900 tabular-nums sm:text-2xl dark:text-slate-50">
            {data.value}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[11px] dark:border-slate-800 sm:text-xs">
            <span className="text-muted-foreground">{data.period}</span>
            <Badge
              variant="outline"
              className={cn(
                "gap-0.5 rounded-md border-0 px-1.5 py-0 text-[11px] font-semibold sm:text-xs",
                trend === "positive" &&
                  "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300",
                trend === "negative" &&
                  "bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300",
                trend === "neutral" &&
                  "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              )}
            >
              {trend === "positive" ? (
                <ArrowUpRight className="size-3" />
              ) : trend === "negative" ? (
                <ArrowDownRight className="size-3" />
              ) : (
                <Minus className="size-3 opacity-70" />
              )}
              {data.changeLabel}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
