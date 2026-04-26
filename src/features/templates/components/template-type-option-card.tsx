"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type TemplateTypeOptionCardProps = {
  label: string;
  icon: LucideIcon;
  selected: boolean;
  onSelect: () => void;
};

export function TemplateTypeOptionCard({
  label,
  icon: Icon,
  selected,
  onSelect,
}: TemplateTypeOptionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex flex-col items-center gap-2 rounded-lg border-2 p-3 text-center text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 sm:text-[13px]",
        selected
          ? "border-blue-500 bg-blue-50/90 text-blue-700 shadow-sm dark:border-blue-400 dark:bg-blue-950/50 dark:text-blue-200"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-slate-700"
      )}
    >
      <Icon
        className={cn(
          "size-5 sm:size-6",
          selected
            ? "text-blue-600 dark:text-blue-400"
            : "text-slate-400 dark:text-slate-500"
        )}
      />
      <span className="leading-tight">{label}</span>
    </button>
  );
}
