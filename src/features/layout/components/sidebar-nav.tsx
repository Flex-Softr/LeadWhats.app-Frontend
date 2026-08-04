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
                "group flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 transition-all duration-200",
                active
                  ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                  : "text-muted-foreground hover:bg-card/70 hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                  active
                    ? "bg-foreground text-background"
                    : "bg-transparent text-muted-foreground group-hover:bg-muted group-hover:text-foreground"
                )}
              >
                <Icon
                  className="size-[18px] shrink-0"
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
                      ? "text-muted-foreground"
                      : "text-muted-foreground/80 group-hover:text-muted-foreground"
                  )}
                >
                  {item.description}
                </span>
              </span>
              <ChevronRight
                className={cn(
                  "size-4 shrink-0 opacity-70 transition-transform duration-200",
                  active
                    ? "text-foreground"
                    : "text-border group-hover:translate-x-0.5 group-hover:text-muted-foreground"
                )}
              />
            </Link>
          );
        })}
      </nav>
    </ScrollArea>
  );
}
