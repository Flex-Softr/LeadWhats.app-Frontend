"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { NAV_ITEMS } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const normalizedPath =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  return (
    <ScrollArea className="min-h-0 flex-1 px-3">
      <nav className="flex flex-col gap-2 pb-5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/"
              ? normalizedPath === "/"
              : normalizedPath === item.href ||
                normalizedPath.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex min-h-[3.25rem] cursor-pointer items-center gap-3.5 rounded-2xl px-4 py-3 transition-all duration-200 sm:min-h-[3.5rem] sm:py-3.5",
                active
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/30"
                  : "text-slate-600 hover:bg-white/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100"
              )}
            >
              <Icon
                className={cn(
                  "size-5 shrink-0 transition-colors",
                  active
                    ? "text-white"
                    : "text-slate-400 group-hover:text-violet-600 dark:text-slate-500 dark:group-hover:text-violet-400"
                )}
                strokeWidth={active ? 2.25 : 2}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold leading-snug">
                  {item.title}
                </span>
                <span
                  className={cn(
                    "mt-1 block text-xs font-medium leading-snug",
                    active
                      ? "text-white/85"
                      : "text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400"
                  )}
                >
                  {item.description}
                </span>
              </span>
              <ChevronRight
                className={cn(
                  "size-4 shrink-0 opacity-70 transition-transform duration-200 sm:size-[18px]",
                  active
                    ? "text-white/90"
                    : "text-slate-300 group-hover:translate-x-0.5 group-hover:text-violet-400 dark:text-slate-600"
                )}
              />
            </Link>
          );
        })}
      </nav>
    </ScrollArea>
  );
}
