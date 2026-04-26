"use client";

import * as React from "react";
import { Menu } from "lucide-react";

import { BrandMark } from "@/features/layout/components/brand-mark";
import { SidebarFooter } from "@/features/layout/components/sidebar-footer";
import { SidebarNav } from "@/features/layout/components/sidebar-nav";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileSidebar() {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
          />
        }
      >
        <Menu />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[300px] gap-0 border-white/50 bg-white/95 p-0 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 sm:w-[308px]"
      >
        <div className="flex h-full flex-col px-5 py-7 sm:px-6 sm:py-8">
          <BrandMark />
          <div className="my-5 h-px bg-gradient-to-r from-transparent via-violet-200/80 to-transparent dark:via-violet-900/60" />
          <SidebarNav onNavigate={() => setOpen(false)} />
          <SidebarFooter />
        </div>
      </SheetContent>
    </Sheet>
  );
}
