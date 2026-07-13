import { BrandMark } from "@/features/layout/components/brand-mark";
import { SidebarNav } from "@/features/layout/components/sidebar-nav";
import { SidebarFooter } from "@/features/layout/components/sidebar-footer";

export function AppSidebar() {
  return (
    <aside className="hidden h-[calc(100vh-1rem)] w-[238px] shrink-0 flex-col bg-white/92 py-5 shadow-[18px_0_45px_rgba(83,48,154,0.08)] dark:bg-slate-950/95 sm:h-[calc(100vh-2.5rem)] lg:flex lg:h-[calc(100vh-3.5rem)]">
      <div className="px-4">
        <BrandMark />
      </div>
      <div className="mx-4 my-4 h-px bg-violet-100 dark:bg-slate-800" />
      <SidebarNav />
      <SidebarFooter />
    </aside>
  );
}
