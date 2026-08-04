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
        "flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-white/90 px-6 py-14 text-center shadow-sm dark:border-border dark:bg-slate-950/80",
        className
      )}
    >
      <div className="flex size-16 items-center justify-center rounded-lg bg-muted text-foreground ring-1 ring-border dark:bg-muted/50 dark:text-foreground dark:ring-border">
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
