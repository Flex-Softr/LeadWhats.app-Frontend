import type { LucideIcon } from "lucide-react";
import {
  ArrowDownRight,
  ArrowUpRight,
  ContactRound,
  DollarSign,
  Gauge,
  Megaphone,
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
  contacts: ContactRound,
  campaigns: Megaphone,
};

const KPI_ICON_STYLES: Record<
  DashboardKpiCardData["iconKey"],
  string
> = {
  users: "bg-muted text-foreground dark:bg-muted dark:text-muted-foreground",
  revenue:
    "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300",
  messages:
    "bg-muted text-foreground dark:bg-muted dark:text-muted-foreground",
  delivery:
    "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300",
  sessions:
    "bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300",
  response:
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  contacts:
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  campaigns:
    "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300",
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
  const Icon = KPI_ICONS[data.iconKey] ?? MessageCircle;
  const iconStyle =
    KPI_ICON_STYLES[data.iconKey] ?? KPI_ICON_STYLES.messages;
  const trend = resolveTrend(data);

  return (
    <Card
      className={cn(
        "rounded-lg border-0 bg-card shadow-sm transition-transform duration-200 hover:-translate-y-0.5",
        className
      )}
    >
      <CardContent className="flex gap-4 p-5">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            iconStyle
          )}
        >
          <Icon className="size-4" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-card-foreground">
            {data.label}
          </p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
            {data.value}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
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
