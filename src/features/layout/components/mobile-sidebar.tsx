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
            className="lg:hidden size-10 shrink-0 rounded-full bg-card text-foreground shadow-sm"
            aria-label="Open navigation"
          />
        }
      >
        <Menu className="size-[20px]" />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[300px] gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground backdrop-blur-xl sm:w-[308px]"
      >
        <div className="flex h-full flex-col px-4 py-6">
          <BrandMark />
          <div className="my-4 h-px bg-sidebar-border" />
          <SidebarNav onNavigate={() => setOpen(false)} />
          <SidebarFooter />
        </div>
      </SheetContent>
    </Sheet>
  );
}
