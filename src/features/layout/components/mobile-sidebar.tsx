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
            className="lg:hidden size-10 shrink-0 rounded-full bg-white text-[#6d45c8] shadow-[0_10px_24px_rgba(66,48,106,0.1)] dark:bg-slate-900 dark:text-violet-300"
            aria-label="Open navigation"
          />
        }
      >
        <Menu className="size-[20px]" />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[300px] gap-0 border-white/50 bg-white/95 p-0 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 sm:w-[308px]"
      >
        <div className="flex h-full flex-col px-4 py-6">
          <BrandMark />
          <div className="my-4 h-px bg-violet-100 dark:bg-slate-800" />
          <SidebarNav onNavigate={() => setOpen(false)} />
          <SidebarFooter />
        </div>
      </SheetContent>
    </Sheet>
  );
}
