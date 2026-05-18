"use client";

import Link from "next/link";

import type { SystemStatus } from "@/types/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statusCopy: Record<
  SystemStatus,
  { label: string; className: string }
> = {
  online: {
    label: "Online",
    className:
      "border-emerald-200/80 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  },
  offline: {
    label: "Offline",
    className:
      "border-red-200/80 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200",
  },
  degraded: {
    label: "Degraded",
    className:
      "border-amber-200/80 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
  },
};

type SystemStatusBarProps = {
  status: SystemStatus;
  lastUpdated: string;
};

export function SystemStatusBar({ status, lastUpdated }: SystemStatusBarProps) {
  const cfg = statusCopy[status];

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-white/70 bg-white/80 px-4 py-3 text-xs shadow-sm shadow-violet-950/5 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/50 sm:flex-row sm:items-center sm:justify-between sm:text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-slate-700 dark:text-slate-200">
          System Status:
        </span>
        <Badge
          variant="outline"
          className={`rounded-md px-2 py-0 text-[11px] font-semibold sm:text-xs ${cfg.className}`}
        >
          {cfg.label}
        </Badge>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-500 dark:text-slate-400">
        <span>Last updated · {lastUpdated}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="link"
            className="h-auto rounded-md p-0 text-xs sm:text-sm"
            render={<Link href="/billing" />}
          >
            License
          </Button>
          <Button
            type="button"
            variant="link"
            className="h-auto rounded-md p-0 text-xs sm:text-sm"
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}
