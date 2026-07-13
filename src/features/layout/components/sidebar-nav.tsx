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
      <nav className="flex flex-col gap-1 pb-5">
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
                "group flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3.5 py-2.5 transition-all duration-200",
                active
                  ? "bg-[#f0eaff] text-[#5630a7] shadow-[inset_4px_0_0_#7d58d6]"
                  : "text-slate-600 hover:bg-[#f7f2ff] hover:text-[#5630a7] dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-violet-300"
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                  active
                    ? "bg-white text-[#6d45c8] shadow-sm"
                    : "bg-transparent text-slate-400 group-hover:bg-white group-hover:text-[#6d45c8] dark:group-hover:bg-slate-800"
                )}
              >
              <Icon
                className={cn(
                  "size-[18px] shrink-0 transition-colors",
                  active
                    ? "text-[#6d45c8]"
                    : "text-current"
                )}
                strokeWidth={active ? 2.3 : 2}
              />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold leading-snug">
                  {item.title}
                </span>
                <span
                  className={cn(
                    "mt-0.5 block truncate text-[11px] font-medium leading-snug",
                    active
                      ? "text-[#8a75b5]"
                      : "text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400"
                  )}
                >
                  {item.description}
                </span>
              </span>
              <ChevronRight
                className={cn(
                  "size-4 shrink-0 opacity-70 transition-transform duration-200",
                  active
                    ? "text-[#6d45c8]"
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
