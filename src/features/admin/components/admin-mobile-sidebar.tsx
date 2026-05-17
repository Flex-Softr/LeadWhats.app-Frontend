"use client";

import * as React from "react";
import { Menu } from "lucide-react";

import { AdminBrandMark } from "@/features/admin/components/admin-brand-mark";
import { AdminSidebarFooter } from "@/features/admin/components/admin-sidebar-footer";
import { AdminSidebarNav } from "@/features/admin/components/admin-sidebar-nav";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function AdminMobileSidebar() {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden p-2 shadow-sm border-1"
            aria-label="Open admin navigation"
          />
        }
      >
        <Menu className="size-" />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[300px] gap-0 border-slate-200/80 bg-white/95 p-0 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 sm:w-[308px]"
      >
        <div className="flex h-full flex-col px-5 py-7 sm:px-6 sm:py-8">
          <AdminBrandMark />
          <div className="my-5 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />
          <AdminSidebarNav onNavigate={() => setOpen(false)} />
          <AdminSidebarFooter />
        </div>
      </SheetContent>
    </Sheet>
  );
}
