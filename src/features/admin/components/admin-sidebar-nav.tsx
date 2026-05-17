"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import {
  ADMIN_BASE_PATH,
  ADMIN_NAV_SECTIONS,
} from "@/config/admin-navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

function normalizePath(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function isNavActive(href: string, pathname: string) {
  const n = normalizePath(pathname);
  if (href === ADMIN_BASE_PATH) {
    return n === ADMIN_BASE_PATH;
  }
  return n === href || n.startsWith(`${href}/`);
}

export function AdminSidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <ScrollArea className="min-h-0 flex-1 px-3">
      <nav className="flex flex-col gap-6 pb-6">
        {ADMIN_NAV_SECTIONS.map((section) => (
          <div key={section.id}>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {section.label}
            </p>
            <div className="flex flex-col gap-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isNavActive(item.href, pathname);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group flex min-h-[3rem] cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
                      active
                        ? "bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-md shadow-slate-900/25 dark:from-slate-700 dark:to-slate-800"
                        : "text-slate-600 hover:bg-white/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-[18px] shrink-0 transition-colors",
                        active
                          ? "text-amber-400"
                          : "text-slate-400 group-hover:text-amber-600 dark:text-slate-500 dark:group-hover:text-amber-400"
                      )}
                      strokeWidth={active ? 2.25 : 2}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-semibold leading-snug">
                        {item.title}
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 block text-[11px] font-medium leading-snug",
                          active
                            ? "text-white/75"
                            : "text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400"
                        )}
                      >
                        {item.description}
                      </span>
                    </span>
                    <ChevronRight
                      className={cn(
                        "size-4 shrink-0 opacity-60 transition-transform duration-200",
                        active
                          ? "text-white/80"
                          : "text-slate-300 group-hover:translate-x-0.5 group-hover:text-amber-500 dark:text-slate-600"
                      )}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </ScrollArea>
  );
}
