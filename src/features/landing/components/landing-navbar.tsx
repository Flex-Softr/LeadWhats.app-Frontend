"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Sparkles,
  UserCircle,
} from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { dashboardPath } from "@/config/app-routes";
import { userDisplayName, userInitials } from "@/lib/user-display";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LandingThemeToggle } from "@/features/landing/components/landing-theme-toggle";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { id: "features", label: "Features" },
  { id: "how", label: "How it works" },
  { id: "pricing", label: "Pricing" },
  { id: "complaints", label: "Complaints" },
  { id: "faq", label: "FAQ" },
] as const;

function scrollToId(id: string) {
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}

type LandingNavbarProps = {
  scrolled: boolean;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
};

export function LandingNavbar({
  scrolled,
  mobileNavOpen,
  setMobileNavOpen,
}: LandingNavbarProps) {
  const router = useRouter();
  const { user, isBootstrapping, isAuthenticated, logout } = useAuth();

  return (
    <header
      className={cn(
        "fixed w-full top-0 z-50 border-b transition-all duration-300 ",
        scrolled
          ? "border-slate-200/80 bg-white/80  shadow-violet-500/5 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/75"
          : "border-b shadow-xl bg-transparent shadow-none"
      )}
    >
      <div className="mx-auto flex max-w-full md:max-w-[80%] items-center justify-between gap-3 px-4 py-4 sm:gap-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4 lg:gap-8">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 font-semibold tracking-tight text-slate-900 dark:text-white"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25">
              <Sparkles className="size-5" strokeWidth={2} />
            </span>
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 bg-clip-text text-lg text-transparent dark:from-violet-400 dark:via-fuchsia-400 dark:to-indigo-300">
              FlexoWhats
            </span>
          </Link>
     </div>

     <div className="">
     <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToId(item.id)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-violet-500/10 hover:text-violet-700 dark:text-slate-300 dark:hover:text-violet-200"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <LandingThemeToggle />

        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger
            className="md:hidden"
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-xl"
                aria-label="Open menu"
              />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-[min(100%,320px)]">
            <SheetHeader>
            <div className="flex min-w-0 items-center gap-4 lg:gap-8">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 font-semibold tracking-tight text-slate-900 dark:text-white"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25">
              <Sparkles className="size-5" strokeWidth={2} />
            </span>
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 bg-clip-text text-lg text-transparent dark:from-violet-400 dark:via-fuchsia-400 dark:to-indigo-300">
              FlexoWhats
            </span>
          </Link>
     </div>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-1">
              {NAV_LINKS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setMobileNavOpen(false);
                    window.setTimeout(() => scrollToId(item.id), 0);
                  }}
                  className="rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-violet-500/10 dark:text-slate-200"
                >
                  {item.label}
                </button>
              ))}
              <div className="my-4 h-px bg-border" />
              {isBootstrapping ? (
                <div className="px-4 py-3">
                  <div className="h-9 w-full animate-pulse rounded-xl bg-muted" />
                </div>
              ) : isAuthenticated && user ? (
                <>
                  <div className="px-4 py-2 text-xs font-medium text-muted-foreground">
                    Signed in as
                  </div>
                  <p className="truncate px-4 pb-2 text-sm font-semibold text-foreground">
                    {userDisplayName(user)}
                  </p>
                  <Link
                    href={dashboardPath()}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-muted dark:text-slate-200"
                    onClick={() => setMobileNavOpen(false)}
                  >
                    Open dashboard
                  </Link>
                  <button
                    type="button"
                    className="rounded-xl px-4 py-3 text-left text-sm font-medium text-destructive hover:bg-destructive/10"
                    onClick={async () => {
                      setMobileNavOpen(false);
                      await logout();
                      router.refresh();
                    }}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-xl px-4 py-4 text-sm font-medium text-slate-700 hover:bg-muted dark:text-slate-200"
                    onClick={() => setMobileNavOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-xl px-4 py-3 text-sm font-semibold text-violet-600 hover:bg-violet-500/10 dark:text-violet-300"
                    onClick={() => setMobileNavOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        <div className="hidden min-w-0 items-center gap-2 sm:flex sm:gap-2">
          {isBootstrapping ? (
            <div className="h-9 w-[200px] max-w-[40vw] animate-pulse rounded-xl bg-muted" />
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 max-w-[min(280px,42vw)] gap-2 rounded-2xl border-slate-200/90 bg-white/90 px-2 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
                    aria-label="Open account menu"
                    aria-haspopup="menu"
                  />
                }
              >
                <Avatar className="size-8 border-0">
                  <AvatarFallback className="bg-gradient-to-br from-violet-600 to-fuchsia-600 text-xs font-semibold text-white">
                    {userInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1 truncate text-left text-sm font-medium text-slate-800 dark:text-slate-100">
                  {userDisplayName(user)}
                </span>
                <ChevronDown className="size-4 shrink-0 text-slate-500 dark:text-slate-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                side="bottom"
                sideOffset={8}
                className="min-w-[14rem] rounded-xl p-1.5"
              >
                <DropdownMenuLabel className="px-3 py-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium leading-tight">{userDisplayName(user)}</span>
                    <span className="truncate text-xs font-normal text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg px-3 py-2.5"
                  onClick={() => router.push(dashboardPath())}
                >
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg px-3 py-2.5"
                  onClick={() => router.push(dashboardPath("/profile"))}
                >
                  <UserCircle className="size-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer rounded-lg px-3 py-2.5"
                  onClick={async () => {
                    await logout();
                    router.refresh();
                  }}
                >
                  <LogOut className="size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="rounded-md border-1 border-indigo-100 dark:border-violet-900 py-4.5 shadow-sm" render={<Link href="/login" />}>
                Log in
              </Button>
              <Button
                size="sm"
                className="rounded-md border-none bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-5 text-white shadow-md shadow-violet-500/25 hover:from-violet-500 hover:to-fuchsia-500"
                render={<Link href="/register" />}
              >
                Register
              </Button>
            </>
          )}
        </div>
        </div>
      </div>
    </header>
  );
}
