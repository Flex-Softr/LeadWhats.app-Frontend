"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
    <ScrollArea className="min-h-0 flex-1 px-3 py-3">
      <nav className="flex flex-col gap-1">
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
                "group flex h-10 cursor-pointer items-center rounded-lg text-sm font-medium transition-colors duration-150",
                isCollapsed ? "justify-center px-2" : "gap-3 px-3",
                active
                  ? "bg-primary/10 font-semibold text-primary dark:bg-primary/20 dark:text-primary"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon
                className="size-[18px] shrink-0"
                strokeWidth={active ? 2.2 : 1.8}
              />
              {!isCollapsed && (
                <span className="truncate">{item.title}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </ScrollArea>
  );
}
