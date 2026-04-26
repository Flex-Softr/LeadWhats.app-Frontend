import Link from "next/link";
import { Shield } from "lucide-react";

import { ADMIN_BASE_PATH } from "@/config/admin-navigation";

export function AdminBrandMark() {
  return (
    <Link
      href={ADMIN_BASE_PATH}
      className="flex items-center gap-3.5 py-1 outline-none transition-opacity hover:opacity-90"
    >
      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-amber-400 shadow-lg shadow-slate-900/30 ring-1 ring-white/10 dark:from-slate-800 dark:via-slate-900 dark:to-black dark:text-amber-300">
        <Shield className="size-[22px]" strokeWidth={2} />
      </div>
      <div className="min-w-0 leading-tight">
        <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          FlexoWhats
        </p>
        <p className="mt-0.5 truncate text-xs font-semibold uppercase tracking-wider text-amber-700/90 dark:text-amber-400/90">
          Admin console
        </p>
      </div>
    </Link>
  );
}
