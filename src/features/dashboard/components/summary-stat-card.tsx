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
    <Card className="rounded-lg border-0 bg-white shadow-[0_18px_45px_rgba(77,53,128,0.08)] dark:bg-slate-900">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-5 pb-1 pt-5">
        <CardTitle className="text-sm font-bold text-[#251c32] dark:text-slate-100">
          {data.title}
        </CardTitle>
        <span className="flex size-9 items-center justify-center rounded-lg bg-[#f0eaff] text-[#6d45c8] dark:bg-slate-800 dark:text-violet-300">
          <Icon className="size-4" />
        </span>
      </CardHeader>
      <CardContent className="space-y-4 px-5 pb-5">
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
          <div className="h-2 overflow-hidden rounded-full bg-[#eee9f8] dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#7d58d6] to-[#f05ad6]"
              style={{ width: `${Math.min(data.progress, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
