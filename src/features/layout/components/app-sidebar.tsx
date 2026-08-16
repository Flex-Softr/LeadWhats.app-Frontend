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
      className={`hidden h-full flex-col border-r border-sidebar-border bg-sidebar py-5 text-sidebar-foreground shadow-[18px_0_45px_rgba(83,48,154,0.04)] backdrop-blur-xl transition-[width] duration-300 ease-in-out lg:flex ${
        isCollapsed ? "w-[72px]" : "w-[240px]"
      }`}
    >
      <div
        className={`flex items-center ${
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
            className="size-8 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="size-4" />
          </Button>
        )}
      </div>

      {isCollapsed && (
        <div className="mt-2 flex justify-center">
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

      <div className="mx-4 my-3.5 h-px bg-sidebar-border" />

      <SidebarNav isCollapsed={isCollapsed} />
      <SidebarFooter isCollapsed={isCollapsed} />
    </aside>
  );
}
