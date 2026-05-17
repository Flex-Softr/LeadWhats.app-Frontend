import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export type StatCardAccent =
  | "blue"
  | "green"
  | "amber"
  | "red"
  | "slate"
  | "violet"
  | "indigo";

const accentMap: Record<
  StatCardAccent,
  { icon: string; value: string }
> = {
  blue: {
    icon: "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    value: "text-slate-900 dark:text-slate-50",
  },
  green: {
    icon: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
    value: "text-slate-900 dark:text-slate-50",
  },
  amber: {
    icon: "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
    value: "text-slate-900 dark:text-slate-50",
  },
  red: {
    icon: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400",
    value: "text-slate-900 dark:text-slate-50",
  },
  slate: {
    icon: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    value: "text-slate-900 dark:text-slate-50",
  },
  violet: {
    icon: "bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
    value: "text-slate-900 dark:text-slate-50",
  },
  indigo: {
    icon: "bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400",
    value: "text-slate-900 dark:text-slate-50",
  },
};

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: StatCardAccent;
  className?: string;
};

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "slate",
  className,
}: StatCardProps) {
  const a = accentMap[accent];

  return (
    <Card
      className={cn(
        "rounded-lg border cursor-pointer border-white/70 bg-white/90 shadow-md shadow-violet-950/5 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/60 sm:rounded-lg",
        className
      )}
    >
      <CardContent className="flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl sm:size-11",
            a.icon
          )}
        >
          <Icon className="size-[18px] sm:size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium leading-tight text-slate-500 sm:text-sm dark:text-slate-400">
            {label}
          </p>
          <p
            className={cn(
              "mt-1 text-2xl font-semibold tabular-nums sm:text-[30px]",
              a.value
            )}
          >
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
