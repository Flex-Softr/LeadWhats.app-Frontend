"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  CreditCard,
  Menu,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
    <header className="sticky top-0 z-40 border-b border-violet-100/80 bg-[#f7f4fc]/92 px-4 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/92 sm:px-6 lg:px-7">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:gap-7">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <MobileSidebar />
          <div className="hidden size-9 shrink-0 items-center justify-center rounded-lg text-[#3c2a52] lg:flex dark:text-slate-200">
            <Menu className="size-6" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-extrabold tracking-tight text-[#1f172b] sm:text-2xl dark:text-slate-50">
              {meta.title}
            </h1>
            <p className="mt-0.5 max-w-2xl truncate text-xs font-medium text-slate-400 sm:text-sm dark:text-slate-500">
              {meta.description}
            </p>
          </div>
        </div>

        <div className="flex w-full flex-1 items-center xl:max-w-md 2xl:max-w-lg">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute right-4 top-1/2 size-[18px] -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Search here..."
              className="h-12 w-full rounded-full border-0 bg-white pl-5 pr-12 text-[14px] shadow-[0_12px_32px_rgba(66,48,106,0.08)] placeholder:text-slate-400 dark:bg-slate-900 dark:shadow-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 md:justify-end sm:gap-2.5">
          <div className="flex items-center justify-end gap-2 sm:gap-2.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="size-10 rounded-full text-[#6d45c8] hover:bg-white dark:text-violet-300 dark:hover:bg-slate-900"
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
            className="relative size-10 rounded-full text-[#6d45c8] hover:bg-white dark:text-violet-300 dark:hover:bg-slate-900"
            aria-label="Notifications"
          >
            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-pink-500 ring-2 ring-[#f7f4fc] dark:ring-slate-950" />
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
                  className="h-12 shrink-0 gap-1.5 rounded-full border-0 bg-white px-2.5 shadow-[0_12px_30px_rgba(66,48,106,0.1)] dark:bg-slate-900 dark:shadow-none"
                  aria-label="Open account menu"
                  aria-haspopup="menu"
                />
              }
            >
              <Avatar className="size-10 border-2 border-white shadow-sm">
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
