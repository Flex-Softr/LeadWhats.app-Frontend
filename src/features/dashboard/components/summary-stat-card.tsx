import { Bot, FileText, Send, Zap } from "lucide-react";

import type { SummaryCardData } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const summaryIcons = {
  reply: Zap,
  bulk: Send,
  bot: Bot,
  template: FileText,
} as const;

export function SummaryStatCard({ data }: { data: SummaryCardData }) {
  const Icon = summaryIcons[data.icon];

  return (
    <Card className="rounded-lg border border-white/70 bg-white/90 shadow-sm shadow-violet-950/5 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/60 sm:rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pb-1 pt-4 sm:px-5 sm:pt-5">
        <CardTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {data.title}
        </CardTitle>
        <Icon className="size-4 text-slate-400" />
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4 sm:px-5 sm:pb-5">
        <div className="grid gap-2 text-xs sm:text-sm">
          {data.rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-2 text-slate-600 dark:text-slate-300"
            >
              <span className="text-slate-500 dark:text-slate-400">
                {row.label}
              </span>
              <span className="font-medium tabular-nums text-slate-900 dark:text-slate-50">
                {row.value}
              </span>
            </div>
          ))}
        </div>
        <div>
          <div className="mb-1.5 flex justify-between text-[11px] font-medium text-slate-500 sm:text-xs dark:text-slate-400">
            <span>Utilization</span>
            <span>{data.progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500"
              style={{ width: `${Math.min(data.progress, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
