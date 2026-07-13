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
          "flex min-h-32 flex-col items-start gap-2 rounded-lg border p-4 text-left shadow-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30",
          value === "text"
            ? "border-violet-200 bg-violet-50 text-violet-950 ring-2 ring-violet-500/15 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-100"
            : "border-slate-100 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50/40 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:border-violet-900 dark:hover:bg-violet-950/20"
        )}
      >
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-lg",
            value === "text"
              ? "bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-200"
              : "bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400"
          )}
        >
          <MessageSquare className="size-5" />
        </span>
        <span
          className={cn(
            "font-semibold",
            value === "text"
              ? "text-violet-900 dark:text-violet-100"
              : "text-slate-900 dark:text-slate-100"
          )}
        >
          Text Message
        </span>
        <span className="text-sm leading-5 text-slate-500 dark:text-slate-400">
          Write a direct one-off WhatsApp message.
        </span>
      </button>

      <button
        type="button"
        onClick={() => onChange("template")}
        className={cn(
          "flex min-h-32 flex-col items-start gap-2 rounded-lg border p-4 text-left shadow-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30",
          value === "template"
            ? "border-violet-200 bg-violet-50 text-violet-950 ring-2 ring-violet-500/15 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-100"
            : "border-slate-100 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50/40 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:border-violet-900 dark:hover:bg-violet-950/20"
        )}
      >
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-lg",
            value === "template"
              ? "bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-200"
              : "bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400"
          )}
        >
          <FileText className="size-5" />
        </span>
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
        <span className="text-sm leading-5 text-slate-500 dark:text-slate-400">
          Send from your saved template library.
        </span>
      </button>
    </div>
  );
}
