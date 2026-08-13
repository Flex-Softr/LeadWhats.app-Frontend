"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { getNavItemsForRole } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export function SidebarNav({
  onNavigate,
  isCollapsed,
}: {
  onNavigate?: () => void;
  isCollapsed?: boolean;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const navItems = getNavItemsForRole(user?.role);
  const normalizedPath =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  return (
    <ScrollArea className="min-h-0 flex-1 px-2.5">
      <nav className="flex flex-col gap-1.5 pb-5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/" || item.href === "/admin"
              ? normalizedPath === item.href
              : normalizedPath === item.href ||
                normalizedPath.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={isCollapsed ? item.title : undefined}
              className={cn(
                "group flex min-h-11 cursor-pointer items-center rounded-xl transition-all duration-200",
                isCollapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
                active
                  ? "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-md shadow-violet-600/25 ring-1 ring-white/20"
                  : "text-slate-600 hover:bg-violet-500/10 hover:text-violet-950 dark:text-slate-300 dark:hover:bg-violet-500/20 dark:hover:text-white"
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
                  active
                    ? "bg-white/20 text-white shadow-inner"
                    : "bg-slate-100/80 text-slate-600 group-hover:bg-violet-100 group-hover:text-violet-700 dark:bg-slate-850 dark:text-slate-400 dark:group-hover:bg-violet-900/60 dark:group-hover:text-violet-300"
                )}
              >
                <Icon
                  className="size-[18px] shrink-0"
                  strokeWidth={active ? 2.4 : 2}
                />
              </span>
              {!isCollapsed && (
                <>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block truncate text-[13.5px] font-bold leading-tight tracking-tight transition-colors",
                        active
                          ? "text-white"
                          : "text-slate-800 group-hover:text-violet-950 dark:text-slate-200 dark:group-hover:text-white"
                      )}
                    >
                      {item.title}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 block truncate text-[11px] font-medium leading-tight transition-colors",
                        active
                          ? "text-violet-100/90"
                          : "text-slate-500 group-hover:text-violet-800/90 dark:text-slate-400 dark:group-hover:text-slate-300"
                      )}
                    >
                      {item.description}
                    </span>
                  </span>
                  <ChevronRight
                    className={cn(
                      "size-4 shrink-0 transition-transform duration-200",
                      active
                        ? "text-white opacity-90 translate-x-0.5"
                        : "text-slate-400 opacity-60 group-hover:translate-x-0.5 group-hover:opacity-100 group-hover:text-violet-600 dark:text-slate-500 dark:group-hover:text-violet-400"
                    )}
                  />
                </>
              )}
            </Link>
          );
        })}
      </nav>
    </ScrollArea>
  );
}
