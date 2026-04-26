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
        "flex flex-col items-center justify-center gap-3 py-16 text-center",
        className
      )}
    >
      <div className="flex size-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900">
        <Icon className="size-8 text-slate-400" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-slate-900 dark:text-slate-50">
          {title}
        </p>
        <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}
