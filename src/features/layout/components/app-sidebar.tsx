"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { BrandMark } from "@/features/layout/components/brand-mark";
import { SidebarNav } from "@/features/layout/components/sidebar-nav";
import { SidebarFooter } from "@/features/layout/components/sidebar-footer";
import { useSidebar } from "@/features/layout/sidebar-context";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <aside
      className={`hidden h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-in-out lg:flex ${
        isCollapsed ? "w-[72px]" : "w-[240px]"
      }`}
    >
      <div
        className={`flex h-16 shrink-0 items-center border-b border-sidebar-border ${
          isCollapsed ? "justify-center px-2" : "justify-between px-4"
        }`}
      >
        <BrandMark isCollapsed={isCollapsed} />
        {!isCollapsed && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="size-8 shrink-0 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="size-4" />
          </Button>
        )}
      </div>

      {isCollapsed && (
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="size-8 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            title="Expand sidebar"
          >
            <PanelLeftOpen className="size-4" />
          </Button>
        </div>
      )}

      <SidebarNav isCollapsed={isCollapsed} />
      <SidebarFooter isCollapsed={isCollapsed} />
    </aside>
  );
}
