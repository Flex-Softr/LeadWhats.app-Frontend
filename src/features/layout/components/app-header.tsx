"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  CreditCard,
  LogOut,
  Moon,
  Search,
  SunMedium,
  UserCircle,
} from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";

import { useAuth } from "@/components/providers/auth-provider";
import { getPageMeta } from "@/config/pages";
import { useSubscription } from "@/features/billing/subscription-context";
import { userDisplayName, userInitials } from "@/lib/user-display";
import { MobileSidebar } from "@/features/layout/components/mobile-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const meta = getPageMeta(pathname);
  const { license, hydrated } = useSubscription();
  const { user: authUser, logout } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <header className="sticky top-0 z-40 rounded-t-[1.75rem] border-b border-white/50 bg-white/55 px-5 py-4 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/40 sm:px-7 sm:py-5 lg:px-9 lg:py-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-7">
        <div className="flex min-w-0 flex-1 items-start gap-3">
         
          <div className="min-w-0 pt-1 lg:pt-0.5">
            <h1 className="truncate text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-50">
              {meta.title}
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-[15px] dark:text-slate-400">
              {meta.description}
            </p>
          </div>
        </div>

        <div className="flex w-full flex-1 items-center lg:max-w-md xl:max-w-lg">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search..."
              className="h-12 w-full rounded-lg border-slate-200/80 bg-white/70 pl-12 text-[15px] shadow-inner shadow-slate-900/5 dark:border-slate-700/80 dark:bg-slate-900/50"
            />
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-2.5">
        <div>
          <MobileSidebar />
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-2.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="size-10 rounded-lg text-slate-600 dark:text-slate-300 shadow-xs shadow-[#9b18d1]"
          >
            {mounted ? (
              isDark ? (
                <SunMedium className="size-[20px]" />
              ) : (
                <Moon className="size-[20px]" />
              )
            ) : (
              <Moon className="size-[20px]" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-10 rounded-lg text-slate-600 dark:text-slate-300 shadow-xs shadow-[#9b18d1]"
            aria-label="Notifications"
          >
            <Bell className="size-[20px]" />
          </Button>

          <div className="hidden flex-col items-end px-1 text-right sm:flex">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
              {hydrated ? license.tierLabel : "…"}
            </span>
            <div className="mt-1 flex items-center justify-end gap-2">
              {hydrated && license.isUpgraded ? (
                <Badge className="h-6 rounded-lg border-emerald-200/80 bg-emerald-50 px-2 text-xs font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                  {license.statusLabel}
                </Badge>
              ) : null}
              {hydrated && license.daysRemaining != null ? (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {license.daysRemaining}d left
                </span>
              ) : null}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  className="h-11 shrink-0 gap-1.5 rounded-lg border-slate-200/90 bg-white/80 px-2 shadow-sm dark:border-slate-700 dark:bg-slate-900/60"
                  aria-label="Open account menu"
                  aria-haspopup="menu"
                />
              }
            >
              <Avatar className="size-9 border-0">
                <AvatarFallback className="bg-gradient-to-br from-violet-600 to-fuchsia-600 text-xs font-semibold text-white">
                  {authUser ? userInitials(authUser) : "?"}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="size-4 text-slate-500 dark:text-slate-400" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side="bottom"
              sideOffset={8}
              className="min-w-[13.5rem] rounded-lg p-1.5"
            >
              <DropdownMenuLabel className="px-3 py-2">
                <div className="flex flex-col gap-1">
                  <span className="font-medium leading-tight">
                    {authUser ? userDisplayName(authUser) : "Account"}
                  </span>
                  {authUser ? (
                    <span className="truncate text-xs font-normal text-muted-foreground">
                      {authUser.email}
                    </span>
                  ) : null}
                  <span className="text-xs font-normal text-muted-foreground">
                    {hydrated ? license.tierLabel : "…"}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer rounded-lg px-3 py-2.5"
                onClick={() => router.push("/profile")}
              >
                <UserCircle className="size-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer rounded-lg px-3 py-2.5"
                onClick={() => router.push("/billing")}
              >
                <CreditCard className="size-4" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer rounded-lg px-3 py-2.5"
                onClick={async () => {
                  await logout();
                  router.push("/login");
                }}
              >
                <LogOut className="size-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div> 
    </header>
  );
}
