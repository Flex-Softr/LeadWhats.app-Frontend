import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type ListEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
};

export function ListEmptyState({
  icon: Icon,
  title,
  description,
  className,
}: ListEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-violet-200 bg-white/90 px-6 py-14 text-center shadow-sm dark:border-violet-900/60 dark:bg-slate-950/80",
        className
      )}
    >
      <div className="flex size-16 items-center justify-center rounded-lg bg-violet-50 text-violet-600 ring-1 ring-violet-100 dark:bg-violet-950/50 dark:text-violet-200 dark:ring-violet-900">
        <Icon className="size-8" />
      </div>
      <div className="space-y-2">
        <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          {title}
        </p>
        <p className="max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}
