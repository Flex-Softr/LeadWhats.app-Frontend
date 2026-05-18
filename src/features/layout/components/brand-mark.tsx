import { Sparkles } from "lucide-react";

export function BrandMark() {
  return (
    <div className="flex items-center gap-3.5 py-1 px-3">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25">
        <Sparkles className="size-[22px]" strokeWidth={2} />
      </div>
      <div className="min-w-0 leading-tight">
        <p className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 bg-clip-text text-xl font-bold tracking-tight text-transparent dark:from-violet-400 dark:via-fuchsia-400 dark:to-indigo-400">
          FlexoWhats
        </p>
        <p className="mt-0.5 truncate text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
          WhatsApp Studio
        </p>
      </div>
    </div>
  );
}
