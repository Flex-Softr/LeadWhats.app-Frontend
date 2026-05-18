"use client";

import { FileText, MessageSquare } from "lucide-react";

import { cn } from "@/lib/utils";

export type MessageFormType = "text" | "template";

type MessageTypeCardsProps = {
  value: MessageFormType;
  onChange: (value: MessageFormType) => void;
};

export function MessageTypeCards({ value, onChange }: MessageTypeCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => onChange("text")}
        className={cn(
          "flex flex-col items-start gap-2 rounded-md border-2 p-4 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30",
          value === "text"
            ? "border-blue-500 bg-blue-50/80 text-blue-950 shadow-sm dark:border-blue-400 dark:bg-blue-950/40 dark:text-blue-100"
            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:border-slate-700"
        )}
      >
        <MessageSquare
          className={cn(
            "size-6",
            value === "text"
              ? "text-blue-600 dark:text-blue-400"
              : "text-slate-400"
          )}
        />
        <span
          className={cn(
            "font-semibold",
            value === "text"
              ? "text-blue-900 dark:text-blue-100"
              : "text-slate-900 dark:text-slate-100"
          )}
        >
          Text Message
        </span>
        <span className="text-sm opacity-90">
          Text with optional attachment
        </span>
      </button>

      <button
        type="button"
        onClick={() => onChange("template")}
        className={cn(
          "flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30",
          value === "template"
            ? "border-violet-500 bg-violet-50/80 text-violet-950 shadow-sm dark:border-violet-400 dark:bg-violet-950/40 dark:text-violet-100"
            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:border-slate-700"
        )}
      >
        <FileText
          className={cn(
            "size-6",
            value === "template"
              ? "text-violet-600 dark:text-violet-400"
              : "text-slate-400"
          )}
        />
        <span
          className={cn(
            "font-semibold",
            value === "template"
              ? "text-violet-900 dark:text-violet-100"
              : "text-slate-900 dark:text-slate-100"
          )}
        >
          Template Message
        </span>
        <span className="text-sm opacity-90">Use saved template</span>
      </button>
    </div>
  );
}
