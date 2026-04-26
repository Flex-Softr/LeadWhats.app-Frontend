"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Moon, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { getAdminNavMeta } from "@/config/admin-navigation";
import { Button } from "@/components/ui/button";

export function AdminHeader() {
  const pathname = usePathname();
  const meta = getAdminNavMeta(pathname);
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 px-5 py-4 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/50 sm:px-7 sm:py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-50">
            {meta.title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            {meta.description}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="size-10 rounded-xl"
          >
            {mounted ? (
              isDark ? (
                <SunMedium className="size-[18px]" />
              ) : (
                <Moon className="size-[18px]" />
              )
            ) : (
              <Moon className="size-[18px]" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-slate-200 dark:border-slate-700"
            render={
              <Link href="/" className="inline-flex items-center gap-2" />
            }
          >
            <ArrowLeft className="size-4" />
            Customer app
          </Button>
        </div>
      </div>
    </header>
  );
}
