"use client";

import { FileText, MessageSquare } from "lucide-react";

import type { MessageFormType } from "@/features/single-message/components/message-type-cards";
import { cn } from "@/lib/utils";

type NodeMessageTypeCardsProps = {
  value: MessageFormType;
  onChange: (value: MessageFormType) => void;
};

/** Message vs template cards for flow nodes (blue accent for both selected states). */
export function NodeMessageTypeCards({
  value,
  onChange,
}: NodeMessageTypeCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => onChange("text")}
        className={cn(
          "flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30",
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
          Custom text with attachments
        </span>
      </button>

      <button
        type="button"
        onClick={() => onChange("template")}
        className={cn(
          "flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30",
          value === "template"
            ? "border-blue-500 bg-blue-50/80 text-blue-950 shadow-sm dark:border-blue-400 dark:bg-blue-950/40 dark:text-blue-100"
            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:border-slate-700"
        )}
      >
        <FileText
          className={cn(
            "size-6",
            value === "template"
              ? "text-blue-600 dark:text-blue-400"
              : "text-slate-400"
          )}
        />
        <span
          className={cn(
            "font-semibold",
            value === "template"
              ? "text-blue-900 dark:text-blue-100"
              : "text-slate-900 dark:text-slate-100"
          )}
        >
          Template
        </span>
        <span className="text-sm opacity-90">Use predefined template</span>
      </button>
    </div>
  );
}
